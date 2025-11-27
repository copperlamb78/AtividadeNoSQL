import React, { useState } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import "./insumo.css";

const unitOptions = ["Kg", "L", "Un", "g", "ml"];

// Exemplo de dados de insumos em estoque que virão do seu backend
const insumosEmEstoque = [
  { id: 1, nome: "Farinha de Trigo", quantidade: 5, unidade: "Kg" },
  { id: 2, nome: "Ovos", quantidade: 24, unidade: "Un" },
  { id: 3, nome: "Leite Condensado", quantidade: 12, unidade: "Un" },
  { id: 4, nome: "Chocolate em Pó", quantidade: 1.5, unidade: "Kg" },
];

const InsumoPage: React.FC = () => {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("Un");
  const [custo, setCusto] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome || !quantidade || !custo) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novoInsumo = {
      nome,
      quantidade: parseFloat(quantidade),
      unidade,
      custo: parseFloat(custo),
    };

    // Aqui você adicionaria a lógica para enviar o novo insumo para a sua API
    console.log("Novo Insumo Adicionado:", novoInsumo);
    alert(`Insumo "${nome}" adicionado ao estoque com sucesso!`);

    // Limpa o formulário após o envio
    setNome("");
    setQuantidade("");
    setUnidade("Un");
    setCusto("");
  };

  return (
    <>
      <Header />
      <div className="insumo-container">
        <h2>Adicionar Insumo ao Estoque</h2>
        <form onSubmit={handleSubmit} className="insumo-form">
          <div className="form-group">
            <label htmlFor="insumo-name">Nome do Insumo/Produto:</label>
            <input
              type="text"
              id="insumo-name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Chocolate em pó"
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="insumo-quantity">Quantidade:</label>
              <input
                type="number"
                id="insumo-quantity"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
                placeholder="Ex: 2"
                min="0"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="insumo-unit">Unidade:</label>
              <select id="insumo-unit" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
                {unitOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="insumo-cost">Custo Total (R$):</label>
            <input
              type="number"
              id="insumo-cost"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              required
              placeholder="Ex: 15.75"
              step="0.01"
              min="0"
            />
          </div>

          <button type="submit" className="submit-button">
            Adicionar ao Estoque
          </button>
        </form>

        <div className="estoque-list-container">
          <h3>Insumos em Estoque</h3>
          <div className="insumo-list">
            {insumosEmEstoque.map((insumo) => (
              <div key={insumo.id} className="insumo-item">
                <span className="insumo-nome">{insumo.nome}</span>
                <span className="insumo-quantidade">
                  {insumo.quantidade} {insumo.unidade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default InsumoPage;
