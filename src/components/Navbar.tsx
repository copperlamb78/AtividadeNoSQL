import React from "react";
import "./Navbar.css";
import { FaClipboardList, FaBoxes, FaBook, FaChartBar } from "react-icons/fa";
import type { JSX } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";

interface NavItem {
  id: string;
  icon: JSX.Element;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: "relatorios", icon: <FaChartBar />, label: "Relatórios", path: "/relatorios" },
  { id: "pedidos", icon: <FaClipboardList />, label: "Pedidos", path: "/pedidos" },
  { id: "receitas", icon: <FaBook />, label: "Receitas", path: "/" },
  { id: "estoque", icon: <FaBoxes />, label: "Estoque", path: "/estoque" },
];

const Navbar: React.FC = () => {
  return (
    <nav className="floating-navbar">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          // A classe 'active' será adicionada automaticamente pelo NavLink
          className="nav-item"
          title={item.label}
        >
          <div className="nav-icon">{item.icon}</div>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
