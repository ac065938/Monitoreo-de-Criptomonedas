import React, { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-title">CriptoPrecios</div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><a href="#bitcoin">Bitcoin</a></li>
        <li><a href="#ethereum">Ethereum</a></li>
        <li><a href="#bnb">BNB</a></li>
        {/* Agrega más enlaces si lo deseas */}
      </ul>
    </nav>
  );
}

export default Navbar;
