import type { Request, Response } from "express";
import { pedidoSchema } from "../schemas/pedidoSchema.ts";
import { createPedidoModel } from "../model/pedidoModel.ts";
import { getProdutoByNameModel } from "../model/produtosModel.ts";
import { getInsumoByNameModel, updateInsumoByNameModel } from "../model/insumosModel.ts";
// Fazer com que o pedido desconte insumos a cada
// produto vendido
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
        const insumoUpdated = updateInsumoByNameModel(insumoUsadoParaLista.nome, {
          quantidade: insumoNoEstoque[0]?.quantidade - insumoUsadoParaLista.quantidade,
        });
        console.log("Insumo atualizado: ", insumoUpdated);
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
