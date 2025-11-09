import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { useCart } from './CartContext';
import './App.css';

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
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSoldStatus, setSelectedSoldStatus] = useState('');
  const [gridView, setGridView] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addedItemTitle, setAddedItemTitle] = useState('');
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
  const { addItem } = useCart();

  // Force refresh data from database
  const refreshArtworkData = async () => {
    localStorage.removeItem('lydsart_artwork_cache');
    localStorage.removeItem('lydsart_artwork_cache_timestamp');
    setLoading(true);
    
    try {
      const artworkCollection = collection(db, 'artwork');
      const artworkQuery = query(artworkCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(artworkQuery);
      
      if (querySnapshot.empty) {
        setError('No artwork found in database.');
        setCards([]);
      } else {
        const artworkData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          console.log(`🎨 Refresh processing artwork: "${data.title}"`);
          console.log(`📸 Refresh image URL from database: "${data.imageUrl}"`);
          console.log(`✅ Refresh has image URL: ${!!data.imageUrl}`);
          
          // Convert database URLs to Firebase Storage URLs
          let refreshProcessedImageUrl = null;
          if (data.imageUrl) {
            if (data.imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
              // Already a Firebase Storage HTTP URL - use as-is
              refreshProcessedImageUrl = data.imageUrl;
              console.log(`🔥 Refresh Firebase Storage HTTP URL: "${data.imageUrl}"`);
            } else if (data.imageUrl.startsWith('gs://')) {
              // Google Cloud Storage URL - convert to HTTP Firebase Storage URL
              const gsUrl = data.imageUrl.replace('gs://', '');
              const [bucket, ...pathParts] = gsUrl.split('/');
              const encodedPath = pathParts.join('/').replace(/\//g, '%2F');
              refreshProcessedImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
              console.log(`🔥 Refresh GS URL converted: "${data.imageUrl}" → "${refreshProcessedImageUrl}"`);
            } else if (data.imageUrl.startsWith('/') && data.imageUrl.includes('.jpeg')) {
              // Database URL like "/AnUptownPerspective2.jpeg" - convert to Firebase Storage
              const fileName = data.imageUrl.substring(1); // Remove leading slash
              const gsUrl = `gs://lydsart-f6966.firebasestorage.app/artwork/${fileName}`;
              // Convert to HTTP Firebase Storage URL
              const encodedPath = `artwork%2F${fileName}`;
              refreshProcessedImageUrl = `https://firebasestorage.googleapis.com/v0/b/lydsart-f6966.firebasestorage.app/o/${encodedPath}?alt=media`;
              console.log(`🔥 Refresh Database URL converted: "${data.imageUrl}" → GS: "${gsUrl}" → HTTP: "${refreshProcessedImageUrl}"`);
            } else {
              // Unknown format - use as-is and log
              refreshProcessedImageUrl = data.imageUrl;
              console.log(`❓ Refresh unknown URL format: "${data.imageUrl}"`);
            }
          }
          
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            // Support both Firebase Storage URLs and public folder URLs
            img: refreshProcessedImageUrl,
            imgs: refreshProcessedImageUrl ? [refreshProcessedImageUrl] : null,
            price: data.price !== null ? `$${data.price}` : null,
            size: data.size || data.dimensions || 'Size not specified',
            medium: data.medium || 'Medium not specified',
            date: data.date || (data.createdAt ? new Date(data.createdAt.toDate()).getFullYear().toString() : null),
            sold: data.sold !== undefined ? data.sold : !data.available,
            description: data.description || null,
            slug: data.slug || null,
            _originalData: data
          };
        });
        
        // Log final refresh processed artwork data
        console.log('🔄 Final refresh processed artwork data:');
        artworkData.forEach((artwork, index) => {
          console.log(`${index + 1}. "${artwork.title}" - img: "${artwork.img}" - imgs: ${JSON.stringify(artwork.imgs)}`);
        });
        
        setCards(artworkData);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(`Failed to refresh data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  // Fetch artwork from Firestore (always fresh data to avoid database connection issues)
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        
        // Clear cache to ensure fresh data
        localStorage.removeItem('lydsart_artwork_cache');
        localStorage.removeItem('lydsart_artwork_cache_timestamp');
        
        // Bypass cache check for now
        const cachedData = localStorage.getItem('lydsart_artwork_cache');
        const cacheTimestamp = localStorage.getItem('lydsart_artwork_cache_timestamp');
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        

        
        if (cachedData && cacheTimestamp) {
          const isExpired = (Date.now() - parseInt(cacheTimestamp)) > cacheExpiry;
          
          if (!isExpired) {
            console.log('� Using cached artwork data');
            const parsedData = JSON.parse(cachedData);
            setCards(parsedData);
            setError(null);
            setLoading(false);
            return; // Exit early with cached data
          } else {
            console.log('⏰ Cache expired, fetching fresh data');
          }
        }
        
        const artworkCollection = collection(db, 'artwork');
        const artworkQuery = query(artworkCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(artworkQuery);
        
        if (querySnapshot.empty) {
          setError('No artwork found in database. Please upload artwork data first.');
          setCards([]);
        } else {
          const artworkData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            console.log(`🎨 Processing artwork: "${data.title}"`);
            console.log(`📸 Image URL from database: "${data.imageUrl}"`);
            console.log(`🔗 Image URL type: ${typeof data.imageUrl}`);
            console.log(`✅ Has image URL: ${!!data.imageUrl}`);
            
            // Convert database URLs to Firebase Storage URLs
            let processedImageUrl = null;
            if (data.imageUrl) {
              if (data.imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
                // Already a Firebase Storage HTTP URL - use as-is
                processedImageUrl = data.imageUrl;
                console.log(`🔥 Firebase Storage HTTP URL: "${data.imageUrl}"`);
              } else if (data.imageUrl.startsWith('gs://')) {
                // Google Cloud Storage URL - convert to HTTP Firebase Storage URL
                const gsUrl = data.imageUrl.replace('gs://', '');
                const [bucket, ...pathParts] = gsUrl.split('/');
                const encodedPath = pathParts.join('/').replace(/\//g, '%2F');
                processedImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
                console.log(`🔥 GS URL converted: "${data.imageUrl}" → "${processedImageUrl}"`);
              } else if (data.imageUrl.startsWith('/') && data.imageUrl.includes('.jpeg')) {
                // Database URL like "/AnUptownPerspective2.jpeg" - convert to Firebase Storage
                const fileName = data.imageUrl.substring(1); // Remove leading slash
                const gsUrl = `gs://lydsart-f6966.firebasestorage.app/artwork/${fileName}`;
                // Convert to HTTP Firebase Storage URL
                const encodedPath = `artwork%2F${fileName}`;
                processedImageUrl = `https://firebasestorage.googleapis.com/v0/b/lydsart-f6966.firebasestorage.app/o/${encodedPath}?alt=media`;
                console.log(`🔥 Database URL converted: "${data.imageUrl}" → GS: "${gsUrl}" → HTTP: "${processedImageUrl}"`);
              } else {
                // Unknown format - use as-is and log
                processedImageUrl = data.imageUrl;
                console.log(`❓ Unknown URL format: "${data.imageUrl}"`);
              }
            }
            
            return {
              id: doc.id,
              title: data.title || 'Untitled',
              // Support both Firebase Storage URLs and public folder URLs
              img: processedImageUrl,
              imgs: processedImageUrl ? [processedImageUrl] : null,
              price: data.price !== null ? `$${data.price}` : null, // Handle null price
              size: data.size || data.dimensions || 'Size not specified', // Support both new and old format
              medium: data.medium || 'Medium not specified',
              date: data.date || (data.createdAt ? new Date(data.createdAt.toDate()).getFullYear().toString() : null), // Use 'date' field first
              sold: data.sold !== undefined ? data.sold : !data.available, // Use 'sold' field directly or fallback
              description: data.description || null,
              slug: data.slug || null,
              // Keep original data for debugging
              _originalData: data
            };
          });
          
          // Log final processed artwork data
          console.log('📊 Final processed artwork data:');
          artworkData.forEach((artwork, index) => {
            console.log(`${index + 1}. "${artwork.title}" - img: "${artwork.img}" - imgs: ${JSON.stringify(artwork.imgs)}`);
          });
          
          setCards(artworkData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching artwork:', err);
        
        if (err.code === 'permission-denied') {
          setError('Database access denied. Please enable Firestore and set proper permissions.');
        } else if (err.code === 'not-found') {
          setError('Database not found. Please enable Firestore in Firebase Console.');
        } else {
          setError(`Failed to load artwork: ${err.message}`);
        }
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, []);

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

  // Intersection Observer for animations - run after loading is complete
  useEffect(() => {
    // Don't set up observer until loading is complete
    if (loading) return;

    // Capture current ref values at the beginning of the effect
    const currentFiltersRef = filtersContainerRef.current;
    const currentContentRef = contentContainerRef.current;

    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fully enters view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === currentFiltersRef) {
            setFiltersVisible(true);
          } else if (entry.target === currentContentRef) {
            setContentVisible(true);
          }
        }
      });
    }, observerOptions);

    // Small delay to ensure DOM is ready
    const setupObserver = () => {
      if (currentFiltersRef) observer.observe(currentFiltersRef);
      if (currentContentRef) observer.observe(currentContentRef);
    };

    // Setup observer after a brief delay
    const timeoutId = setTimeout(() => {
      setupObserver();
      
      // Fallback: if elements are already in view, trigger animations immediately
      const checkIfInView = () => {
        if (currentFiltersRef) {
          const rect = currentFiltersRef.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setFiltersVisible(true);
          }
        }
        if (currentContentRef) {
          const rect = currentContentRef.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setContentVisible(true);
          }
        }
      };
      
      // Check immediately and after a short delay
      checkIfInView();
      setTimeout(checkIfInView, 300);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Use the captured ref values in cleanup
      if (currentFiltersRef) observer.unobserve(currentFiltersRef);
      if (currentContentRef) observer.unobserve(currentContentRef);
    };
  }, [loading]); // Run when loading state changes

  React.useEffect(() => {
    setCurrent(0);
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
    setCurrent((prev) => (prev === 0 ? cardCount - 1 : prev - 1));
  };
    //swapping visible cards
  const goRight = () => {
    setCurrent((prev) => (prev === cardCount - 1 ? 0 : prev + 1));
  };


  //when Reserve piece button is clicked, add card data to Cart
  const handleReserve = () => {
    const card = filteredCards[current];
    const itemToAdd = {
      id: card.id, // Firestore document ID
      title: card.title,
      size: card.size,
      price: card.price,
      medium: card.medium,
      imgs: card.imgs || (card.img ? [card.img] : []),
      date: card.date,
      sold: card.sold
    };

    const success = addItem(itemToAdd);
    if (success) {
      // Show custom styled popup
      setAddedItemTitle(card.title);
      setShowCartPopup(true);
    }
  };

  // Handle cart popup actions
  const handleViewCart = () => {
    setShowCartPopup(false);
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    setShowCartPopup(false);
  };

//switches card view to reveal info 
  const handleExpand = () => setExpanded((prev) => !prev);

  if (loading) {
    return (
      <section id="artwork" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', color: '#333333' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #666666',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading artwork...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="artwork" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', color: '#c62828', background: '#ffebee', padding: '2rem', borderRadius: '1rem', maxWidth: '600px' }}>
          <h3 style={{ color: '#c62828', marginBottom: '1rem' }}>Database Connection Issue</h3>
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          
          <div style={{ background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'left' }}>
            <strong style={{ color: '#e65100' }}>Next Steps:</strong>
            <ol style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', color: '#bf360c' }}>
              <li>Go to <a href="https://console.firebase.google.com/project/lydsart-f6966/firestore" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>Firebase Console</a></li>
              <li>Enable Firestore Database (choose "test mode")</li>
              <li>Visit the <a href="https://us-central1-lydsart-f6966.cloudfunctions.net/uploadArtworkData" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>upload function</a> to populate data</li>
            </ol>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#666666',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

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
          
          <button
            className="filter-dropdown-btn"
            onClick={() => {
              localStorage.removeItem('lydsart_artwork_cache');
              localStorage.removeItem('lydsart_artwork_cache_timestamp');
              refreshArtworkData();
            }}
            disabled={loading}
            title="Clear cache and refresh artwork data from database"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            <span>{loading ? 'Refreshing...' : 'Clear & Refresh'}</span>
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
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div style="
                          width: 100%;
                          height: 200px;
                          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
                          border-radius: 0.5rem;
                          margin-bottom: 1rem;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #666;
                          font-size: 0.9rem;
                        ">
                          Image not available
                        </div>
                      `;
                    }}
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
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src={filteredCards[current].imgs ? filteredCards[current].imgs[0] : filteredCards[current].img}
                alt={filteredCards[current].title}
                className={`scroll-img${expanded ? ' shrink' : ''}`}
                onClick={handleExpand}
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = '#666';
                  e.target.style.fontSize = '1.2rem';
                  e.target.alt = 'Image not available';
                }}
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
          <div className={`arrow-btn-row${!expanded ? ' expanded-mode' : ''}`}>
            <button className="arrow-btn left" onClick={() => setCurrent(prev => prev === 0 ? filteredCards.length - 1 : prev - 1)} aria-label="Previous card" disabled={current === 0} style={current === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>&#8592;</button>
            {expanded && (
              <div
                className={`scroll-text${expanded ? ' expanded' : ''}`}
                onClick={handleExpand}
                style={{ cursor: 'pointer', transition: 'all 0.7s cubic-bezier(.77,0,.18,1)' }}
              >
                <div className="card-text">{filteredCards.length > 0 ? filteredCards[current].title : ''}</div>
              </div>
            )}
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

      {/* Custom Cart Popup */}
      {showCartPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffffdd',
            borderRadius: '1.2rem',
            padding: '2.5rem 2rem',
            maxWidth: '400px',
            width: '90vw',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
            fontFamily: 'Playfair Display, Inter, Segoe UI, Arial, serif',
            color: '#333333',
            letterSpacing: '2px',
            transform: 'scale(1)',
            animation: 'popupSlideIn 0.3s ease-out'
          }}>
            <style>
              {`
                @keyframes popupSlideIn {
                  from {
                    transform: scale(0.8);
                    opacity: 0;
                  }
                  to {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
              `}
            </style>
            <h3 style={{
              fontWeight: 700,
              fontSize: '1.8rem',
              marginBottom: '1rem',
              color: '#333333',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
            }}>
              Added to Cart!
            </h3>
            <p style={{
              fontSize: '1.2rem',
              marginBottom: '2rem',
              color: '#4a4a4a',
              lineHeight: '1.5'
            }}>
              "<strong>{addedItemTitle}</strong>" has been added to your cart.
            </p>
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '2rem',
              color: '#666666'
            }}>
              Would you like to view your cart now?
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleViewCart}
                style={{
                  background: '#333333',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '0.7rem 1.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  minWidth: '120px'
                }}
                onMouseOver={e => {
                  e.target.style.background = '#1a1a1a';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={e => {
                  e.target.style.background = '#333333';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                View Cart
              </button>
              <button
                onClick={handleContinueShopping}
                style={{
                  background: 'transparent',
                  color: '#333333',
                  border: '2px solid #333333',
                  borderRadius: '1rem',
                  padding: '0.7rem 1.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '120px'
                }}
                onMouseOver={e => {
                  e.target.style.background = '#333333';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={e => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#333333';
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </section>  );
};

export default Artwork;
