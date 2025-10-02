import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import Artwork from './Artwork';
import Contact from './Contact';
import Cart from './Cart';
import ThankYou from './ThankYou';
import Footer from './Footer';

import './App.css';

const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/artwork" element={<Artwork />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/success" element={<ThankYou />} />
    </Routes>
    <Footer />
  </Router>
);

export default App;