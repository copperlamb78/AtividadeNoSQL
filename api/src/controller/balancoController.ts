import type { Request, Response } from "express";
import { getAllInsumosModel } from "../model/insumosModel.ts";
import { getAllPedidosModel } from "../model/pedidoModel.ts";
import { getEntradasByMonthYear, getAllEntradasModel } from "../model/entradasModel.ts";
import { getSaidasByMonthYear, getAllSaidasModel } from "../model/saidasModel.ts";
import { getProdutoByNameModel } from "../model/produtosModel.ts";

type Insumo = {
  nome: string;
  quantidade: number;
  unidade?: string;
  custo: number;
  dataAtualizacao?: string;
};

type Entrada = {
  insumos: Array<{ nome: string; quantidade: number; custo?: number }>;
  valorTotal?: number;
  data: string;
  origem?: string;
};

type Saida = {
  insumos: Array<{ nome: string; quantidade: number; custo?: number }>;
  valorTotal?: number;
  motivo?: string;
  data: string;
};

type Pedido = {
  produtos: Array<{ nome: string; quantidade: number }>;
  insumosUsados?: Array<{ nome: string; quantidade: number; custo: number }>;
  ReceitaTotal?: number;
  data: string;
  status?: string;
};

type PerInsumoReport = {
  nome: string;
  entradas: { quantidade: number; custoTotal: number };
  saidas: { quantidade: number; custoTotal: number };
  estoqueAtual: {
    nome: string;
    quantidade: number;
    custoUnitario: number;
    valorEmEstoque: number;
    dataAtualizacao?: string;
  };
};

