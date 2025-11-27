import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";

// --- Dados de Exemplo (substituir pela sua API no futuro) ---
const reportData: { [key: string]: any } = {
  "2024-05": {
    entradas: 750.5,
    saidas: -320.0,
    transactions: [
      { id: 1, type: "entrada", description: "Venda Bolo de Chocolate", value: 80.0 },
      { id: 2, type: "saida", description: "Compra de Farinha (5kg)", value: -25.0 },
      { id: 3, type: "entrada", description: "Venda Torta de Morango", value: 120.5 },
      { id: 4, type: "saida", description: "Compra de Ovos (30un)", value: -20.0 },
    ],
  },
  "2024-04": {
    entradas: 680.0,
    saidas: -450.5,
    transactions: [
      { id: 5, type: "entrada", description: "Venda Cheesecake", value: 95.0 },
      { id: 6, type: "saida", description: "Pagamento de Energia", value: -150.5 },
      { id: 7, type: "entrada", description: "Venda Cupcakes", value: 60.0 },
    ],
  },
};
// --- Fim dos Dados de Exemplo ---

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

function App() {
  const [selectedMonth, setSelectedMonth] = useState("2024-05");
  const currentReport = reportData[selectedMonth] || { entradas: 0, saidas: 0, transactions: [] };
  const balanco = currentReport.entradas + currentReport.saidas;

  return (
    <>
      <Header />
      <div className="report-container">
        <div className="report-header">
          <h2>Relatório Mensal</h2>
          <div className="month-selector">
            <label htmlFor="month-select">Selecione o Mês:</label>
            <select id="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="2024-05">Maio/2024</option>
              <option value="2024-04">Abril/2024</option>
              {/* Adicione mais meses conforme necessário */}
            </select>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card card-entradas">
            <h4>Total de Entradas</h4>
            <p>{formatCurrency(currentReport.entradas)}</p>
          </div>
          <div className="summary-card card-saidas">
            <h4>Total de Saídas</h4>
            <p>{formatCurrency(currentReport.saidas)}</p>
          </div>
          <div className={`summary-card ${balanco >= 0 ? "card-balanco-positivo" : "card-balanco-negativo"}`}>
            <h4>Balanço Mensal</h4>
            <p>{formatCurrency(balanco)}</p>
          </div>
        </div>

        <div className="transaction-list-container">
          <h3>Detalhamento de Transações</h3>
          <div className="transaction-list">
            {currentReport.transactions.length > 0 ? (
              currentReport.transactions.map((trans: any) => (
                <div key={trans.id} className="transaction-item">
                  <span className="transaction-description">{trans.description}</span>
                  <span className={`transaction-value ${trans.type === "entrada" ? "value-entrada" : "value-saida"}`}>
                    {formatCurrency(trans.value)}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-transactions">Nenhuma transação para o mês selecionado.</p>
            )}
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
}

export default App;
