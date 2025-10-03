import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [lastPressed, setLastPressed] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (path, label) => {
    setLastPressed(label);
    navigate(path);
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="Header">
      <div className="header-title">Lydia Paterson</div>
      
      <button className="menu-toggle" onClick={toggleMenu}>
        <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <nav className={`header-nav`}>
        <ul className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
          <li><button className="nav-link-btn" type="button"
            onClick={() => handleClick('/', 'Home')}
          >Home</button></li>
          <li><button className="nav-link-btn" type="button"
            onClick={() => handleClick('/artwork', 'Artwork')}
          >Artwork</button></li>
          <li><button className="nav-link-btn" type="button"
            onClick={() => handleClick('/contact', 'Contact')}
          >Contact</button></li>
          <li><button className="nav-link-btn" type="button"
            onClick={() => handleClick('/cart', 'Cart')}
          >Cart</button></li>
          <li><button className="nav-link-btn" type="button"
            onClick={() => handleClick('/success', 'Thank You')}
          >Thank You</button></li>
        </ul>
        {lastPressed && (
          <div style={{ marginTop: '1rem', color: '#a67c3a', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center' }}>
            Last pressed: {lastPressed}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
