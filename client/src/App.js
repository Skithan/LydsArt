import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import Artwork from './Artwork';
import Contact from './Contact';
import Cart from './Cart';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ThankYou from './ThankYou';
import Footer from './Footer';



// MainApp handles navigation between pages using local state
const MainApp = () => {
  const [page, setPage] = useState('home');
  const [cartData, setCartData] = useState(null);

  // Handles navigation and passes data to Cart if needed
  const handleNav = (target, data) => {
    setPage(target);
    if (target === 'cart' && data) {
      setCartData(data);
    }
  };

  return (
    <>
      <Header onNavigate={handleNav} />
      {page === 'home' && <Home />}
      {page === 'artwork' && <Artwork onReserve={data => handleNav('cart', data)} />}
      {page === 'contact' && <Contact />}
      {page === 'cart' && <Cart card={cartData} />}
    </>
  );
};

// Router handles browser navigation and deep linking
const App = () => (
  <Router>
    <Routes>
      {/* Main app at root path */}
      <Route path="/" element={<MainApp />} />
      {/* Thank you page for Stripe return_url */}
      <Route path="/success" element={<ThankYou />} />
    </Routes>
  </Router>
);

export default App;