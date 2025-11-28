import React, { useEffect, useState, useId, useRef } from "react";
import Header from "../components/Header"; // Corrigido para o caminho correto
import Navbar from "../components/Navbar";
import "./produto.css";
import axios from "axios";

type IIngredient = {
  id: string | number;
  name: string;
  quantity: string; // Usar string para flexibilidade (ex: "100g", "1 xícara")
};

type IRecipe = {
  id: string;
  name: string;
  price: number;
  ingredients: IIngredient[];
};

// Tipos esperados do backend
type BackendInsumo = {
  _id?: string;
  nome: string;
  quantidade: number;
  unidade?: string;
  custo?: number;
};

type BackendProduto = {
  _id?: string;
  nome: string;
  preco: number;
  insumos?: BackendInsumo[];
};

async function fetchRecipes() {
  try {
    const res = await axios.get("http://localhost:3000/api/produtos");
    const source =
      res.data && Array.isArray(res.data.produtos) ? res.data.produtos : Array.isArray(res.data) ? res.data : [];

    // Map backend data to frontend interface
    return (source as BackendProduto[]).map(
      (produto, pIndex) =>
        ({
          id: produto._id ?? `${produto.nome}-${pIndex}`,
          name: produto.nome,
          price: produto.preco,
          ingredients: (produto.insumos ?? []).map(
            (insumo, index) =>
              ({
                id: `${produto._id ?? produto.nome}-ing-${index}`,
                name: insumo.nome,
                quantity: `${insumo.quantidade ?? ""}`,
              } as IIngredient)
          ),
        } as IRecipe)
    );
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    return [];
  }
}

// Busca insumos do backend (compatível com o formato retornado por `insumosController`)
async function fetchInsumos() {
  try {
    const res = await axios.get("http://localhost:3000/api/insumos");
    const source = Array.isArray(res.data) ? res.data : Array.isArray(res.data.insumos) ? res.data.insumos : [];
    return (source as BackendInsumo[]).map((d) => ({
      id: d._id ?? d.nome,
      nome: d.nome,
      quantidade: d.quantidade,
      unidade: d.unidade ?? "",
      custo: d.custo,
    }));
  } catch (error) {
    console.error("Erro ao buscar insumos:", error);
    return [];
  }
}

