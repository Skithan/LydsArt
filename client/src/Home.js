import React from 'react';
import './App.css';

const Home = () => (
  <section id="home" className="home-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
    <img 
      src={process.env.PUBLIC_URL + '/Headshot.jpeg'} 
      alt="Lydia Paterson Headshot" 
      style={{ width: '220px', height: '220px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 4px 24px #0004', marginBottom: '2rem' }}
    />
    <div className="biography-text" style={{ maxWidth: '600px', textAlign: 'center', fontSize: '1.25rem', color: '#333333', background: '#fdf6e3', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)' }}>
      Lydia Paterson yada yada yada 
    </div>
  </section>
);

export default Home;
