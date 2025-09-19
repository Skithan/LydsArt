import React, { useState, useRef } from 'react';
import './App.css';
import Header from './Header';
import Footer from './Footer';

function App() {
  const cards = [
    {
      img: process.env.PUBLIC_URL + '/Headshot.jpeg',
      alt: 'Card 1',
      text: 'Lydia Patterson',
      bio: "Hi I'm Lydia.. contact info...",
    },
    {
      img: process.env.PUBLIC_URL + '/FamiliarFaces.jpeg',
      alt: 'Card 2',
      text: 'Familiar Faces',
      size: '18x24 in',
      price: '$350',
      date: '2023-11-02',
    },
    {
      img: process.env.PUBLIC_URL + '/FalseLight.jpeg',
      alt: 'Card 3',
      text: 'First Light',
      size: '30x40 in',
      price: '$600',
      date: '2024-03-10',
    },
  ];
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const cardCount = cards.length;

  const goLeft = () => {
    setExpanded(false);
    setCurrent((prev) => (prev === 0 ? cardCount - 1 : prev - 1));
  };
  const goRight = () => {
    setExpanded(false);
    setCurrent((prev) => (prev === cardCount - 1 ? 0 : prev + 1));
  };

  const handleExpand = () => setExpanded((prev) => !prev);

  return (
    <div className="App">
      <div className="animated-bg" aria-hidden="true"></div>
      <div className="content">
        <Header />
        <div className="arrow-scroll-wrapper">
          <div
            className={`scroll-card single${expanded ? ' expanded' : ''}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
          >
            <img
              src={cards[current].img}
              alt={cards[current].alt}
              className={`scroll-img${expanded ? ' shrink' : ''}`}
              onClick={handleExpand}
              style={{ cursor: 'pointer', transition: 'all 0.7s cubic-bezier(.77,0,.18,1)' }}
            />
            {current === 0 && (
              <div className="click-indicator">click the pic for more</div>
            )}
            <div className="arrow-btn-row">
              <button className="arrow-btn left" onClick={goLeft} aria-label="Previous card" disabled={current === 0} style={current === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>&#8592;</button>
              <div
                className={`scroll-text${expanded ? ' expanded' : ''}`}
                onClick={handleExpand}
                style={{ cursor: 'pointer', transition: 'all 0.7s cubic-bezier(.77,0,.18,1)' }}
              >
                {cards[current].text}
              </div>
              <button className="arrow-btn right" onClick={goRight} aria-label="Next card">&#8594;</button>
            </div>
            <div
              className={`card-details${expanded ? ' show' : ''}`}
              style={{
                maxHeight: expanded ? '200px' : '0',
                opacity: expanded ? 1 : 0,
                transition: 'all 0.7s cubic-bezier(.77,0,.18,1)',
                overflow: 'hidden',
                marginTop: expanded ? '2rem' : '0',
              }}
            >
              {current === 0 ? (
                <div className="card-detail-row">Hi I'm Lydia..</div>
              ) : (
                <>
                  <div className="card-detail-row"><strong>Size:</strong> {cards[current].size}</div>
                  <div className="card-detail-row"><strong>Price:</strong> {cards[current].price}</div>
                  <div className="card-detail-row"><strong>Date:</strong> {cards[current].date}</div>
                </>
              )}
            </div>
            <div className="card-scrollbar">
              {cards.map((_, idx) => (
                <span
                  key={idx}
                  className={"card-scrollbar-dot" + (idx === current ? " active" : "")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;