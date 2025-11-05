import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Home = () => {
  const navigate = useNavigate();
  const touchStartY = useRef(null);
  const touchEndY = useRef(null);
  const isZooming = useRef(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  
  const contentRef = useRef(null);
  const buttonRef = useRef(null);


  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 1) {
      isZooming.current = true;
      return;
    }
    isZooming.current = false;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    if (isZooming.current) {
      isZooming.current = false;
      return;
    }
    touchEndY.current = e.changedTouches[0].screenY;
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fully enters view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === contentRef.current) {
            setContentVisible(true);
          } else if (entry.target === buttonRef.current) {
            setButtonVisible(true);
          }
        }
      });
    }, observerOptions);

    // Capture current ref values for cleanup
    const currentContentRef = contentRef.current;
    const currentButtonRef = buttonRef.current;

    // Start observing elements
    if (currentContentRef) observer.observe(currentContentRef);
    if (currentButtonRef) observer.observe(currentButtonRef);

    return () => {
      if (currentContentRef) observer.unobserve(currentContentRef);
      if (currentButtonRef) observer.unobserve(currentButtonRef);
    };
  }, []);

  return (
    <div 
      className="home-scroll-container"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        paddingBottom: '2rem'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <section id="home" className="home-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem', minHeight: 'calc(100vh - 4rem)' }}>
      <div 
        ref={contentRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: contentVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: contentVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <img 
          src={process.env.PUBLIC_URL + '/Headshot.jpeg'} 
          alt="Lydia Paterson Headshot" 
          style={{ 
            width: '220px', 
            height: '220px', 
            objectFit: 'cover', 
            borderRadius: '50%', 
            boxShadow: '0 4px 24px #0004', 
            marginBottom: '2rem'
          }}
        />
        <div 
          className="biography-text" 
          style={{ 
            maxWidth: '600px', 
            textAlign: 'center', 
            fontSize: '1.25rem', 
            color: '#333333', 
            background: '#ffffffdd', 
            padding: '2rem', 
            borderRadius: '1rem', 
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)', 
            marginBottom: '3rem'
          }}
        >
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          My practice, rooted primarily in oil and acrylic painting, explores themes of childhood, nostalgia, and the
          contradictions of change. I draw inspiration from the everyday--people, places, and connections that shape
          our experiences. My work reflects an attentiveness to both the small details and the expansive: the softness
          of light stretching across the sky, the sharp vibrancy of spring, and the fleeting moments that hold emotion
          in their simplest forms.
        </p>
        
        <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
          As my practice continues to evolve, I've come to recognize how its themes echo past joys and the
          elements of childhood I revisit as I move into adulthood. Much like my surroundings and experiences,
          both past and present, my work mirrors this change, prompting shifts in style, theme, and subject.
        </p>
        </div>
      </div>
      
      <div 
        ref={buttonRef}
        style={{ 
          marginBottom: '4rem',
          transform: buttonVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: buttonVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <button 
          onClick={() => navigate('/artwork')}
          style={{
            background: '#666666',
            color: '#ffffff',
            border: 'none',
            padding: '1rem 2.5rem',
            fontSize: '1.3rem',
            fontWeight: '600',
            fontFamily: 'Playfair Display, Inter, serif',
            borderRadius: '2rem',
            cursor: 'pointer',
            letterSpacing: '1px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.target.style.background = '#333333';
            e.target.style.transform = buttonVisible ? 'translateY(-2px)' : 'translateX(-200px) scale(0.3)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={e => {
            e.target.style.background = '#666666';
            e.target.style.transform = buttonVisible ? 'translateY(0)' : 'translateX(-200px) scale(0.3)';
            e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
          }}
        >
          Browse
        </button>
        <br></br>
      </div>
    </section>
    </div>
  );
};

export default Home;
