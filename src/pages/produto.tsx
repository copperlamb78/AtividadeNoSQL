import React, { useState } from "react";
import Header from "../components/Header"; // Corrigido para o caminho correto
import Navbar from "../components/Navbar";
import "./produto.css";

interface Ingredient {
  id: number;
  name: string;
  quantity: string; // Usar string para flexibilidade (ex: "100g", "1 xícara")
}

// Exemplo de dados de receitas cadastradas que virão do seu backend
const createdRecipes = [
  { id: 1, name: "Bolo de Chocolate", price: 35.0 },
  { id: 2, name: "Torta de Morango", price: 45.5 },
  { id: 3, name: "Cupcake de Baunilha", price: 8.0 },
  { id: 4, name: "Cheesecake de Frutas Vermelhas", price: 55.0 },
];

const ProdutoPage: React.FC = () => {
  const [recipeName, setRecipeName] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: Date.now(), name: "", quantity: "" }]);

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
    alert(`Receita "${recipeName}" adicionada com sucesso!`);
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
              <div className="receita-card-info">
                <h4 className="receita-nome">{recipe.name}</h4>
                <p className="receita-preco">R$ {recipe.price.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="receita-card-actions">
                <button className="edit-button">Editar</button>
                <button className="delete-button">Apagar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default ProdutoPage;
