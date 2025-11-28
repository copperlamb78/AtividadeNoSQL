import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./insumo.css";

const unitOptions = ["Kg", "L", "Un", "g", "ml"];

// Exemplo de dados de insumos em estoque que virão do seu backend

export async function fetchInsumos() {
  try {
    const res = await axios.get("http://localhost:3000/api/insumos");
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar insumos:", error);
    return [];
  }
}

async function adicionarInsumo(insumo: { nome: string; quantidade: number; unidade: string; custo: number }) {
  try {
    const res = await axios.post("http://localhost:3000/api/insumos", insumo);
    return res.data;
  } catch (error) {
    console.error("Erro ao adicionar insumo:", error);
    return null;
  }
}

async function atualizarInsumo(insumo: Insumo) {
  try {
    const res = await axios.put(`http://localhost:3000/api/insumos/${insumo.id}`, insumo);
    return res.data;
  } catch (error) {
    console.error("Erro ao atualizar insumo:", error);
    return null;
  }
}

async function deletarInsumo(id: number) {
  try {
    const res = await axios.delete(`http://localhost:3000/api/insumos/${id}`);
    return res.data;
  } catch (error) {
    console.error("Erro ao deletar insumo:", error);
    return null;
  }
}

const InsumoPage: React.FC = () => {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("Un");
  const [custo, setCusto] = useState("");
  const [insumosEmEstoque, setInsumosEmEstoque] = useState<Insumo[]>(initialInsumos);

  useEffect(() => {
    fetchInsumos().then(setInsumosEmEstoque);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome || !quantidade || !custo) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novoInsumo = {
      id: Date.now(), // ID temporário para o exemplo
      nome,
      quantidade: parseFloat(quantidade),
      unidade,
      custo: parseFloat(custo),
    };
    // adicionarInsumo(novoInsumo).then(() => {
    //   fetchInsumos().then(setInsumosEmEstoque);
    // });

    // Simula a adição localmente
    setInsumosEmEstoque([...insumosEmEstoque, novoInsumo]);

    alert(`Insumo "${nome}" adicionado ao estoque com sucesso!`);

    // Limpa o formulário após o envio
    setNome("");
    setQuantidade("");
    setUnidade("Un");
    setCusto("");
  };

  // --- Estados e Funções para os Modais ---

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [insumoToDelete, setInsumoToDelete] = useState<number | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [insumoToEdit, setInsumoToEdit] = useState<Insumo | null>(null);

  const [validationModal, setValidationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // --- Funções para o Modal de Exclusão ---

  const openDeleteModal = (id: number) => {
    setInsumoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setInsumoToDelete(null);
  };

  const handleDeleteInsumo = () => {
    if (insumoToDelete !== null) {
      // deletarInsumo(insumoToDelete).then(() => {
      //   fetchInsumos().then(setInsumosEmEstoque);
      //   setValidationModal({
      //     isOpen: true,
      //     title: "Insumo Apagado",
      //     message: `O insumo foi apagado com sucesso!`,
      //     onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      //   });
      //   closeDeleteModal();
      // });
      // Simula a exclusão localmente
      setInsumosEmEstoque(insumosEmEstoque.filter((insumo) => insumo.id !== insumoToDelete));
      closeDeleteModal();
    }
  };

  // --- Funções para o Modal de Edição ---

  const openEditModal = (insumo: Insumo) => {
    setInsumoToEdit(JSON.parse(JSON.stringify(insumo))); // Cópia profunda
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setInsumoToEdit(null);
  };

  const handleInsumoEditChange = (field: keyof Insumo, value: string | number) => {
    if (insumoToEdit) {
      setInsumoToEdit({ ...insumoToEdit, [field]: value });
    }
  };

  const handleUpdateInsumo = () => {
    if (!insumoToEdit) return;

    setValidationModal({
      isOpen: true,
      title: "Confirmar Alterações?",
      message: "Tem certeza que deseja salvar as alterações?",
      onConfirm: confirmUpdateInsumo,
    });
  };

  const confirmUpdateInsumo = () => {
    if (!insumoToEdit) return;

    // atualizarInsumo(insumoToEdit).then(() => {
    //   fetchInsumos().then(setInsumosEmEstoque);
    //   setValidationModal({
    //     isOpen: true,
    //     title: "Sucesso!",
    //     message: `Insumo "${insumoToEdit.nome}" atualizado com sucesso!`,
    //     onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
    //   });
    //   closeEditModal();
    // });
    // Simula a atualização localmente
    setInsumosEmEstoque(insumosEmEstoque.map((insumo) => (insumo.id === insumoToEdit.id ? insumoToEdit : insumo)));
    closeEditModal();
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
                min={"0"}
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
            <label htmlFor="insumo-cost">Custo por unidade (R$):</label>
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
            {insumosEmEstoque.length === 0 ? (
              <span>Carregando...</span>
            ) : (
              insumosEmEstoque.map((insumo) => (
                <div key={insumo.id} className="insumo-item">
                  <div className="insumo-info">
                    <span className="insumo-nome">{insumo.nome}</span>
                    <span className="insumo-quantidade">
                      {insumo.quantidade} {insumo.unidade}
                    </span>
                  </div>
                  <div className="insumo-actions">
                    <button className="action-button edit-button" onClick={() => openEditModal(insumo)}>
                      <FaEdit className="icon" />
                      <span className="button-text">Editar</span>
                    </button>
                    <button className="action-button delete-button" onClick={() => openDeleteModal(insumo.id)}>
                      <FaTrash className="icon" />
                      <span className="button-text">Apagar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Navbar />

      {/* Modal de Exclusão */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Você tem certeza que deseja apagar este insumo?</p>
            <div className="modal-actions">
              <button onClick={closeDeleteModal} className="cancel-button">
                Cancelar
              </button>
              <button onClick={handleDeleteInsumo} className="confirm-delete-button">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && insumoToEdit && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <h3>Editar Insumo</h3>

            <div className="form-group">
              <label htmlFor="edit-insumo-name">Nome do Insumo:</label>
              <input
                type="text"
                id="edit-insumo-name"
                value={insumoToEdit.nome}
                onChange={(e) => handleInsumoEditChange("nome", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-insumo-quantity">Quantidade:</label>
              <input
                type="number"
                id="edit-insumo-quantity"
                value={insumoToEdit.quantidade}
                onChange={(e) => handleInsumoEditChange("quantidade", parseFloat(e.target.value))}
                min="0"
              />
            </div>

            <div className="modal-actions">
              <button onClick={closeEditModal} className="cancel-button">
                Voltar
              </button>
              <button onClick={handleUpdateInsumo} className="confirm-edit-button">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validação/Confirmação Genérico */}
      {validationModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{validationModal.title}</h3>
            <p>{validationModal.message}</p>
            <div className="modal-actions">
              {validationModal.title.includes("?") ? (
                <button
                  onClick={() => setValidationModal({ ...validationModal, isOpen: false })}
                  className="cancel-button"
                >
                  Cancelar
                </button>
              ) : null}
              <button
                onClick={() => {
                  validationModal.onConfirm();
                  // Garante que o modal de confirmação feche se o onConfirm não o fizer
                  if (!validationModal.title.includes("?")) {
                    setValidationModal({ ...validationModal, isOpen: false });
                  }
                }}
                className="confirm-edit-button"
              >
                {validationModal.title.includes("?") ? "Sim" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InsumoPage;
