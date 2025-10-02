import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Header({ onNavigate }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleMenuToggle = () => setMenuOpen((open) => !open);

  const navigate = useNavigate();
  return (
    <header className="Header">
      <div className="header-title">Lydia Paterson Art</div>
      <nav className="header-nav">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <button className="menu-toggle" onClick={handleMenuToggle} aria-label="Menu">
            &#9776;
          </button>
        </div>
        <ul className={`nav-list${menuOpen ? ' open' : ''}`}>
          <li><button className="nav-link-btn" onClick={() => navigate('/')}>Home</button></li>
          <li><button className="nav-link-btn" onClick={() => navigate('/artwork')}>Artwork</button></li>
          <li><button className="nav-link-btn" onClick={() => navigate('/contact')}>Contact</button></li>
          <li><button className="nav-link-btn" onClick={() => navigate('/cart')}>Cart</button></li>
          <li><button className="nav-link-btn" onClick={() => navigate('/success')}>Thank You</button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
