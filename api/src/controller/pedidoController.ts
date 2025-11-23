import type { Request, Response } from "express";
import { pedidoSchema } from "../schemas/pedidoSchema.ts";
import {
  cancelPedidoByIdModel,
  createPedidoModel,
  deletePedidoByIdModel,
  getAllPedidosModel,
  getPedidoByIdModel,
  getPedidoByNameModel,
} from "../model/pedidoModel.ts";
import { getProdutoByNameModel } from "../model/produtosModel.ts";
import { getInsumoByNameModel, updateInsumoByNameModel } from "../model/insumosModel.ts";

export async function createPedidoController(req: Request, res: Response) {
  try {
    const data = new Date().toISOString();
    const parse = await pedidoSchema.safeParseAsync(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        detalhes: parse.error.format(),
      });
    }
    let ReceitaTotal = 0;
    const insumosUsados: { nome: string; quantidade: number }[] = [];
    for (const produto of parse.data.produtos) {
      const produtoToCount = await getProdutoByNameModel({ nome: produto.nome });
      if (!produtoToCount) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      for (const insumo of produtoToCount.insumos) {
        const insumoUsadoParaLista = { nome: insumo.nome, quantidade: insumo.quantidade * produto.quantidade };
        const insumoNoEstoque = await getInsumoByNameModel({ nome: insumoUsadoParaLista.nome });
        if (insumoNoEstoque[0].quantidade < insumoUsadoParaLista.quantidade) {
          return res.status(400).json({ message: `Insumo ${insumoUsadoParaLista.nome} insuficiente no estoque` });
        }
        await updateInsumoByNameModel(insumoUsadoParaLista.nome, {
          quantidade: insumoNoEstoque[0]?.quantidade - insumoUsadoParaLista.quantidade,
        });
        insumosUsados.push(insumoUsadoParaLista);
      }
      const produtoPreco = produtoToCount.preco * produto.quantidade;
      ReceitaTotal += produtoPreco;
    }
    const pedidoCriado = await createPedidoModel(parse.data.produtos, insumosUsados, ReceitaTotal, data);
    return res.status(201).json(pedidoCriado);
  } catch (error) {
    console.error("Error ao criar pedido: ", error);
    return res.status(500).json({ message: "Error ao criar pedido", error });
  }
}

export async function getAllPedidosOrByIdController(req: Request, res: Response) {
  try {
    if (req.params.id) {
      const id = req.params.id;
      const pedidos = await getPedidoByNameModel(id);
      return res.status(200).json(pedidos);
    }
    const pedidos = await getAllPedidosModel();
    return res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error ao obter pedidos: ", error);
    return res.status(500).json({ message: "Error ao obter pedidos", error });
  }
}

export async function cancelPedidoByIdController(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Id do pedido é obrigatório" });
    }
    const pedidoToCancel = await getPedidoByIdModel(id);
    if (!pedidoToCancel) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }
    const pedidoCancelado = await cancelPedidoByIdModel(id);
    return res.status(200).json(pedidoCancelado);
  } catch (error) {
    console.error("Error ao cancelar pedido: ", error);
    return res.status(500).json({ message: "Error ao cancelar pedido", error });
  }
}

export async function deletePedidoByIdController(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Id do pedido é obrigatório" });
    }
    const pedidoToDelete = await getPedidoByIdModel(id);
    if (!pedidoToDelete) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    } else if (pedidoToDelete.status === "Cancelado") {
      const pedidoDeletado = await deletePedidoByIdModel(id);
      return res.status(200).json(pedidoDeletado);
    }
    for (const insumo of pedidoToDelete.insumosUsados) {
      const insumoNoEstoque = await getInsumoByNameModel({ nome: insumo.nome });
      await updateInsumoByNameModel(insumo.nome, {
        quantidade: insumoNoEstoque[0].quantidade + insumo.quantidade,
      });
    }
    const pedidoDeletado = await deletePedidoByIdModel(id);
    return res.status(200).json(pedidoDeletado);
  } catch (error) {
    console.error("Error ao deletar pedido: ", error);
    return res.status(500).json({ message: "Error ao deletar pedido", error });
  }
}
