import React from "react";
import "./Header.css"; // Importe o novo arquivo CSS

// --- Component ---

const Header: React.FC = () => {
  return (
    <header className="header-container">
      <h1 className="header-title">ConfeitaPro</h1>
      <span className="header-emoji">🍰</span>
    </header>
  );
};

export default Header;
