import { Route, Routes } from "react-router-dom";
import App from "./App";
import PedidoPage from "./pages/pedido";
import ProdutoPage from "./pages/produto";
import InsumoPage from "./pages/insumo";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProdutoPage />} />
      <Route path="/pedidos" element={<PedidoPage />} />
      <Route path="/estoque" element={<InsumoPage />} />
      <Route path="/relatorios" element={<App />} />
      {/* Adicione outras rotas aqui no futuro */}
    </Routes>
  );
};

export default AppRoutes;
