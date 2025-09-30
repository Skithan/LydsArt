import React, { useState } from 'react';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import Artwork from './Artwork';
import Contact from './Contact';

function MainApp() {
  const [page, setPage] = useState('home');

  // Handler for navigation
  const handleNav = (target) => setPage(target);

  return (
    <div className="App">
      <div className="animated-bg" aria-hidden="true"></div>
      <div className="content">
        <Header onNavigate={handleNav} />
        {page === 'home' && <Home />}
        {page === 'artwork' && <Artwork />}
        {page === 'contact' && <Contact />}
      </div>
    </div>
  );
}

function App() {
  return <MainApp />;
}

export default App;