import type { Request, Response } from "express";
import { produtoSchema } from "../schemas/produtosSchema.ts";
import {
  createProdutosModel,
  deleteProdutoByNameModel,
  getAllProdutosModel,
  updateProdutoByNameModel,
} from "../model/produtosModel.ts";
import { getProdutoByNameModel } from "../model/produtosModel.ts";
import { getInsumoByNameModel } from "../model/insumosModel.ts";

export async function createProdutoController(req: Request, res: Response) {
  try {
    const parse = await produtoSchema.safeParseAsync(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: parse.error.format(),
      });
    }
    if (parse.data.insumos.length === 0) {
      return res.status(400).json({ message: "O produto deve ter pelo menos um insumo" });
    }
    const insumosInexistentes = [];
    for (let i = 0; i < parse.data.insumos.length; i++) {
      const insumo = await getInsumoByNameModel({
        nome: parse.data.insumos[i].nome,
      });
      if (!insumo || insumo.length === 0) {
        insumosInexistentes.push(parse.data.insumos[i].nome);
      }
    }
    if (insumosInexistentes.length > 0) {
      return res.status(400).json({
        message: `Os seguintes insumos não existem, favor cadastrar: ${insumosInexistentes.join(", ")}`,
      });
    }
    const produto = await createProdutosModel(parse.data);
    return res.status(201).json(produto);
  } catch (error) {
    console.error("Error ao criar produto: ", error);
    return res.status(500).json({ message: "Error ao criar produto", error });
  }
}

export async function getAllProdutosOrByNameController(req: Request, res: Response) {
  try {
    if (req.body) {
      const parse = await produtoSchema.pick({ nome: true }).safeParseAsync(req.body);
      if (!parse.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          detalhes: parse.error.format(),
        });
      }
      const produtos = await getProdutoByNameModel({ nome: parse.data.nome });
      if (!produtos || produtos.length === 0) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      return res.status(200).json({ produtos });
    }
    const produtos = await getAllProdutosModel();
    return res.status(200).json({ produtos });
  } catch (error) {
    console.error("Error ao buscar produtos: ", error);
    return res.status(500).json({ message: "Error ao buscar produtos", error });
  }
}

export async function updateProdutoByNameController(req: Request, res: Response) {
  try {
    const nomeProduto = req.params.nome;
    const parse = await produtoSchema.partial().safeParseAsync(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: parse.error.format(),
      });
    }

    if (parse.data.insumos) {
      const insumosInexistentes = [];
      for (let i = 0; i < parse.data.insumos.length; i++) {
        const insumo = await getInsumoByNameModel({
          nome: parse.data.insumos[i].nome,
        });
        if (!insumo || insumo.length === 0) {
          insumosInexistentes.push(parse.data.insumos[i].nome);
        }
      }
      if (insumosInexistentes.length > 0) {
        return res.status(400).json({
          message: `Os seguintes insumos não existem, favor cadastrar: ${insumosInexistentes.join(", ")}`,
        });
      }
    }

    const produtoAtualizado = await updateProdutoByNameModel(nomeProduto, parse.data);
    return res.status(200).json(produtoAtualizado);
  } catch (error) {
    console.error("Error ao atualizar produto: ", error);
    return res.status(500).json({ message: "Error ao atualizar produto", error });
  }
}

export async function deleteProdutoByNameController(req: Request, res: Response) {
  try {
    const parse = await produtoSchema.pick({ nome: true }).safeParseAsync(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: parse.error.format(),
      });
    }
    const produtoDeletado = await deleteProdutoByNameModel(parse.data.nome);
    return res.status(200).json(produtoDeletado);
  } catch (error) {
    console.error("Error ao deletar produto: ", error);
    return res.status(500).json({ message: "Error ao deletar produto", error });
  }
}

export async function deleteInsumoInProdutoController(req: Request, res: Response) {
  try {
    const { nome, insumo } = req.params;
    console.log("params", req.params);
    const produto = await getProdutoByNameModel({ nome });
    if (!produto || produto.length === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const insumosAtualizados = produto[0].insumos.filter((i: { nome: string }) => i.nome !== insumo);

    const atualizado = await updateProdutoByNameModel(nome, {
      insumos: insumosAtualizados,
    });

    return res.status(200).json(atualizado);
  } catch (erro) {
    console.error("Erro ao deletar insumo:", erro);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}