const ProdutoPage: React.FC = () => {
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [insumosEmEstoque, setInsumosEmEstoque] = useState<
    {
      id?: string | number;
      nome: string;
      quantidade: number;
      unidade: string;
      custo?: number;
    }[]
  >([]);

  useEffect(() => {
    fetchInsumos().then(setInsumosEmEstoque);
    fetchRecipes().then(setRecipes);
  }, []);
  const [recipeName, setRecipeName] = useState("");
  const [price, setPrice] = useState("");

  // Gera ids estáveis sem chamar funções impuras durante o render
  const baseId = useId();
  const idCounterRef = useRef(1); // começa em 1 porque o índice 0 será usado no inicial
  const initialIngredient: IIngredient = { id: `${baseId}-0`, name: "", quantity: "" };
  const genId = () => `${baseId}-${idCounterRef.current++}`;

  const [ingredients, setIngredients] = useState<IIngredient[]>(() => [initialIngredient]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<IRecipe | null>(null);

  // Estado para o modal de validação/confirmação genérico
  const [validationModal, setValidationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleAddIngredient = () => {
    const novo: IIngredient = { id: genId(), name: "", quantity: "" };
    setIngredients((prev) => [...prev, novo]);
  };

  const handleRemoveIngredient = (id: number | string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleIngredientChange = (id: number | string, field: keyof IIngredient, value: string) => {
    setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validIngredients = ingredients.filter((ing) => ing.name && ing.quantity);
    if (!recipeName || !price) {
      setValidationModal({
        isOpen: true,
        title: "Campos incompletos",
        message: "Por favor, preencha o nome e o valor da receita.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      return;
    }
    if (validIngredients.length === 0) {
      setValidationModal({
        isOpen: true,
        title: "Ingredientes faltando",
        message: "Adicione pelo menos um ingrediente válido.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      return;
    }

    const newRecipe = {
      nome: recipeName,
      preco: parseFloat(price),
      insumos: validIngredients.map(({ name, quantity }) => ({
        nome: name,
        quantidade: parseFloat(quantity) || 0,
      })),
    };

    try {
      await axios.post("http://localhost:3000/api/produtos", newRecipe);
      setValidationModal({
        isOpen: true,
        title: "Sucesso!",
        message: `Receita "${recipeName}" adicionada com sucesso!`,
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      fetchRecipes().then(setRecipes);
      fetchInsumos().then(setInsumosEmEstoque);
      // Limpa o formulário
      setRecipeName("");
      setPrice("");
      setIngredients([initialIngredient]);
    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
      let errorMessage = "Ocorreu um erro ao adicionar a receita.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setValidationModal({
        isOpen: true,
        title: "Erro ao Adicionar",
        message: errorMessage,
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
    }
  };

  const openDeleteModal = (name: string) => {
    setRecipeToDelete(name);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setRecipeToDelete(null);
  };

  const handleDeleteRecipe = async () => {
    if (recipeToDelete === null) return;

    try {
      await axios.delete(`http://localhost:3000/api/produtos/`, { data: { nome: recipeToDelete } });
      setValidationModal({
        isOpen: true,
        title: "Receita Apagada",
        message: "A receita foi apagada com sucesso.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      fetchRecipes().then(setRecipes);
      closeDeleteModal();
    } catch (error) {
      console.error("Erro ao apagar receita:", error);
      setValidationModal({
        isOpen: true,
        title: "Erro ao Apagar",
        message: "Não foi possível apagar a receita.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
    }
  };

  // --- Funções para o Modal de Edição ---

  const openEditModal = (recipe: IRecipe) => {
    setRecipeToEdit(JSON.parse(JSON.stringify(recipe)));
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setValidationModal({
      isOpen: true,
      title: "Sair sem Salvar?",
      message: "Você tem certeza que deseja sair? Todas as alterações não salvas serão perdidas.",
      onConfirm: () => {
        setIsEditModalOpen(false);
        setRecipeToEdit(null);
        setValidationModal({ ...validationModal, isOpen: false });
      },
    });
  };

  const handleRecipeEditChange = (field: keyof IRecipe, value: string | number) => {
    if (recipeToEdit) {
      setRecipeToEdit({ ...recipeToEdit, [field]: value });
    }
  };

  const handleEditIngredientChange = (id: number | string, field: keyof IIngredient, value: string) => {
    if (recipeToEdit) {
      const updatedIngredients = recipeToEdit.ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      );
      setRecipeToEdit({ ...recipeToEdit, ingredients: updatedIngredients });
    }
  };

  const handleAddIngredientToEdit = () => {
    if (recipeToEdit) {
      const newIngredient: IIngredient = { id: genId(), name: "", quantity: "" };
      setRecipeToEdit({ ...recipeToEdit, ingredients: [...recipeToEdit.ingredients, newIngredient] });
    }
  };

  const handleRemoveIngredientFromEdit = (id: number | string) => {
    if (recipeToEdit) {
      const updatedIngredients = recipeToEdit.ingredients.filter((ing) => ing.id !== id);
      setRecipeToEdit({ ...recipeToEdit, ingredients: updatedIngredients });
    }
  };

  const handleUpdateRecipe = () => {
    if (!recipeToEdit) return;

    const { name, price } = recipeToEdit;
    if (!name || !price) {
      setValidationModal({
        isOpen: true,
        title: "Campos Obrigatórios",
        message: "O nome e o valor da receita não podem ser vazios.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      return;
    }

    setValidationModal({
      isOpen: true,
      title: "Confirmar Alterações?",
      message: "Tem certeza que deseja salvar as alterações?",
      onConfirm: confirmUpdateRecipe,
    });
  };

  const confirmUpdateRecipe = async () => {
    if (!recipeToEdit) return;

    const updatedRecipePayload = {
      nome: recipeToEdit.name,
      preco: recipeToEdit.price,
      insumos: recipeToEdit.ingredients.map((ing) => ({
        nome: ing.name,
        quantidade: parseFloat(ing.quantity) || 0,
      })),
    };

    try {
      await axios.put(`http://localhost:3000/api/produtos/${recipeToEdit.name}`, updatedRecipePayload);
      setValidationModal({
        isOpen: true,
        title: "Sucesso!",
        message: `Receita "${recipeToEdit.name}" atualizada com sucesso!`,
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      fetchRecipes().then(setRecipes);
      setIsEditModalOpen(false);
      setRecipeToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar receita:", error);
      setValidationModal({
        isOpen: true,
        title: "Erro ao Atualizar",
        message: "Não foi possível atualizar a receita. Verifique os dados.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
    }
  };

  return (
    <>
      <Header />
      <div className="produto-container">
        <h2>Adicionar Nova Receita</h2>
        <form onSubmit={handleSubmit} className="produto-form">
          <div className="form-group">
            <label htmlFor="recipe-name">Nome da Receita/Produto:</label>
            <input
              type="text"
              id="recipe-name"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="recipe-price">Valor (R$):</label>
            <input
              type="number"
              id="recipe-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="Ex: 25.50"
              step="0.01"
              min="0"
            />
          </div>

          <h3 className="ingredientes-title">Ingredientes</h3>
          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className="ingrediente-item-row">
              <div className="form-group ingrediente-group">
                <label htmlFor={`ing-name-${ingredient.id}`}>Ingrediente:</label>
                <select
                  id={`ing-name-${ingredient.id}`}
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(ingredient.id, "name", e.target.value)}
                >
                  <option value="">Selecione um insumo</option>

                  {insumosEmEstoque.map((insumo) => (
                    <option key={insumo.id} value={insumo.nome}>
                      {insumo.nome} — {insumo.quantidade} {insumo.unidade}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group quantidade-group">
                <label htmlFor={`ing-qty-${ingredient.id}`}>Qtd:</label>
                <input
                  type="text"
                  id={`ing-qty-${ingredient.id}`}
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(ingredient.id, "quantity", e.target.value)}
                  placeholder="Ex: 500g"
                />
              </div>
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  className="remove-item-button"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={handleAddIngredient} className="add-item-button">
            Adicionar Ingrediente
          </button>

          <button type="submit" className="submit-button">
            Adicionar Receita
          </button>
        </form>
      </div>

      <div className="catalogo-container">
        <h2>Catálogo de Receitas</h2>
        <div className="receitas-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="receita-card">
              {/* Informações da receita movidas para fora de uma div separada para simplificar */}
              <h4 className="receita-nome">{recipe.name}</h4>
              <p className="receita-preco">R$ {recipe.price.toFixed(2).replace(".", ",")}</p>

              <div className="receita-card-actions">
                <button className="edit-button" onClick={() => openEditModal(recipe)}>
                  Editar
                </button>
                <button className="delete-button" onClick={() => openDeleteModal(recipe.name)}>
                  Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Você tem certeza que deseja apagar esta receita?</p>
            <div className="modal-actions">
              <button onClick={closeDeleteModal} className="cancel-button">
                Cancelar
              </button>
              <button onClick={handleDeleteRecipe} className="confirm-delete-button">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && recipeToEdit && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <h3>Editar Receita</h3>

            <div className="form-group">
              <label htmlFor="edit-recipe-name">Nome da Receita:</label>
              <input
                type="text"
                id="edit-recipe-name"
                value={recipeToEdit.name}
                onChange={(e) => handleRecipeEditChange("name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-recipe-price">Valor (R$):</label>
              <input
                type="number"
                id="edit-recipe-price"
                value={recipeToEdit.price}
                onChange={(e) => handleRecipeEditChange("price", parseFloat(e.target.value))}
                step="0.01"
                min="0"
              />
            </div>

            <h4 className="ingredientes-title-edit">Ingredientes</h4>
            {recipeToEdit.ingredients.map((ing) => (
              <div key={ing.id} className="ingrediente-item-row">
                <div className="form-group ingrediente-group">
                  <select value={ing.name} onChange={(e) => handleEditIngredientChange(ing.id, "name", e.target.value)}>
                    <option value="">Selecione um insumo</option>
                    {insumosEmEstoque.map((insumo) => (
                      <option key={insumo.id} value={insumo.nome}>
                        {insumo.nome} — {insumo.quantidade} {insumo.unidade}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group quantidade-group">
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) => handleEditIngredientChange(ing.id, "quantity", e.target.value)}
                    placeholder="Qtd."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredientFromEdit(ing.id)}
                  className="remove-item-button"
                >
                  &times;
                </button>
              </div>
            ))}

            <button type="button" onClick={handleAddIngredientToEdit} className="add-item-button-edit">
              + Adicionar Ingrediente
            </button>

            <div className="modal-actions">
              <button onClick={closeEditModal} className="cancel-button">
                Voltar
              </button>
              <button onClick={handleUpdateRecipe} className="confirm-edit-button">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validação Genérico */}
      {validationModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{validationModal.title}</h3>
            <p>{validationModal.message}</p>
            <div className="modal-actions">
              {validationModal.title.includes("?") ? ( // Verifica se é uma pergunta para mostrar o botão de cancelar
                <button
                  onClick={() => setValidationModal({ ...validationModal, isOpen: false })}
                  className="cancel-button"
                >
                  Cancelar
                </button>
              ) : null}
              <button onClick={validationModal.onConfirm} className="confirm-edit-button">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
};

export default ProdutoPage;
