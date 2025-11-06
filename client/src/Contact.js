import React, { useRef, useState, useEffect } from 'react';
import './App.css';

const Contact = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [instagramVisible, setInstagramVisible] = useState(false);
  
  const titleRef = useRef(null);
  const instagramRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fully enters view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === titleRef.current) {
            setTitleVisible(true);
          } else if (entry.target === instagramRef.current) {
            setInstagramVisible(true);
          }
        }
      });
    }, observerOptions);

    // Capture current ref values for cleanup
    const currentTitleRef = titleRef.current;
    const currentInstagramRef = instagramRef.current;

    // Start observing elements
    if (currentTitleRef) observer.observe(currentTitleRef);
    if (currentInstagramRef) observer.observe(currentInstagramRef);

    return () => {
      if (currentTitleRef) observer.unobserve(currentTitleRef);
      if (currentInstagramRef) observer.unobserve(currentInstagramRef);
    };
  }, []);

  return (
    <div 
      className="contact-scroll-container"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        paddingBottom: '8rem'
      }}
    >
      <section id="contact" className="contact-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem', gap: '2rem', minHeight: 'calc(100vh - 4rem)' }}>

        <h2 
          ref={titleRef}
          style={{ 
            fontWeight: 700, 
            fontSize: '1.2rem', 
            color: '#333333',
            transform: titleVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
            opacity: titleVisible ? 1 : 0.3,
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          Checkout my Instagram
        </h2>

        <div 
          ref={instagramRef}
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            minHeight: '480px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: '#f7f7f0dd', 
            borderRadius: '1rem', 
            boxShadow: '0 2px 12px #0002', 
            padding: '1rem',
            transform: instagramVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
            opacity: instagramVisible ? 1 : 0.3,
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            marginBottom: '15rem'
          }}
        >
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
    </div>
  );
};

export default Contact;
