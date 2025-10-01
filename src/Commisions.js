import React from 'react';
import './App.css';

const Commisions = () => (
  <section id="commisions" className="commisions-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
    <h2 style={{ fontWeight: 700, fontSize: '2rem', color: '#8c6a2a', marginBottom: '1.5rem' }}>Commissions</h2>
    <div style={{ maxWidth: '600px', textAlign: 'center', fontSize: '1.25rem', color: '#6d4c1b', background: 'linear-gradient(90deg, #f7ecd0 0%, #f3e3b3 100%)', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 12px #0006' }}>
      Lydia would love to create a custom piece for you!<br /><br />
      Contact her at <a href="mailto:ethanalward@outlook.com" style={{ color: '#a67c3a', textDecoration: 'underline' }}>ethanalward@outlook.com</a> or on Instagram <a href="https://www.instagram.com/lyds.art/" target="_blank" rel="noopener noreferrer" style={{ color: '#a67c3a', textDecoration: 'underline' }}>@lyds.art</a>.
    </div>
  </section>
);

export default Commisions;
