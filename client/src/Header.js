import React from 'react';
import './App.css';


function Header({ onNavigate }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleMenuToggle = () => setMenuOpen((open) => !open);

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
          <li><button className="nav-link-btn" onClick={() => { onNavigate && onNavigate('home'); setMenuOpen(false); }}>Home</button></li>
          <li><button className="nav-link-btn" onClick={() => { onNavigate && onNavigate('artwork'); setMenuOpen(false); }}>Artwork</button></li>
          <li><button className="nav-link-btn" onClick={() => { onNavigate && onNavigate('contact'); setMenuOpen(false); }}>Contact</button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
