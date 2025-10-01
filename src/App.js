import React, { useState } from 'react';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import Artwork from './Artwork';
import Contact from './Contact';
import Cart from './Cart';


function MainApp() {
  const [page, setPage] = useState('home');
  const [cartData, setCartData] = useState(null);

  // Handler for navigation
  const handleNav = (target, data) => {
    setPage(target);
    if (target === 'cart' && data) {
      setCartData(data);
    }
  };

  return (
    <div className="App">
      <div className="animated-bg" aria-hidden="true"></div>
      <div className="content">
        <Header onNavigate={handleNav} />
        {page === 'home' && <Home />}
        {page === 'artwork' && <Artwork onReserve={data => handleNav('cart', data)} />}
        {page === 'contact' && <Contact />}
        {page === 'cart' && <Cart card={cartData} />}
        <Footer/>
      </div>
    </div>
  );
}

function App() {
  return <MainApp />;
}

export default App;