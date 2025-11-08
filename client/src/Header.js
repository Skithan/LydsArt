import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

function Header() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAdmin } = useAuth();

  const triggerWave = () => {
    setIsWaving(true);
    // Reset animation after it completes
    setTimeout(() => {
      setIsWaving(false);
    }, 1000); // Duration should match total animation time
  };

  const handleClick = (path) => {
    triggerWave(); // Start wave animation
    navigate(path);
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Split text into individual letters for wave animation
  const renderWaveText = (text) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className={`wave-letter ${isWaving ? 'animate' : ''}`}
        style={{
          display: 'inline-block',
          animationDelay: `${index * 0.05}s`
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <header className="Header">
      <div className="header-title">
        {renderWaveText('Lydia Paterson')}
      </div>
      
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
          >Artwork!</button></li>
          <li><button className="nav-link-btn" type="button"
            onClick={() => handleClick('/contact', 'Contact')}
          >Contact</button></li>
           <li><button className="nav-link-btn" type="button"
            onClick={() => handleClick('/cart', 'Cart')}
            style={{ position: 'relative' }}
          >
            Cart
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#333333',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button></li>
          {isAdmin && (
            <li><button className="nav-link-btn admin-nav-link" type="button"
              onClick={() => handleClick('/admin/dashboard')}
              title="Admin Dashboard"
            >
              Admin
            </button></li>
          )}
      </ul>
      </nav>
      
      <div className={`header-wave-line ${isWaving ? 'animate' : ''}`}></div>
    </header>
  );
}

export default Header;
