import React, { useState } from "react";
import Header from "../components/Header"; // Corrigido para o caminho correto
import Navbar from "../components/Navbar";
import "./produto.css";

interface Ingredient {
  id: number;
  name: string;
  quantity: string; // Usar string para flexibilidade (ex: "100g", "1 xícara")
}

interface Recipe {
  id: number;
  name: string;
  price: number;
  ingredients: Ingredient[];
}

// Exemplo de dados de receitas cadastradas que virão do seu backend
const createdRecipes = [
  {
    id: 1,
    name: "Bolo de Chocolate",
    price: 35.0,
    ingredients: [
      { id: 1, name: "Chocolate em Pó", quantity: "200g" },
      { id: 2, name: "Farinha", quantity: "300g" },
    ],
  },
  { id: 2, name: "Torta de Morango", price: 45.5, ingredients: [{ id: 1, name: "Morangos", quantity: "500g" }] },
  {
    id: 3,
    name: "Cupcake de Baunilha",
    price: 8.0,
    ingredients: [{ id: 1, name: "Essência de Baunilha", quantity: "10ml" }],
  },
  { id: 4, name: "Cheesecake de Frutas Vermelhas", price: 55.0, ingredients: [] },
];

const ProdutoPage: React.FC = () => {
  const [recipeName, setRecipeName] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: Date.now(), name: "", quantity: "" }]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  // Estado para o modal de validação/confirmação genérico
  const [validationModal, setValidationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: Date.now(), name: "", quantity: "" }]);
  };

  const handleRemoveIngredient = (id: number) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleIngredientChange = (id: number, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validIngredients = ingredients.filter((ing) => ing.name && ing.quantity);
    if (!recipeName || !price) {
      alert("Por favor, preencha o nome e o valor da receita.");
      return;
    }
    if (validIngredients.length === 0) {
      alert("Adicione pelo menos um ingrediente válido.");
      return;
    }

    const newRecipe = {
      nome: recipeName,
      preco: parseFloat(price),
      insumos: validIngredients.map(({ name, quantity }) => ({ nome: name, quantidade: quantity })),
    };

    // Lógica para enviar a nova receita para a API
    console.log("Nova Receita:", newRecipe);
    setValidationModal({
      isOpen: true,
      title: "Sucesso!",
      message: `Receita "${recipeName}" adicionada com sucesso!`,
      onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
    });
  };

  const openDeleteModal = (id: number) => {
    setRecipeToDelete(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setRecipeToDelete(null);
  };

  const handleDeleteRecipe = () => {
    if (recipeToDelete !== null) {
      console.log(`Deletando receita com ID: ${recipeToDelete}`);
      setValidationModal({
        isOpen: true,
        title: "Receita Apagada",
        message: `A receita com ID ${recipeToDelete} foi apagada com sucesso! (simulação)`,
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      closeDeleteModal();
    }
  };

  // --- Funções para o Modal de Edição ---

  const openEditModal = (recipe: Recipe) => {
    // Cria uma cópia profunda para evitar mutação direta do estado original
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

  const handleRecipeEditChange = (field: keyof Recipe, value: string | number) => {
    if (recipeToEdit) {
      setRecipeToEdit({ ...recipeToEdit, [field]: value });
    }
  };

  const handleEditIngredientChange = (id: number, field: keyof Ingredient, value: string) => {
    if (recipeToEdit) {
      const updatedIngredients = recipeToEdit.ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      );
      setRecipeToEdit({ ...recipeToEdit, ingredients: updatedIngredients });
    }
  };

  const handleAddIngredientToEdit = () => {
    if (recipeToEdit) {
      const newIngredient: Ingredient = { id: Date.now(), name: "", quantity: "" };
      setRecipeToEdit({ ...recipeToEdit, ingredients: [...recipeToEdit.ingredients, newIngredient] });
    }
  };

  const handleRemoveIngredientFromEdit = (id: number) => {
    if (recipeToEdit) {
      const updatedIngredients = recipeToEdit.ingredients.filter((ing) => ing.id !== id);
      setRecipeToEdit({ ...recipeToEdit, ingredients: updatedIngredients });
    }
  };

  const handleUpdateRecipe = () => {
    setValidationModal({
      isOpen: true,
      title: "Confirmar Alterações?",
      message: "Tem certeza que deseja salvar as alterações?",
      onConfirm: confirmUpdateRecipe,
    });
    if (!recipeToEdit) return;

    const { name, price, ingredients } = recipeToEdit;
    if (!name || !price) {
      setValidationModal({
        isOpen: true,
        title: "Campos Obrigatórios",
        message: "O nome e o valor da receita não podem ser vazios.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      return;
    }
  };

  const confirmUpdateRecipe = () => {
    if (!recipeToEdit) return;
    // Lógica para enviar a receita atualizada para a API
    console.log("Receita Atualizada:", recipeToEdit);
    setValidationModal({
      isOpen: true,
      title: "Sucesso!",
      message: `Receita "${recipeToEdit.name}" atualizada com sucesso! (simulação)`,
      onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
    });
    setIsEditModalOpen(false);
    setRecipeToEdit(null);
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
                <input
                  type="text"
                  id={`ing-name-${ingredient.id}`}
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(ingredient.id, "name", e.target.value)}
                  placeholder="Ex: Farinha de trigo"
                />
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
          {createdRecipes.map((recipe) => (
            <div key={recipe.id} className="receita-card">
              {/* Informações da receita movidas para fora de uma div separada para simplificar */}
              <h4 className="receita-nome">{recipe.name}</h4>
              <p className="receita-preco">R$ {recipe.price.toFixed(2).replace(".", ",")}</p>

              <div className="receita-card-actions">
                <button className="edit-button" onClick={() => openEditModal(recipe as Recipe)}>
                  Editar
                </button>
                <button className="delete-button" onClick={() => openDeleteModal(recipe.id)}>
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
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => handleEditIngredientChange(ing.id, "name", e.target.value)}
                    placeholder="Nome do ingrediente"
                  />
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
