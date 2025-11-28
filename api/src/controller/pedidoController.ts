import type { Request, Response } from "express";
import { pedidoSchema } from "../schemas/pedidoSchema.ts";
import {
  cancelPedidoByIdModel,
  createPedidoModel,
  deletePedidoByIdModel,
  deliverPedidoByIdModel,
  getAllPedidosModel,
  getPedidoByIdModel,
  getPedidoByNameModel,
} from "../model/pedidoModel.ts";
import { getProdutoByNameModel } from "../model/produtosModel.ts";
import { getInsumoByNameModel, updateInsumoByNameModel } from "../model/insumosModel.ts";
import { createSaidaModel } from "../model/saidasModel.ts";

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
    const insumosUsados: { nome: string; quantidade: number; custo: number }[] = [];
    for (const produto of parse.data.produtos) {
      const produtoToCount = await getProdutoByNameModel({ nome: produto.nome });
      if (!produtoToCount) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      for (const insumo of produtoToCount.insumos) {
        const insumoRecords = await getInsumoByNameModel({ nome: insumo.nome });
        const insumoFromDB = Array.isArray(insumoRecords) ? insumoRecords[0] : insumoRecords;
        const unitCost =
          typeof insumoFromDB?.custo === "number" ? insumoFromDB.custo : Number(insumoFromDB?.custo ?? 0);
        const quantidadeUsada = Number(insumo.quantidade) * Number(produto.quantidade);
        const custoInsumo = unitCost * quantidadeUsada;
        const insumoUsadoParaLista = {
          nome: insumo.nome,
          quantidade: quantidadeUsada,
          custo: Number(custoInsumo.toFixed(2)),
        };
        const insumoNoEstoque = await getInsumoByNameModel({ nome: insumoUsadoParaLista.nome });
        if (
          !insumoNoEstoque ||
          insumoNoEstoque.length === 0 ||
          Number(insumoNoEstoque[0].quantidade) < insumoUsadoParaLista.quantidade
        ) {
          return res.status(400).json({ message: `Insumo ${insumoUsadoParaLista.nome} insuficiente no estoque` });
        }
        const quantidadeAtualEstoque = insumoNoEstoque[0]?.quantidade - insumoUsadoParaLista.quantidade;
        await updateInsumoByNameModel(
          insumoUsadoParaLista.nome,
          { quantidade: Number(quantidadeAtualEstoque.toFixed(3)) },
          new Date().toISOString()
        );
        insumosUsados.push(insumoUsadoParaLista);
      }
      const produtoPreco = produtoToCount.preco * produto.quantidade;
      ReceitaTotal += produtoPreco;
    }
    const pedidoCriado = await createPedidoModel(parse.data.produtos, insumosUsados, ReceitaTotal, data);
    try {
      const totalCustoInsumos = insumosUsados.reduce((acc, cur) => acc + (cur.custo || 0), 0);
      await createSaidaModel({
        insumos: insumosUsados,
        valorTotal: Number(totalCustoInsumos.toFixed(2)),
        motivo: `Venda`,
        data,
      });
    } catch (e) {
      console.error("Erro ao registrar saída após criar pedido:", e);
    }
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

export async function deliverPedidoByIdController(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Id do pedido é obrigatório" });
    }
    const pedidoToDeliver = await getPedidoByIdModel(id);
    if (!pedidoToDeliver) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }
    const pedidoEntregue = await deliverPedidoByIdModel(id);
    return res.status(200).json(pedidoEntregue);
  } catch (error) {
    console.error("Error ao entregar pedido: ", error);
    return res.status(500).json({ message: "Error ao entregar pedido", error });
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
      await updateInsumoByNameModel(
        insumo.nome,
        { quantidade: insumoNoEstoque[0].quantidade + insumo.quantidade },
        new Date().toISOString()
      );
    }
    const pedidoDeletado = await deletePedidoByIdModel(id);
    return res.status(200).json(pedidoDeletado);
  } catch (error) {
    console.error("Error ao deletar pedido: ", error);
    return res.status(500).json({ message: "Error ao deletar pedido", error });
  }
}
