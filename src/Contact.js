import React from 'react';
import './App.css';

const Contact = () => (
  <section id="contact" className="contact-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem', gap: '2rem' }}>

    <h2 style={{ fontWeight: 700, fontSize: '1.2rem', color: '#8c6a2a', textShadow: '0 2px 12px #f3e3b355, 0 1px 0 #fffbe6' }}>
      Connect with me on Instagram
    </h2> 

    <div style={{ width: '100%', maxWidth: '400px', minHeight: '480px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fffbe6', borderRadius: '1rem', boxShadow: '0 2px 12px #0002', padding: '1rem' }}>
      <iframe
        src="https://www.instagram.com/lydiapatersonart/embed"
        title="Instagram Feed"
        width="100%"
        height="480"
        frameBorder="0"
        scrolling="no"
        allowtransparency="true"
        style={{ border: 'none', borderRadius: '1rem', width: '100%', minHeight: '480px' }}
      ></iframe>
    </div>
  </section>
);

export default Contact;
