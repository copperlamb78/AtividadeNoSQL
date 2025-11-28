import { useEffect, useState } from "react";
// API base (can be overridden with Vite env variable `VITE_API_URL`)
const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || "http://localhost:3000/api";

type PerInsumo = {
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

type BalancoResponse = {
  month: number;
  year: number;
  totalEntradasValor: number;
  totalSaidasValor: number;
  receitaTotal: number;
  totalEstoqueValor: number;
  perInsumo: PerInsumo[];
};

type Produto = {
  nome: string;
  preco?: number;
  insumos?: Array<{ nome: string; quantidade: number }>;
};

type PedidoUI = {
  _id?: string;
  id?: string;
  produtos?: Array<{ nome: string; quantidade: number }>;
  insumosUsados?: Array<{ nome: string; quantidade: number; custo?: number }>;
  ReceitaTotal?: number;
  data?: string;
  status?: string;
};

type Insumo = {
  nome: string;
  quantidade: number;
  unidade?: string;
  custo?: number;
  dataAtualizacao?: string;
};

// --- Fim dos Dados de Exemplo ---
import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

function App() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
  // parse numbers coming from API or user input: accept number, strings with dot or comma
  function parseNumber(v: unknown): number {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    const s = String(v).trim();
    if (s === "") return 0;
    // accept comma as decimal separator
    const norm = s.replace(/\./g, "").replace(/,/g, ".");
    const n = Number(norm);
    return Number.isFinite(n) ? n : 0;
  }
  const [balancoData, setBalancoData] = useState<BalancoResponse | null>(null);
  const [pedidosMes, setPedidosMes] = useState<PedidoUI[]>([]);
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [insumos, setInsumos] = useState<Insumo[] | null>(null);
  const totalEntradasFromBalanco = balancoData ? balancoData.totalEntradasValor : 0;
  const receitaFromBalanco = balancoData ? balancoData.receitaTotal || 0 : 0;
  const totalEntradas = totalEntradasFromBalanco + receitaFromBalanco;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // compute total saídas from pedidos (client-side) using insumos unit costs
  const totalSaidasFromPedidos = pedidosMes.reduce((accPedido, pedido) => {
    if (!pedido.insumosUsados || pedido.insumosUsados.length === 0) return accPedido;
    const subtotal = pedido.insumosUsados.reduce((accIns, ins) => {
      // Prefer ins.custo as the total cost for that insumo in the pedido (controller stores total cost there).
      // If not present, fallback to unit cost from insumos collection multiplied by quantity.
      const found = insumos?.find(
        (i) =>
          i.nome?.trim().toLowerCase() ===
          String(ins.nome || "")
            .trim()
            .toLowerCase()
      );
      const qty = parseNumber((ins as any).quantidade);
      const totalCostFromPedido = parseNumber((ins as any).custo ?? 0);
      if (totalCostFromPedido > 0) {
        return accIns + totalCostFromPedido;
      }
      const unitCostFromCollection = parseNumber(found?.custo ?? 0);
      return accIns + unitCostFromCollection * qty;
    }, 0);
    return accPedido + subtotal;
  }, 0);
  const totalSaidasFromPedidosRounded = Number(totalSaidasFromPedidos.toFixed(2));
  const balanco = totalEntradas - Math.abs(totalSaidasFromPedidosRounded);
  useEffect(() => {
    async function loadBalanco() {
      setLoading(true);
      setError(null);
      setBalancoData(null);
      try {
        const [yearStr, monthStr] = selectedMonth.split("-");
        const year = Number(yearStr);
        const monthIndex = Number(monthStr) - 1; // API expects 0-based month
        const res = await fetch(`${API_BASE}/balanco/mensal?month=${monthIndex}&year=${year}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBalancoData(data as BalancoResponse);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadBalanco();
    // load pedidos for selected month
    (async () => {
      try {
        const resPedidos = await fetch(`${API_BASE}/pedidos`);
        if (!resPedidos.ok) {
          setPedidosMes([]);
          return;
        }
        const allPedidos = (await resPedidos.json()) || [];
        // filter by selected month/year
        const [yearStr, monthStr] = selectedMonth.split("-");
        const year = Number(yearStr);
        const monthIndex = Number(monthStr) - 1;
        const pedidosDoMes = (allPedidos || []).filter((p: PedidoUI) => {
          if (!p || !p.data) return false;
          const d = new Date(p.data as string);
          return d.getMonth() === monthIndex && d.getFullYear() === year;
        });
        setPedidosMes(pedidosDoMes || []);
      } catch {
        setPedidosMes([]);
      }
    })();
  }, [selectedMonth]);

  // fetch produtos once on mount
  useEffect(() => {
    (async () => {
      try {
        const resProd = await fetch(`${API_BASE}/produtos`);
        const prods = resProd.ok ? await resProd.json() : [];
        setProdutos(prods || []);
      } catch {
        setProdutos([]);
      }
    })();
  }, []);

  // fetch insumos once on mount (needed to compute unit costs)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/insumos`);
        const data = res.ok ? await res.json() : [];
        setInsumos(data || []);
      } catch {
        setInsumos([]);
      }
    })();
  }, []);

  return (
    <>
      <Header />
      <div className="report-container">
        <div className="report-header">
          <h2>Relatório Mensal</h2>
          <div className="month-selector">
            <label htmlFor="month-select">Selecione o Mês:</label>
            <input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Selecionar mês e ano"
            />
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card card-entradas">
            <h4>Total de Entradas</h4>
            <p>{formatCurrency(totalEntradas)}</p>
          </div>
          <div className="summary-card card-saidas">
            <h4>Total de Saídas</h4>
            <p>{formatCurrency(totalSaidasFromPedidosRounded)}</p>
          </div>
          <div className={`summary-card ${balanco >= 0 ? "card-balanco-positivo" : "card-balanco-negativo"}`}>
            <h4>Balanço Mensal</h4>
            <p>{formatCurrency(balanco)}</p>
          </div>
        </div>

        <div className="transaction-list-container">
          <h3>Faturas / Pedidos do Mês</h3>
          <div className="transaction-list">
            {loading && <p>Carregando balanço...</p>}
            {error && <p className="no-transactions">Erro: {error}</p>}

            {!loading && !error && pedidosMes && pedidosMes.length > 0
              ? pedidosMes.map((pedido: PedidoUI, idx: number) => {
                  const receita = pedido.ReceitaTotal != null ? Number(pedido.ReceitaTotal) : undefined;
                  return (
                    <div
                      key={pedido._id ?? pedido.id ?? idx}
                      className="transaction-item"
                      style={{ flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span className="transaction-description">Pedido: {pedido._id || pedido.id || "(sem id)"}</span>
                        <span className="transaction-value">
                          Receita: {receita != null ? formatCurrency(receita) : "-"}
                        </span>
                      </div>
                      <div style={{ marginTop: 8, width: "100%" }}>
                        <strong>Insumos usados:</strong>
                        {pedido.insumosUsados && pedido.insumosUsados.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                            {pedido.insumosUsados.map((ins) => {
                              // prefer authoritative unit cost from insumos collection; prefer total cost stored on pedido if available
                              const found = insumos?.find(
                                (i) =>
                                  i.nome?.trim().toLowerCase() ===
                                  String(ins.nome || "")
                                    .trim()
                                    .toLowerCase()
                              );
                              const qty = parseNumber((ins as any).quantidade);
                              const totalCostFromPedido = parseNumber((ins as any).custo ?? 0);
                              let totalCost: number;
                              let unitCostForDisplay: number;
                              if (totalCostFromPedido > 0) {
                                totalCost = totalCostFromPedido;
                                unitCostForDisplay =
                                  qty > 0 ? totalCostFromPedido / qty : parseNumber(found?.custo ?? 0);
                              } else {
                                unitCostForDisplay = parseNumber(found?.custo ?? 0);
                                totalCost = unitCostForDisplay * qty;
                              }
                              // in a pedido, these insumos represent a saída (stock out)
                              return (
                                <div key={ins.nome} style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span className="insumo-saida">
                                    {ins.nome} (qtd: {qty})
                                  </span>
                                  <span className="value-saida">
                                    {formatCurrency(totalCost)}
                                    <small style={{ marginLeft: 8, color: "#666", fontWeight: 400 }}>
                                      ({formatCurrency(unitCostForDisplay)}/un)
                                    </small>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ marginTop: 6 }}>Nenhum insumo registrado para este pedido.</div>
                        )}
                      </div>
                    </div>
                  );
                })
              : !loading &&
                !error && <p className="no-transactions">Nenhum pedido encontrado para o mês selecionado.</p>}
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
}

export default App;