export async function getBalancoMensalController(req: Request, res: Response) {
  try {
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const now = new Date();
    const queryMonth = typeof month === "number" && !isNaN(month) ? month : now.getMonth();
    const queryYear = typeof year === "number" && !isNaN(year) ? year : now.getFullYear();

    const entradas = (await getEntradasByMonthYear(queryMonth, queryYear)) as unknown as Entrada[];
    const saidas = (await getSaidasByMonthYear(queryMonth, queryYear)) as unknown as Saida[];
    const pedidos = (await getAllPedidosModel()) as unknown as Pedido[];
    const insumosEmEstoque = (await getAllInsumosModel()) as unknown as Insumo[];
    const todasEntradas = (await getAllEntradasModel()) as unknown as Entrada[];
    const todasSaidas = (await getAllSaidasModel()) as unknown as Saida[];

    const pedidosDoMes: Pedido[] = (pedidos || []).filter((p: Pedido) => {
      if (!p || !p.data) return false;
      const d = new Date(p.data);
      return d.getMonth() === queryMonth && d.getFullYear() === queryYear;
    });

    const entradasPorInsumo: Record<string, { nome: string; quantidade: number; custoTotal: number }> = {};
    let totalEntradasValor = 0;
    for (const e of entradas || []) {
      const valor = e.valorTotal || 0;
      totalEntradasValor += valor;
      for (const ins of e.insumos || []) {
        const nome = ins.nome;
        const qtd = Number(ins.quantidade) || 0;
        const custo = Number(ins.custo || 0) || 0;
        if (!entradasPorInsumo[nome]) entradasPorInsumo[nome] = { nome, quantidade: 0, custoTotal: 0 };
        entradasPorInsumo[nome].quantidade += qtd;
        entradasPorInsumo[nome].custoTotal += qtd * custo;
      }
    }

    const saidasPorInsumo: Record<string, { nome: string; quantidade: number; custoTotal: number }> = {};
    let totalSaidasValor = 0;
    for (const s of saidas || []) {
      const valor = s.valorTotal || 0;
      totalSaidasValor += valor;
      for (const ins of s.insumos || []) {
        const nome = ins.nome;
        const qtd = Number(ins.quantidade) || 0;
        const custo = Number(ins.custo || 0) || 0;
        if (!saidasPorInsumo[nome]) saidasPorInsumo[nome] = { nome, quantidade: 0, custoTotal: 0 };
        saidasPorInsumo[nome].quantidade += qtd;
        saidasPorInsumo[nome].custoTotal += qtd * custo;
      }
    }

    const saidasFromPedidos: Record<string, { nome: string; quantidade: number; custoTotal: number }> = {};
    let receitaTotal = 0;
    for (const p of pedidosDoMes) {
      if (p.ReceitaTotal != null) {
        receitaTotal += Number(p.ReceitaTotal || 0);
      } else {
        // try to compute receita from produtos list
        let soma = 0;
        for (const prod of p.produtos || []) {
          try {
            const produtoDoc = await getProdutoByNameModel({ nome: prod.nome });
            const preco = produtoDoc?.preco || 0;
            soma += Number(preco) * Number(prod.quantidade || 0);
          } catch {
            // ignore and continue
          }
        }
        receitaTotal += soma;
      }
      for (const ins of p.insumosUsados || []) {
        const nome = ins.nome;
        const qtd = Number(ins.quantidade) || 0;
        const custo = Number(ins.custo || 0) || 0;
        if (!saidasFromPedidos[nome]) saidasFromPedidos[nome] = { nome, quantidade: 0, custoTotal: 0 };
        saidasFromPedidos[nome].quantidade += qtd;
        saidasFromPedidos[nome].custoTotal += qtd * custo;
      }
    }

    const estoqueSnapshot = (insumosEmEstoque || []).map((i: Insumo) => ({
      nome: i.nome,
      quantidade: Number(i.quantidade || 0),
      custoUnitario: Number(i.custo || 0),
      valorEmEstoque: Number(i.quantidade || 0) * Number(i.custo || 0),
      dataAtualizacao: i.dataAtualizacao,
    }));

    const perInsumoMap: Record<string, PerInsumoReport> = {};
    const allNames = new Set<string>();
    Object.keys(entradasPorInsumo).forEach((n) => allNames.add(n));
    Object.keys(saidasPorInsumo).forEach((n) => allNames.add(n));
    Object.keys(saidasFromPedidos).forEach((n) => allNames.add(n));
    estoqueSnapshot.forEach((s) => allNames.add(s.nome));

    // compute entradas/saidas after the selected month to roll back current stock to month-end
    const startNextMonth = new Date(queryYear, queryMonth + 1, 1);
    const entradasAfter: Record<string, number> = {};
    for (const e of todasEntradas || []) {
      const d = new Date(e.data);
      if (d >= startNextMonth) {
        for (const ins of e.insumos || []) {
          entradasAfter[ins.nome] = (entradasAfter[ins.nome] || 0) + Number(ins.quantidade || 0);
        }
      }
    }
    const saidasAfter: Record<string, number> = {};
    for (const s of todasSaidas || []) {
      const d = new Date(s.data);
      if (d >= startNextMonth) {
        for (const ins of s.insumos || []) {
          saidasAfter[ins.nome] = (saidasAfter[ins.nome] || 0) + Number(ins.quantidade || 0);
        }
      }
    }

    for (const nome of Array.from(allNames)) {
      const entradasVal = entradasPorInsumo[nome] || { nome, quantidade: 0, custoTotal: 0 };
      const saidasVal = saidasPorInsumo[nome]
        ? { quantidade: saidasPorInsumo[nome].quantidade, custoTotal: saidasPorInsumo[nome].custoTotal }
        : saidasFromPedidos[nome]
        ? { quantidade: saidasFromPedidos[nome].quantidade, custoTotal: saidasFromPedidos[nome].custoTotal }
        : { quantidade: 0, custoTotal: 0 };
      const estoqueVal = estoqueSnapshot.find((s) => s.nome === nome) || {
        nome,
        quantidade: 0,
        custoUnitario: 0,
        valorEmEstoque: 0,
      };
      // roll back entries/saidas that happened after the selected month
      const entradasAfterQtd = entradasAfter[nome] || 0;
      const saidasAfterQtd = saidasAfter[nome] || 0;
      const quantidadeHistorica = Number(estoqueVal.quantidade || 0) - entradasAfterQtd + saidasAfterQtd;
      const valorEmEstoqueHistorico = quantidadeHistorica * Number(estoqueVal.custoUnitario || 0);

      perInsumoMap[nome] = {
        nome,
        entradas: entradasVal,
        saidas: saidasVal,
        estoqueAtual: { ...estoqueVal, quantidade: quantidadeHistorica, valorEmEstoque: valorEmEstoqueHistorico },
      } as PerInsumoReport;
    }

    const perInsumo = Object.values(perInsumoMap);

    const totalEstoqueValor = Object.values(perInsumoMap).reduce(
      (acc: number, cur: PerInsumoReport) => acc + (cur.estoqueAtual.valorEmEstoque || 0),
      0
    );

    // include cost of saidas inferred from pedidos into totalSaidasValor
    const totalSaidasFromPedidos = Object.values(saidasFromPedidos).reduce(
      (acc, cur) => acc + (cur.custoTotal || 0),
      0
    );
    totalSaidasValor += totalSaidasFromPedidos;

    return res.json({
      month: queryMonth,
      year: queryYear,
      totalEntradasValor,
      totalSaidasValor,
      receitaTotal,
      totalEstoqueValor,
      perInsumo,
    });
  } catch (error) {
    console.error("Erro ao calcular balanço mensal:", error);
    return res.status(500).json({ message: "Erro ao calcular balanço mensal", error: String(error) });
  }
}
