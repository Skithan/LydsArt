import React from 'react';
import './App.css';

const Contact = () => (
  <section id="contact" className="contact-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem' }}>
    <a 
      href="https://www.instagram.com/lydiapatersonart/" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', textDecoration: 'none', fontWeight: 500, gap: '1rem', padding: '1rem 2rem', background: '#6d4c1bca', borderRadius: '1rem', boxShadow: '0 2px 12px #0006' }}
    >
      <img src={process.env.PUBLIC_URL + '/InstaLogo.png'} alt="Instagram" style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '1rem' }} />
      <span style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>Instagram</span>
    </a>
  </section>
);

export default Contact;
