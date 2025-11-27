import React, { useState, useEffect } from "react";
import "./pedido.css";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import axios from "axios";

// Interfaces
interface Product {
  id: string;
  name: string;
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
}

interface Order {
  _id: string;
  produtos: { nome: string; quantidade: number }[];
  status: "Pendente" | "Entregue" | "Cancelado";
  data: string;
  ReceitaTotal: number;
}

const statusMap = {
  Pendente: { text: "Em preparo", className: "status-em-preparo" },
  Entregue: { text: "Entregue", className: "status-entregue" },
  Cancelado: { text: "Cancelado", className: "status-cancelado" },
};

const PedidoPage: React.FC = () => {
  const [items, setItems] = useState<OrderItem[]>([{ id: Date.now(), productName: "", quantity: 1 }]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [validationModal, setValidationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/produtos");
      if (res.data && Array.isArray(res.data.produtos)) {
        setAvailableProducts(res.data.produtos.map((p: any) => ({ id: p._id, name: p.nome })));
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/pedidos");
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), productName: "", quantity: 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof OrderItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validItems = items.filter((item) => item.productName);
    if (validItems.length === 0) {
      setValidationModal({
        isOpen: true,
        title: "Nenhum produto",
        message: "Por favor, adicione pelo menos um produto ao pedido.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      return;
    }

    const newOrderPayload = {
      produtos: validItems.map((item) => ({
        nome: item.productName,
        quantidade: item.quantity,
      })),
    };

    try {
      await axios.post("http://localhost:3000/api/pedidos", newOrderPayload);
      setValidationModal({
        isOpen: true,
        title: "Pedido Realizado!",
        message: "Seu pedido foi criado com sucesso.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      fetchOrders(); // Refresh orders list
      setItems([{ id: Date.now(), productName: "", quantity: 1 }]); // Reset form
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      let errorMessage = "Não foi possível realizar o pedido.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setValidationModal({
        isOpen: true,
        title: "Erro no Pedido",
        message: errorMessage,
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
    }
  };

  const openConfirmDeliveryModal = (orderId: string) => {
    setValidationModal({
      isOpen: true,
      title: "Confirmar Entrega?",
      message: `Você tem certeza que deseja marcar o pedido como entregue?`,
      onConfirm: () => {
        handleMarkAsDelivered(orderId);
        setValidationModal({ ...validationModal, isOpen: false });
      },
    });
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      await axios.put(`http://localhost:3000/api/pedidos/${orderId}/deliver`);
      setValidationModal({
        isOpen: true,
        title: "Status Alterado",
        message: "O pedido foi marcado como entregue.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error("Erro ao marcar como entregue:", error);
      setValidationModal({
        isOpen: true,
        title: "Erro",
        message: "Não foi possível atualizar o status do pedido.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
    }
  };

  const openCancelModal = (orderId: string) => {
    setValidationModal({
      isOpen: true,
      title: "Confirmar Cancelamento?",
      message: "Você tem certeza que deseja cancelar este pedido?",
      onConfirm: () => {
        handleCancelOrder(orderId);
        setValidationModal({ ...validationModal, isOpen: false });
      },
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/pedidos/${orderId}/cancel`);
      setValidationModal({
        isOpen: true,
        title: "Pedido Cancelado",
        message: "O pedido foi cancelado com sucesso.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      setValidationModal({
        isOpen: true,
        title: "Erro",
        message: "Não foi possível cancelar o pedido.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
    }
  };

  const openDeleteModal = (orderId: string) => {
    setValidationModal({
      isOpen: true,
      title: "Confirmar Exclusão?",
      message: "Você tem certeza que deseja apagar este pedido? Esta ação não pode ser desfeita.",
      onConfirm: () => {
        handleDeleteOrder(orderId);
        setValidationModal({ ...validationModal, isOpen: false });
      },
    });
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/pedidos/${orderId}`);
      setValidationModal({
        isOpen: true,
        title: "Pedido Apagado",
        message: "O pedido foi apagado com sucesso.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Erro ao apagar pedido:", error);
      setValidationModal({
        isOpen: true,
        title: "Erro",
        message: "Não foi possível apagar o pedido.",
        onConfirm: () => setValidationModal({ ...validationModal, isOpen: false }),
      });
    }
  };

  return (
    <>
      <Header />
      <div className="pedido-container">
        <h2>Fazer um Pedido</h2>
        <form onSubmit={handleSubmit} className="pedido-form">
          {items.map((item) => (
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
                <input
                  type="number"
                  id={`quantity-select-${item.id}`}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                  required
                  min="1"
                  className="quantity-input"
                />
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
            {orders.map((order) => (
              <div key={order._id} className="pedido-item">
                <div className="pedido-info">
                  <span className="pedido-id">ID: {order._id}</span>
                  <span className="pedido-receita">
                    {order.produtos.map((p) => `${p.quantidade}x ${p.nome}`).join(", ")}
                  </span>
                </div>
                <div className="pedido-item-right">
                  <div className="pedido-actions">
                    {order.status === "Pendente" && (
                      <>
                        <button onClick={() => openConfirmDeliveryModal(order._id)} className="confirm-delivery-button">
                          Entregue
                        </button>
                        <button onClick={() => openCancelModal(order._id)} className="cancel-order-button">
                          Cancelar
                        </button>
                      </>
                    )}
                    <button onClick={() => openDeleteModal(order._id)} className="delete-order-button">
                      Apagar
                    </button>
                  </div>
                  <div className={`pedido-status ${statusMap[order.status]?.className || ''}`}>
                    {statusMap[order.status]?.text || order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  onClick={validationModal.onConfirm}
                  className={validationModal.title.includes("?") ? "confirm-delivery-modal-button" : "confirm-button"}
                >
                  {validationModal.title.includes("?") ? "Sim" : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Navbar />
    </>
  );
};

export default PedidoPage;
