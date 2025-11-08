import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './App.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const touchStartY = useRef(null);
  const touchEndY = useRef(null);
  const isZooming = useRef(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [practiceVisible, setPracticeVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [showClickFeedback, setShowClickFeedback] = useState(false);
  const [headshotShake, setHeadshotShake] = useState(false);
  
  const contentRef = useRef(null);
  const practiceRef = useRef(null);
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

  const handleHeadshotClick = () => {
    if (isAdmin) return; // Don't trigger if already admin
    console.log(`Headshot clicked ${clickCount}`);

    // Trigger shake animation
    setHeadshotShake(true);
    setTimeout(() => setHeadshotShake(false), 300);
    
    // Update click count
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Show click feedback with tally marks
    setShowClickFeedback(true);
    
    // Reset click count and hide feedback after 3 seconds of inactivity
    setTimeout(() => {
      setClickCount(0);
      setShowClickFeedback(false);
    }, 3000);
    
    // Show admin access after 5 clicks
    if (newCount === 5) {
      setShowAdminAccess(true);
      setClickCount(0);
      setShowClickFeedback(false);
      // Hide admin access after 15 seconds
      setTimeout(() => {
        setShowAdminAccess(false);
      }, 15000);
    }
  };

  // Generate tally marks based on click count
  const getTallyMarks = (count) => {
    const marks = [];
    const groups = Math.floor(count / 5);
    const remainder = count % 5;
    
    // Add complete groups of 5 (crossed tally marks)
    for (let i = 0; i < groups; i++) {
      marks.push('🏛️'); // Using a different symbol for groups of 5
    }
    
    // Add individual marks for remainder
    for (let i = 0; i < remainder; i++) {
      marks.push('|');
    }
    
    return marks.join(' ');
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
          } else if (entry.target === practiceRef.current) {
            setPracticeVisible(true);
          } else if (entry.target === buttonRef.current) {
            setButtonVisible(true);
          }
        }
      });
    }, observerOptions);

    // Capture current ref values for cleanup
    const currentContentRef = contentRef.current;
    const currentPracticeRef = practiceRef.current;
    const currentButtonRef = buttonRef.current;

    // Start observing elements
    if (currentContentRef) observer.observe(currentContentRef);
    if (currentPracticeRef) observer.observe(currentPracticeRef);
    if (currentButtonRef) observer.observe(currentButtonRef);

    return () => {
      if (currentContentRef) observer.unobserve(currentContentRef);
      if (currentPracticeRef) observer.unobserve(currentPracticeRef);
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
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img 
            src={process.env.PUBLIC_URL + '/Headshot.jpeg'} 
            alt="Lydia Paterson Headshot" 
            onClick={handleHeadshotClick}
            style={{ 
              width: '220px', 
              height: '220px', 
              objectFit: 'cover', 
              borderRadius: '50%', 
              boxShadow: '0 4px 24px #0004', 
              marginBottom: '2rem',
              cursor: isAdmin ? 'default' : 'pointer',
              userSelect: 'none',
              transition: 'all 0.3s ease',
              transform: headshotShake ? 'scale(1.05) rotate(2deg)' : 'scale(1) rotate(0deg)',
              filter: clickCount > 0 ? 'brightness(1.1) saturate(1.2)' : 'brightness(1) saturate(1)'
            }}
          />
          
          {/* Click Feedback with Tally Marks */}
          {showClickFeedback && clickCount > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(51, 51, 51, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                zIndex: 10,
                animation: 'tallyPop 0.3s ease-out',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                fontFamily: 'monospace'
              }}
            >
              <span style={{ marginRight: '8px' }}>{getTallyMarks(clickCount)}</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                {clickCount}/5
              </span>
            </div>
          )}
          
          {/* Progress indicator */}
          {showClickFeedback && clickCount > 0 && clickCount < 5 && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${(clickCount / 5) * 100}%`,
                height: '4px',
                background: 'linear-gradient(90deg, #333333, #666666)',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            />
          )}
        </div>
      </div>
      
      <div 
        ref={practiceRef}
        style={{
          transform: practiceVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: practiceVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          marginBottom: '2rem'
        }}
      >
        <h2 
          style={{
            fontSize: '2.2rem',
            fontWeight: '600',
            fontFamily: 'Playfair Display, Inter, serif',
            color: '#333333',
            textAlign: 'center',
            letterSpacing: '2px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '1rem'
          }}
        >
          My Practice
        </h2>
      </div>
      
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: practiceVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: practiceVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
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

      {/* Admin Access - appears after 5 headshot clicks */}
      {showAdminAccess && !isAdmin && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #333333, #555555)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            textAlign: 'center',
            animation: 'adminModalAppear 0.5s ease-out'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>🔐</span>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>Admin Access Enabled</h3>
            <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}>Executive access unlocked</p>
          </div>
          <button 
            onClick={() => navigate('/admin/login')}
            style={{
              background: 'white',
              color: '#333333',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }}
          >
            Enter Admin Portal
          </button>
        </div>
      )}
    </section>
    </div>
  );
};

export default Home;
