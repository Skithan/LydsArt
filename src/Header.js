import React from 'react';
import './App.css';


function Header({ onNavigate }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleMenuToggle = () => setMenuOpen((open) => !open);

  return (
    <header className="Header">
      <div className="header-title">Lydia Paterson</div>
      <nav className="header-nav">
        <button className="menu-toggle" onClick={handleMenuToggle} aria-label="Menu">
          &#9776;
        </button>
        <ul className={`nav-list${menuOpen ? ' open' : ''}`}>
          <li><button className="nav-link-btn" onClick={() => { onNavigate && onNavigate('home'); setMenuOpen(false); }}>Home</button></li>
          <li><button className="nav-link-btn" onClick={() => { onNavigate && onNavigate('artwork'); setMenuOpen(false); }}>Artwork</button></li>
          <li><button className="nav-link-btn" onClick={() => { onNavigate && onNavigate('contact'); setMenuOpen(false); }}>Contact</button></li>
           <li><button className="nav-link-btn" onClick={() => { onNavigate && onNavigate('cart'); setMenuOpen(false); }}>Cart</button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
