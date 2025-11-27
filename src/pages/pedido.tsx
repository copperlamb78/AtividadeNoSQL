import React, { useState } from "react";
import "./pedido.css"; // Certifique-se de que o caminho está correto
import Header from "../components/Header";
import Navbar from "../components/Navbar";

// Exemplo de dados de produtos (receitas) que virão do seu backend
const availableProducts = [
  { id: 1, name: "Bolo de Chocolate" },
  { id: 2, name: "Torta de Morango" },
  { id: 3, name: "Cupcake de Baunilha" },
  { id: 4, name: "Cheesecake de Frutas Vermelhas" },
];

// Exemplo de dados do histórico de pedidos que virão do seu backend
const orderHistory = [
  { id: "A1B2-C3D4", recipe: "1x Bolo de Chocolate", status: "Entregue" },
  { id: "E5F6-G7H8", recipe: "2x Torta de Morango", status: "Em preparo" },
  { id: "I9J0-K1L2", recipe: "1x Cheesecake de Frutas Vermelhas", status: "Cancelado" },
  { id: "M3N4-O5P6", recipe: "5x Cupcake de Baunilha", status: "Entregue" },
];

// Interface para um item do pedido
interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
}

const PedidoPage: React.FC = () => {
  const [items, setItems] = useState<OrderItem[]>([{ id: Date.now(), productName: "", quantity: 1 }]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), productName: "", quantity: 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof OrderItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validItems = items.filter((item) => item.productName);
    if (validItems.length === 0) {
      alert("Por favor, adicione pelo menos um produto ao pedido.");
      return;
    }
    // Aqui você adicionaria a lógica para enviar o pedido para a sua API
    console.log("Pedido realizado com os seguintes itens:", validItems);
    alert(`Pedido realizado com ${validItems.length} tipo(s) de produto(s)!`);
  };

  return (
    <>
      <Header />
      <div className="pedido-container">
        <h2>Fazer um Pedido</h2>
        <form onSubmit={handleSubmit} className="pedido-form">
          {items.map((item, index) => (
            <div key={item.id} className="pedido-item-row">
              <div className="form-group product-group">
                <label htmlFor={`product-select-${item.id}`}>Produto:</label>
                <select
                  id={`product-select-${item.id}`}
                  value={item.productName}
                  onChange={(e) => handleItemChange(item.id, "productName", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Escolha um produto...
                  </option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group quantity-group">
                <label htmlFor={`quantity-select-${item.id}`}>Qtd:</label>
                <select
                  id={`quantity-select-${item.id}`}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                  required
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(item.id)} className="remove-item-button">
                  &times;
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={handleAddItem} className="add-item-button">
            Adicionar Novo Produto
          </button>

          <button type="submit" className="submit-button">
            Fazer Pedido
          </button>
        </form>

        <div className="historico-pedidos-container">
          <h3>Histórico de Pedidos</h3>
          <div className="pedidos-list">
            {orderHistory.map((order) => (
              <div key={order.id} className="pedido-item">
                <div className="pedido-info">
                  <span className="pedido-id">ID: {order.id}</span>
                  <span className="pedido-receita">{order.recipe}</span>
                </div>
                <div className={`pedido-status status-${order.status.toLowerCase().replace(" ", "-")}`}>
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default PedidoPage;
