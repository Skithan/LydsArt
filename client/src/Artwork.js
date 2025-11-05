import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

//artwork data 
const cards = [
  { img: process.env.PUBLIC_URL + '/AnUptownPerspective2.jpeg',title: 'An Uptown Perspective', medium:'Acrylic on Canvas',size: '18"x24"', date: '2025', price: 'N/A', sold: true},
  { img: process.env.PUBLIC_URL + '/ComfortInChange.jpeg', title: 'Comfort In Change',  medium: 'Oil on Canvas', size: '24"x30"', date: '2024', price: '$450', sold: false},
  { img: process.env.PUBLIC_URL + '/EndOfSummerFlowers.jpeg', title: 'End Of Summer Flowers',  medium: 'Acrylic on Panel', size: '18"x24"', date: '2025', price: '$400', sold: false},
  { img: process.env.PUBLIC_URL + '/FalseLight.jpeg', title: 'False Light', medium: 'Acrylic on Canvas', size: '18"x24"', date: '2025', price: 'N/A', sold: true},
  { img: process.env.PUBLIC_URL + '/FamiliarFaces.jpeg', title: 'Familiar Faces', medium: 'Acrylic on Canvas', size: '18"x24"', date: '2025', price: 'N/A', sold: true},
  { img: process.env.PUBLIC_URL + '/KingSquareAtNight.jpeg', title: 'King Square At Night', medium: 'Oil on Canvas', size: '18"x24"', date: '2022', price: 'N/A', sold: true},
  { img: process.env.PUBLIC_URL + '/NoDogsOnTheCouch.jpeg', title: 'No Dogs On The Couch',  medium: 'Oil on Canvas', size: '18"x24"', date: '2022', price: 'N/A', sold: true},
  { img: process.env.PUBLIC_URL + '/SharingATemporaryHome.jpeg', title: 'Sharing A Temporary Home',  medium: 'Acrylic on Canvas', size: '48"x60"', date: '2023', price: '$5000', sold: false},
  { img: process.env.PUBLIC_URL + '/SimonAndGarfunkelKids.jpeg', title: 'Simon And Garfunkel Kids',  medium: 'Acrylic on Canvas', size: 'N/A', date: '2024', price: 'N/A', sold: true},
  { img: process.env.PUBLIC_URL + '/YellowFrog.jpeg', title: 'Yellow Frog',  medium: 'Oil on Canvas', size: '24"x30"', date: '2024', price: 'N/A', sold: true},
  { img: process.env.PUBLIC_URL + '/BlueFrog.jpeg', title: 'Blue Frog',  medium: 'Oil on Canvas', size: '24"x30"', date: '2024', price: 'N/A', sold: true},
];

//fiter button image svg
const filterIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="20" cy="14" r="2" />
  </svg>
);

