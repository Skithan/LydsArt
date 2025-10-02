import React, { useState, useRef } from 'react';
import './App.css';

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return '';
  if (dateStr.length < 8) return dateStr;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const dateObj = new Date(`${year}-${month}-${day}`);
  if (isNaN(dateObj)) return dateStr;
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const cards = [
  { img: process.env.PUBLIC_URL + '/AnUptownPerspective2.jpeg',title: 'An Uptown Perspective', medium:'Acrylic', text: 'N/A',size: '18"x24"',price: '$1' , date: '20250611', sold: false},
  { img: process.env.PUBLIC_URL + '/ComfortInChange.jpeg', title: 'Comfort In Change', text: 'sharing some thoughts from the painting process: ', medium: 'Oil on Stetched Canvas', size: '24"x30"', price: '$1', date: '20240527', sold: false},
  { img: process.env.PUBLIC_URL + '/EndOfSummerFlowers.jpeg', title: 'End Of Summer Flowers', text: 'N/A', medium: 'Acrylic on Panel', size: '18"x24"', price: '$1', date: '20250810', sold: false},
  { img: process.env.PUBLIC_URL + '/FalseLight.jpeg', title: 'False Light', text: 'N/A', medium: 'Acrylic on Canvas', size: '18"x24"', price: '$1', date: '20250822', sold: false},
  { img: process.env.PUBLIC_URL + '/FamiliarFaces.jpeg', title: 'Familiar Faces', text: 'N/A', medium: 'Acrylic on Canvas', size: '18"x24"', price: 'N/A', date: '20250817', sold: false},
  { imgs: [
      process.env.PUBLIC_URL + '/SillyHeart1.jpeg',
      process.env.PUBLIC_URL + '/SillyHeart2.jpeg',
      process.env.PUBLIC_URL + '/SillyHeart3.jpeg',
      process.env.PUBLIC_URL + '/SillyHeart4.jpeg',
    ],
    title: 'Silly Hearts',
    text: 'N/A',
    medium: 'Wood & Mixed Media',
    size: '1"x6"',
  price: '$1',
    date: '20230129',
    sold: false
  },
  { imgs: [
      process.env.PUBLIC_URL + '/HabitualRoutines1.jpeg',
      process.env.PUBLIC_URL + '/HabitualRoutines2.jpeg',
  ],
    title: 'Habitual Routines',
    text: 'N/A',
    medium: 'Wood & Mixed Media',
    size: '3\'x4\'x2\'',
  price: '$1',
    date: '20231210',
    sold: false
  },
  { img: process.env.PUBLIC_URL + '/KingSquareAtNight.jpeg', title: 'King Square At Night', text: 'N/A', medium: 'Oil on Canvas', size: '18"x24"', price: '$1',date: '20220502', sold: false},
  { img: process.env.PUBLIC_URL + '/NoDogsOnTheCouch.jpeg', title: 'No Dogs On The Couch', text: 'N/A', medium: 'Oil on Canvas', size: '18"x24"', price: 'N/A',date: '20221201', sold: false},
  { img: process.env.PUBLIC_URL + '/SharingATemporaryHome.jpeg', title: 'Sharing A Temporary Home', text: 'N/A', medium: 'Acrylic on Canvas', size: '3\'x5\'', price: '$1',date: '20231103', sold: false},
  { img: process.env.PUBLIC_URL + '/SimonAndGarfunkelKids.jpeg', title: 'Simon And Garfunkel Kids', text: 'N/A', medium: 'Acrylic on Canvas', size: 'N/A', price: 'N/A',date: '20240822', sold: false},
  { img: process.env.PUBLIC_URL + '/YellowFrog.jpeg', title: 'Yellow Frog', text: 'N/A', medium: 'Oil on Canvas', size: 'N/A', price: 'N/A',date: '20240219', sold: false},
  { img: process.env.PUBLIC_URL + '/BlueFrog.jpeg', title: 'Blue Frog', text: 'N/A', medium: 'Oil on Canvas', size: 'N/A', price: 'N/A',date: '20240219', sold: false},
];

const filterIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d4c1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
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

const Artwork = (props) => {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0); 
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const cardCount = cards.length;
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndY = useRef(null);
  const isZooming = useRef(false);

  console.log('props', props);

  const onReserve = props.onReserve;

  // Get unique values for Medium and Size
  const mediums = Array.from(new Set(cards.map(card => card.medium).filter(v => v && v !== 'N/A')));
  const sizes = Array.from(new Set(cards.map(card => card.size).filter(v => v && v !== 'N/A')));

  // Filter cards by selected medium and size
  const filteredCards = cards.filter(card => {
    const mediumMatch = selectedMedium ? card.medium === selectedMedium : true;
    const sizeMatch = selectedSize ? card.size === selectedSize : true;
    return mediumMatch && sizeMatch;
  });

  React.useEffect(() => {
    setCurrent(0);
    setImgIdx(0);
  }, [selectedMedium, selectedSize]);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 1) {
      isZooming.current = true;
      return;
    }
    isZooming.current = false;
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };
  const handleTouchEnd = (e) => {
    if (isZooming.current) {
      isZooming.current = false;
      return;
    }
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
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
      if (!expanded && diffY < -125) {
        setExpanded(true); // swipe up to expand
      } else if (expanded && diffY > 125) {
        setExpanded(false); // swipe down to collapse
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  const handleReserve = () => {
    if (onReserve) {
      const card = filteredCards[current];
      onReserve({
        title: card.title,
        size: card.size,
        price: card.price,
        medium: card.medium,
        imgs: card.imgs || (card.img ? [card.img] : []),
        text: card.text,
        date: card.date,
        sold: card.sold
      });
    }
  };

  const goLeft = () => {
    setImgIdx(0);
    setCurrent((prev) => (prev === 0 ? cardCount - 1 : prev - 1));
  };
  const goRight = () => {
    setImgIdx(0);
    setCurrent((prev) => (prev === cardCount - 1 ? 0 : prev + 1));
  };

  const handleExpand = () => setExpanded((prev) => !prev);

  return (
    <section id="artwork">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', marginBottom: '1.5rem', width: 'fit-content' }}>
         <br></br>
          <button
            className="filter-dropdown-btn"
            style={{
              background: 'linear-gradient(90deg, #f7ecd0 0%, #f3e3b3 100%)',
              border: 'none',
              color: '#6d4c1b',
              padding: '0.7rem 1.5rem',
              borderRadius: '2rem',
              fontSize: '1.1rem',
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              boxShadow: '0 2px 8px #f3e3b322',
              cursor: 'pointer',
              minWidth: '120px',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #f3e3b3 0%, #fffbe6 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #f7ecd0 0%, #f3e3b3 100%)'}
            onFocus={e => e.currentTarget.style.background = 'linear-gradient(90deg, #f3e3b3 0%, #fffbe6 100%)'}
            onBlur={e => e.currentTarget.style.background = 'linear-gradient(90deg, #f7ecd0 0%, #f3e3b3 100%)'}
            onClick={() => setFilterOpen(open => !open)}
            aria-haspopup="true"
            aria-expanded={filterOpen}
          >
            {filterIcon}
            <span>Filter</span>
          </button>
          {filterOpen && (
            <div
              className="filter-dropdown-menu"
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: 'linear-gradient(90deg, #f7ecd0 0%, #f3e3b3 100%)',
                borderRadius: '1.2rem',
                boxShadow: '0 2px 16px #0008',
                padding: '1.2rem 1.5rem',
                zIndex: 100,
                minWidth: '220px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="medium-select" style={{ color: '#6d4c1b', fontWeight: 500, fontSize: '1rem' }}>Medium</label>
                <select
                  id="medium-select"
                  value={selectedMedium}
                  onChange={e => setSelectedMedium(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '1rem', background: '#6d4c1b', color: '#fff', border: 'none', fontWeight: 500 }}
                >
                  <option value="">All</option>
                  {mediums.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="size-select" style={{ color: '#6d4c1b', fontWeight: 500, fontSize: '1rem' }}>Size</label>
                <select
                  id="size-select"
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '1rem', background: '#6d4c1b', color: '#fff', border: 'none', fontWeight: 500 }}
                >
                  <option value="">All</option>
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                style={{ marginTop: '0.5rem', background: '#6d4c1b', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.5rem 1rem', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => { setSelectedMedium(''); setSelectedSize(''); setFilterOpen(false); }}
              >Clear</button>
            </div>
          )}
        </div>
      </div>
      <div className="arrow-scroll-wrapper">
        <div
          className={`scroll-card single${expanded ? ' expanded' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={!expanded ? {
            width: '420px',
            maxWidth: '90vw',
            minHeight: '420px',
            height: '75vh',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            boxShadow: 'none',
            borderRadius: '2rem',
            marginBottom: '0',
            padding: '0',
            transition: 'all 0.7s cubic-bezier(.77,0,.18,1)',
          } : {}}
        >
          {filteredCards.length === 0 ? (
            <div style={{ color: '#fff', fontSize: '1.3rem', textAlign: 'center', margin: '2rem' }}>No artwork found for this filter.</div>
          ) : filteredCards[current].imgs ? (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <button 
                className="img-arrow left" 
                onClick={() => setImgIdx(idx => idx > 0 ? idx - 1 : idx)} 
                disabled={imgIdx === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6d4c1b',
                  cursor: imgIdx === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '2.5rem',
                  opacity: imgIdx === 0 ? 0.4 : 1,
                  marginRight: '1.2rem',
                }}
                aria-label="Previous image"
              >
                &#8592;
              </button>
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
                  background: '#f7ecd0',
                  aspectRatio: '4/3',
                  display: 'block',
                }}
              />
              <button 
                className="img-arrow right" 
                onClick={() => setImgIdx(idx => idx < filteredCards[current].imgs.length - 1 ? idx + 1 : idx)} 
                disabled={imgIdx === filteredCards[current].imgs.length - 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6d4c1b',
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
                background: '#f7ecd0',
                aspectRatio: '4/3',
                display: 'block',
              }}
            />
          )}
          <button 
            className="click-indicator" 
            onClick={handleExpand}
            style={{ background: 'none', border: 'none', color: '#6d4c1b', cursor: 'pointer', font: 'inherit', padding: 0 }}
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
              overflow: 'hidden',
              marginTop: expanded ? '2rem' : '0',
              marginBottom: expanded ? '5.5rem' : '0',
            }}
          >
            {filteredCards.length > 0 && filteredCards[current].text !== 'N/A' ? <div className="card-detail-row">{filteredCards[current].text}</div> : null}
            {filteredCards.length > 0 && filteredCards[current].size !== 'N/A' ? <div className="card-detail-row"><strong>Size:</strong> {filteredCards[current].size}</div> : null}
            {filteredCards.length > 0 && filteredCards[current].medium !== 'N/A' ? <div className="card-detail-row"><strong>Medium:</strong> {filteredCards[current].medium}</div> : null}
            {filteredCards.length > 0 && filteredCards[current].price !== 'N/A' && !filteredCards[current].sold ? <div className="card-detail-row"><strong>Price:</strong> {filteredCards[current].price}</div> : null}
            {filteredCards.length > 0 && filteredCards[current].date && filteredCards[current].date !== 'N/A' ? (
              <div className="card-detail-row"><strong>Date Completed:</strong> {formatDate(filteredCards[current].date)}</div>
            ) : null}
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
    </section>
  );
};

export default Artwork;
