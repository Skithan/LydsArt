import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

function Header() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
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

  const handleClick = (path, label) => {
    triggerWave(); // Start wave animation
    navigate(path);
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    triggerWave();
    
    // Reset click count after 3 seconds of inactivity
    setTimeout(() => {
      setClickCount(0);
    }, 3000);
    
    // Show admin access after 5 clicks
    if (clickCount === 4) {
      setShowAdminAccess(true);
      setClickCount(0);
      // Hide admin access after 10 seconds
      setTimeout(() => {
        setShowAdminAccess(false);
      }, 10000);
    }
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
      <div className="header-title" onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
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
          >Artwork</button></li>
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
                background: '#c62828',
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
              onClick={() => handleClick('/admin/dashboard', 'Admin')}
              title="Admin Dashboard"
            >
              Admin
            </button></li>
          )}
          {!isAdmin && showAdminAccess && (
            <li><button className="nav-link-btn admin-login-link" type="button"
              onClick={() => handleClick('/admin/login', 'Admin Login')}
              title="Admin Login"
            >
              🔐 Admin Login
            </button></li>
          )}
      </ul>
      </nav>
      
      {showAdminAccess && !isAdmin && (
        <div className="admin-access-notification">
          <span>Admin access enabled</span>
        </div>
      )}
      
      <div className={`header-wave-line ${isWaving ? 'animate' : ''}`}></div>
    </header>
  );
}

export default Header;
