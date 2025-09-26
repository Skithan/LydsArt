import React, { useState} from 'react';
import './App.css';
import Header from './Header';
// import Footer from './Footer';

function App() {
  // Utility to format date string 'YYYYMMDD' to 'Month Day, Year'
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
    { img: process.env.PUBLIC_URL + '/Headshot.jpeg', title: 'Lydia Paterson', text: "Hi I'm Lydia.. contact info...", medium:'N/A', size: 'N/A', price: 'N/A' , date: 'N/A', sold: false},
    { img: process.env.PUBLIC_URL + '/AnUptownPerspective2.jpeg',title: 'An Uptown Perspective', medium:'Acrylic', text: 'N/A',size: '18"x24"',price: '$200' , date: '20250611', sold: false},
    { img: process.env.PUBLIC_URL + '/ComfortInChange.jpeg', title: 'Comfort In Change', text: 'sharing some thoughts from the painting process: ', medium: 'Oil on Stetched Canvas', size: '24"x30"', price: '$200', date: '20240527', sold: false},
    { img: process.env.PUBLIC_URL + '/EndOfSummerFlowers.jpeg', title: 'End Of Summer Flowers', text: 'N/A', medium: 'Acrylic on Panel', size: '18"x24"', price: '$200', date: '20250810', sold: false},
    { img: process.env.PUBLIC_URL + '/FalseLight.jpeg', title: 'False Light', text: 'N/A', medium: 'Acrylic on Canvas', size: '18"x24"', price: '$200', date: '20250822', sold: false},
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
      price: '$200 each',
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
      price: '$200',
      date: '20231210',
      sold: false
    },
    { img: process.env.PUBLIC_URL + '/KingSquareAtNight.jpeg', title: 'King Square At Night', text: 'N/A', medium: 'Oil on Canvas', size: '18"x24"', price: '$200',date: '2022052', sold: false},
    { img: process.env.PUBLIC_URL + '/NoDogsOnTheCouch.jpeg', title: 'No Dogs On The Couch', text: 'N/A', medium: 'Oil on Canvas', size: '18"x24"', price: 'N/A',date: '20221201', sold: false},
    { img: process.env.PUBLIC_URL + '/SharingATemporaryHome.jpeg', title: 'Sharing A Temporary Home', text: 'N/A', medium: 'Acrylic on Canvas', size: '3\'x5\'', price: '$200',date: '20231103', sold: false},
    { img: process.env.PUBLIC_URL + '/SimonAndGarfunkelKids.jpeg', title: 'Simon And Garfunkel Kids', text: 'N/A', medium: 'Acrylic on Canvas', size: 'N/A', price: 'N/A',date: '20240822', sold: false},
    { img: process.env.PUBLIC_URL + '/YellowFrog.jpeg', title: 'Yellow Frog', text: 'N/A', medium: 'Oil on Canvas', size: 'N/A', price: 'N/A',date: '20240219', sold: false},
    { img: process.env.PUBLIC_URL + '/BlueFrog.jpeg', title: 'Blue Frog', text: 'N/A', medium: 'Oil on Canvas', size: 'N/A', price: 'N/A',date: '20240219', sold: false},
  ];
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0); 
  const cardCount = cards.length;

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
            {cards[current].imgs ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <button 
                  className="img-arrow up" 
                  onClick={() => setImgIdx(idx => idx > 0 ? idx - 1 : idx)} 
                  disabled={imgIdx === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffffff',
                    cursor: imgIdx === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '2rem',
                    opacity: imgIdx === 0 ? 0.4 : 1,
                    marginBottom: '0.5rem',
                  }}
                  aria-label="Previous image"
                >
                  &#8593;
                </button>
                <img
                  src={cards[current].imgs[imgIdx]}
                  alt={cards[current].title + ' ' + (imgIdx + 1)}
                  className={`scroll-img${expanded ? ' shrink' : ''}`}
                  onClick={handleExpand}
                  style={{ cursor: 'pointer', transition: 'all 0.7s cubic-bezier(.77,0,.18,1)' }}
                />
                <button 
                  className="img-arrow down" 
                  onClick={() => setImgIdx(idx => idx < cards[current].imgs.length - 1 ? idx + 1 : idx)} 
                  disabled={imgIdx === cards[current].imgs.length - 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffffff',
                    cursor: imgIdx === cards[current].imgs.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '2rem',
                    opacity: imgIdx === cards[current].imgs.length - 1 ? 0.4 : 1,
                    marginTop: '0.5rem',
                  }}
                  aria-label="Next image"
                >
                  &#8595;
                </button>
              </div>
            ) : (
              <img
                src={cards[current].img}
                alt={cards[current].title}
                className={`scroll-img${expanded ? ' shrink' : ''}`}
                onClick={handleExpand}
                style={{ cursor: 'pointer', transition: 'all 0.7s cubic-bezier(.77,0,.18,1)' }}
              />
            )}
            <button 
              className="click-indicator" 
              onClick={handleExpand}
              style={{ background: 'none', border: 'none', color: '#ffffffff', cursor: 'pointer', font: 'inherit', padding: 0 }}
              aria-pressed={expanded}
            >
              click for info
            </button>
            <div className="arrow-btn-row">
              <button className="arrow-btn left" onClick={goLeft} aria-label="Previous card" disabled={current === 0} style={current === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>&#8592;</button>
              <div
                className={`scroll-text${expanded ? ' expanded' : ''}`}
                onClick={handleExpand}
                style={{ cursor: 'pointer', transition: 'all 0.7s cubic-bezier(.77,0,.18,1)' }}
              >
                <div className="card-text">{cards[current].title}</div>
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

              {cards[current].text !== 'N/A' ? <div className="card-detail-row">{cards[current].text}</div> : null}
              {cards[current].size !== 'N/A' ? <div className="card-detail-row"><strong>Size:</strong> {cards[current].size}</div> : null}
              {cards[current].medium !== 'N/A' ? <div className="card-detail-row"><strong>Medium:</strong> {cards[current].medium}</div> : null}
              {cards[current].price !== 'N/A' ? <div className="card-detail-row"><strong>Price:</strong> {cards[current].price}</div> : null}
                {cards[current].date && cards[current].date !== 'N/A' ? (
                  <div className="card-detail-row"><strong>Date Completed:</strong> {formatDate(cards[current].date)}</div>
                ) : null}


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
     {/* <Footer /> */}
    </div>
  );
}

export default App;