const Artwork = () => {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0); 
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSoldStatus, setSelectedSoldStatus] = useState('');
  const [gridView, setGridView] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const cardCount = cards.length;
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndY = useRef(null);
  const isZooming = useRef(false);
  const filterRef = useRef(null);
  const filtersContainerRef = useRef(null);
  const contentContainerRef = useRef(null);

  const navigate = useNavigate();

  // Get base filtered cards for determining available filter options
  const getBaseFilteredCards = () => {
    return cards.filter(card => {
      const soldMatch = selectedSoldStatus === '' ? true : 
                       selectedSoldStatus === 'sold' ? card.sold === true : 
                       card.sold === false;
      return soldMatch;
    });
  };

  // Get available mediums based on current size and sold status filters
  const getAvailableMediums = () => {
    const baseCards = getBaseFilteredCards();
    const relevantCards = selectedSize ? 
      baseCards.filter(card => card.size === selectedSize) : 
      baseCards;
    return Array.from(new Set(relevantCards.map(card => card.medium).filter(v => v && v !== 'N/A')));
  };

  // Get available sizes based on current medium and sold status filters
  const getAvailableSizes = () => {
    const baseCards = getBaseFilteredCards();
    const relevantCards = selectedMedium ? 
      baseCards.filter(card => card.medium === selectedMedium) : 
      baseCards;
    return Array.from(new Set(relevantCards.map(card => card.size).filter(v => v && v !== 'N/A')));
  };

  // Get dynamic filter options
  const availableMediums = getAvailableMediums();
  const availableSizes = getAvailableSizes();

  // Filter cards by selected medium, size, and sold status
  const filteredCards = cards.filter(card => {
    const mediumMatch = selectedMedium ? card.medium === selectedMedium : true;
    const sizeMatch = selectedSize ? card.size === selectedSize : true;
    const soldMatch = selectedSoldStatus === '' ? true : 
                     selectedSoldStatus === 'sold' ? card.sold === true : 
                     card.sold === false;
    return mediumMatch && sizeMatch && soldMatch;
  });

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fully enters view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === filtersContainerRef.current) {
            setFiltersVisible(true);
          } else if (entry.target === contentContainerRef.current) {
            setContentVisible(true);
          }
        }
      });
    }, observerOptions);

    // Capture current ref values for cleanup
    const currentFiltersRef = filtersContainerRef.current;
    const currentContentRef = contentContainerRef.current;

    // Start observing elements
    if (currentFiltersRef) observer.observe(currentFiltersRef);
    if (currentContentRef) observer.observe(currentContentRef);

    return () => {
      if (currentFiltersRef) observer.unobserve(currentFiltersRef);
      if (currentContentRef) observer.unobserve(currentContentRef);
    };
  }, []);

  React.useEffect(() => {
    setCurrent(0);
    setImgIdx(0);
  }, [selectedMedium, selectedSize, selectedSoldStatus]);

  // Auto-clear invalid filter selections when other filters change
  React.useEffect(() => {
    if (selectedMedium && !availableMediums.includes(selectedMedium)) {
      setSelectedMedium('');
    }
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize('');
    }
  }, [selectedMedium, selectedSize, selectedSoldStatus, availableMediums, availableSizes]);

  // Handle clicking outside the filter dropdown to close it
  //uses the below swiping detection 
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [filterOpen]);


  //swiping detection 
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 1) {
      isZooming.current = true;
      return;
    }
    isZooming.current = false;
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };
  //swiping detection 
  const handleTouchEnd = (e) => {
    if (isZooming.current) {
      isZooming.current = false;
      return;
    }
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
    
    // In grid view, allow native scrolling - only handle swipes for navigation
    if (gridView) {
      // Allow native vertical scrolling in grid view
      touchStartX.current = null;
      touchEndX.current = null;
      touchStartY.current = null;
      touchEndY.current = null;
      return;
    }
    
    // Single card view touch handling
    // When card is expanded, prioritize vertical scrolling over expand/collapse gestures
    if (expanded) {
      // Only handle horizontal swipes for navigation when expanded
      if (touchStartX.current !== null && touchEndX.current !== null) {
        const diffX = touchEndX.current - touchStartX.current;
        const diffY = Math.abs((touchEndY.current || 0) - (touchStartY.current || 0));
        // Only respond to horizontal swipes if they're more pronounced than vertical movement
        if (Math.abs(diffX) > 125 && Math.abs(diffX) > diffY * 2) {
          if (diffX > 125) {
            goLeft();
          } else if (diffX < -125) {
            goRight();
          }
        }
      }
    } else {
      // When not expanded, handle both horizontal and vertical swipes
      // Horizontal swipe
      if (touchStartX.current !== null && touchEndX.current !== null) {
        const diffX = touchEndX.current - touchStartX.current;
        if (diffX > 125) {
          goLeft();
        } else if (diffX < -125) {
          goRight();
        }
      }
      // Vertical swipe
      if (touchStartY.current !== null && touchEndY.current !== null) {
        const diffY = touchEndY.current - touchStartY.current;
        if (diffY < -125) {
          setExpanded(true); // swipe up to expand
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };
  //swapping visible cards
  const goLeft = () => {
    setImgIdx(0);
    setCurrent((prev) => (prev === 0 ? cardCount - 1 : prev - 1));
  };
    //swapping visible cards
  const goRight = () => {
    setImgIdx(0);
    setCurrent((prev) => (prev === cardCount - 1 ? 0 : prev + 1));
  };


  //when Reserve piece button is clicked, send card data to Cart page
  const handleReserve = () => {
    const card = filteredCards[current];
    navigate('/cart', {
      state: {
        title: card.title,
        size: card.size,
        price: card.price,
        medium: card.medium,
        imgs: card.imgs || (card.img ? [card.img] : []),
        date: card.date,
        sold: card.sold
      }
    });
  };

//switches card view to reveal info 
  const handleExpand = () => setExpanded((prev) => !prev);

  return (
    <section id="artwork" style={{ marginTop: '1rem' }}>
      <div 
        ref={filtersContainerRef}
        style={{ 
          display: 'flex',  
          position: 'relative', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: '1rem',
          gap: '1rem',
          transform: filtersVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: filtersVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 1
        }}
      >
        <div ref={filterRef} style={{ position: 'relative', marginBottom: '1.5rem', width: 'fit-content', display: 'flex', gap: '1rem' }}>

          <button
            className="filter-dropdown-btn"
            onClick={() => setFilterOpen(open => !open)}
            aria-haspopup="true"
            aria-expanded={filterOpen}
          >
            {filterIcon}
            <span>Filter</span>
          </button>
          
          <button
            className="expand-toggle-btn"
            onClick={() => setGridView(prev => !prev)}
            aria-pressed={gridView}
          >
            {gridView ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            )}
            <span>{gridView ? 'Single' : 'Grid'}</span>
          </button>
          {filterOpen && (
            <div
              className="filter-dropdown-menu"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="medium-select">Medium</label>
                <select
                  id="medium-select"
                  value={selectedMedium}
                  onChange={e => setSelectedMedium(e.target.value)}
                >
                  <option value="">All</option>
                  {availableMediums.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="size-select">Size</label>
                <select
                  id="size-select"
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                >
                  <option value="">All</option>
                  {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="sold-select">Availability</label>
                <select
                  id="sold-select"
                  value={selectedSoldStatus}
                  onChange={e => setSelectedSoldStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                <button
                  className="filter-search-btn"
                  onClick={() => setFilterOpen(false)}
                >
                  Search
                </button>
                <button
                  className="filter-clear-btn"
                  onClick={() => { setSelectedMedium(''); setSelectedSize(''); setSelectedSoldStatus(''); setFilterOpen(false); }}
                >Clear</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {gridView ? (
        // Grid View
        <div 
          ref={contentContainerRef}
          className="artwork-grid-container" 
          style={{
            height: '75vh',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'scroll',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            padding: '0 2rem 4rem 2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            transform: contentVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
            opacity: contentVisible ? 1 : 0.3,
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="artwork-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            paddingBottom: '8rem'
          }}>
          {filteredCards.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', color: '#333333', fontSize: '1.3rem', textAlign: 'center', margin: '2rem' }}>
              No artwork found for this filter.
            </div>
          ) : (
            filteredCards.map((card, index) => (
              <div key={index} className="grid-card" style={{
                background: 'ffffffdd',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => {
                setCurrent(index);
                setGridView(false);
                setImgIdx(0);
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
              }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={card.imgs ? card.imgs[0] : card.img}
                    alt={card.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}
                  />
                  {card.sold && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.62)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      color: 'white',
                      fontSize: '1rem',
                      letterSpacing: '1px',
                      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                    }}>
                      SOLD
                    </div>
                  )}
                </div>
                <h3 style={{ color: '#333333', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {card.title}
                </h3>
                <p style={{ color: '#4a4a4a', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  <strong>Medium:</strong> {card.medium}
                </p>
                {card.size !== 'N/A' && (
                  <p style={{ color: '#4a4a4a', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    <strong>Size:</strong> {card.size}
                  </p>
                )}
                {card.price !== 'N/A' && !card.sold && (
                  <p style={{ color: '#666666', fontSize: '1rem', fontWeight: 600 }}>
                    {card.price}
                  </p>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      ) : (
        // Single Card View
        <div 
          ref={contentContainerRef}
          className="single-card-scroll-container"
          style={{
            height: '75vh',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            paddingBottom: '4rem',
            transform: contentVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
            opacity: contentVisible ? 1 : 0.3,
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div className="arrow-scroll-wrapper">
            <div
              className={`scroll-card single${expanded ? ' expanded' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={!expanded ? {
                width: '420px',
                maxWidth: '90vw',
                minHeight: '420px',
                height: 'auto',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                boxShadow: 'none',
                borderRadius: '2rem',
                marginBottom: '8rem',
                padding: '0',
                transition: 'all 0.7s cubic-bezier(.77,0,.18,1)',
              } : {}}
            >
          {filteredCards.length === 0 ? (
            <div style={{ color: '#333333', fontSize: '1.3rem', textAlign: 'center', margin: '2rem' }}>No artwork found for this filter.</div>
          ) : filteredCards[current].imgs ? (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <button 
                className="img-arrow left" 
                onClick={() => setImgIdx(idx => idx > 0 ? idx - 1 : idx)} 
                disabled={imgIdx === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#333333',
                  cursor: imgIdx === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '2.5rem',
                  opacity: imgIdx === 0 ? 0.4 : 1,
                  marginRight: '1.2rem',
                }}
                aria-label="Previous image"
              >
                &#8592;
              </button>
              <div style={{ position: 'relative' }}>
                <img
                  src={filteredCards[current].imgs[imgIdx]}
                  alt={filteredCards[current].title + ' ' + (imgIdx + 1)}
                  className={`scroll-img${expanded ? ' shrink' : ''}`}
                  onClick={handleExpand}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.7s cubic-bezier(.77,0,.18,1)',
                    maxHeight: expanded ? '320px' : '55vh',
                    width: 'auto',
                    maxWidth: expanded ? '95%' : '98vw',
                    objectFit: 'contain',
                    borderRadius: '1.2rem',
                    boxShadow: '0 4px 32px #0008',
                    background: '#ffffffdd',
                    aspectRatio: '4/3',
                    display: 'block',
                  }}
                />
                {filteredCards[current].sold && (
                  <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.62)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      color: 'white',
                      fontSize: '1rem',
                      letterSpacing: '1px',
                      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                  }}>
                    SOLD
                  </div>
                )}
              </div>
              <button 
                className="img-arrow right" 
                onClick={() => setImgIdx(idx => idx < filteredCards[current].imgs.length - 1 ? idx + 1 : idx)} 
                disabled={imgIdx === filteredCards[current].imgs.length - 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#333333',
                  cursor: imgIdx === filteredCards[current].imgs.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '2.5rem',
                  opacity: imgIdx === filteredCards[current].imgs.length - 1 ? 0.4 : 1,
                  marginLeft: '1.2rem',
                }}
                aria-label="Next image"
              >
                &#8594;
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src={filteredCards[current].img}
                alt={filteredCards[current].title}
                className={`scroll-img${expanded ? ' shrink' : ''}`}
                onClick={handleExpand}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.7s cubic-bezier(.77,0,.18,1)',
                  maxHeight: expanded ? '320px' : '55vh',
                  width: 'auto',
                  maxWidth: expanded ? '95%' : '98vw',
                  objectFit: 'contain',
                  borderRadius: '1.2rem',
                  boxShadow: '0 4px 32px #0008',
                  background: '#ffffffdd',
                  aspectRatio: '4/3',
                  display: 'block',
                }}
              />
              {filteredCards[current].sold && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0, 0, 0, 0.62)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: 'white',
                  fontSize: '1rem',
                  letterSpacing: '1px',
                  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                }}>
                  SOLD
                </div>
              )}
            </div>
          )}
          <button 
            className="click-indicator" 
            onClick={handleExpand}
            style={{ background: 'none', border: 'none', color: '#333333', cursor: 'pointer', font: 'inherit', padding: 0 }}
            aria-pressed={expanded}
          >
            {expanded ? 'click to expand' : 'click for details'}
          </button>
          <div className="arrow-btn-row">
            <button className="arrow-btn left" onClick={() => setCurrent(prev => prev === 0 ? filteredCards.length - 1 : prev - 1)} aria-label="Previous card" disabled={current === 0} style={current === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>&#8592;</button>
            <div
              className={`scroll-text${expanded ? ' expanded' : ''}`}
              onClick={handleExpand}
              style={{ cursor: 'pointer', transition: 'all 0.7s cubic-bezier(.77,0,.18,1)' }}
            >
              <div className="card-text">{filteredCards.length > 0 ? filteredCards[current].title : ''}</div>
            </div>
            <button className="arrow-btn right" onClick={() => setCurrent(prev => prev === filteredCards.length - 1 ? 0 : prev + 1)} aria-label="Next card">&#8594;</button>
          </div>
          <div
            className={`card-details${expanded ? ' show' : ''}`}
            style={{
              maxHeight: expanded ? '350px' : '0',
              opacity: expanded ? 1 : 0,
              transition: 'all 0.7s cubic-bezier(.77,0,.18,1)',
              overflow: expanded ? 'auto' : 'hidden',
              marginTop: expanded ? '2rem' : '0',
              marginBottom: expanded ? '5.5rem' : '0',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
          >
           
            {filteredCards.length > 0 && filteredCards[current].size !== 'N/A' ? <div className="card-detail-row"><strong>Size:</strong> {filteredCards[current].size}</div> : null}
            {filteredCards.length > 0 && filteredCards[current].medium !== 'N/A' ? <div className="card-detail-row"><strong>Medium:</strong> {filteredCards[current].medium}</div> : null}
            {filteredCards.length > 0 && filteredCards[current].date && filteredCards[current].date !== 'N/A' ? (<div className="card-detail-row"><strong>Date:</strong> {filteredCards[current].date}</div>) : null}
            {filteredCards.length > 0 && filteredCards[current].price !== 'N/A' && !filteredCards[current].sold ? <div className="card-detail-row"><strong>Price:</strong> {filteredCards[current].price}</div> : null}
            {filteredCards.length > 0 && !filteredCards[current].sold && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem', marginTop: '1.5rem' }}>
                <button className="arrow-btn" style={{ minWidth: '12rem', padding: '0.5rem 1.5rem', fontSize: '1.3rem', whiteSpace: 'nowrap', width: '100%' }} onClick={handleReserve}>
                  Reserve Piece
                </button>
              </div>
            )}
          </div>
          <div className="card-scrollbar">
            {filteredCards.map((_, idx) => (
              <span
                key={idx}
                className={"card-scrollbar-dot" + (idx === current ? " active" : "")}
              />
            ))}
          </div>
        </div>
        </div>
        </div>
      )}
    </section>  );
};

export default Artwork;
