
import React from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';

function ReservePiece() {

  const location = useLocation();
  const card = location.state && location.state.card;
  const [message, setMessage] = React.useState("Hi, I would like to buy this piece.");

  const handleBack = () => {
    window.history.length > 1 ? window.history.back() : window.location.assign('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!card) return;
    const subject = encodeURIComponent(`Reserve: ${card.title}`);
    const body = encodeURIComponent(`${message}`);
    window.location.href = `mailto:ethanalward@outlook.com?subject=${subject}&body=${body}`;
  };

  if (!card) {
    return (
      <div className="ReservePiece">
        <div className="animated-bg" aria-hidden="true"></div>
        <div className="content">
          No piece selected for reservation.
        </div>
      </div>
    );
  }

  return (
    <div className="ReservePiece">
      <div className="animated-bg" aria-hidden="true"></div>
      <div className="content" style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <h2 style={{ color: 'white' }}>Reserve Piece</h2>
        <div style={{ margin: '1rem 0', color: 'white' }}>
          <strong>Title:</strong> {card.title}<br />
          {card.img && <img src={card.img} alt={card.title} style={{ maxWidth: 300, display: 'block', margin: '1rem auto' }} />}
          {card.imgs && card.imgs.length > 0 && <img src={card.imgs[0]} alt={card.title} style={{ maxWidth: 300, display: 'block', margin: '1rem auto' }} />}
          {card.medium && <div><strong>Medium:</strong> {card.medium}</div>}
          {card.size && <div><strong>Size:</strong> {card.size}</div>}
          {card.price && <div><strong>Price:</strong> {card.price}</div>}
          {card.date && <div><strong>Date Created:</strong> {card.date}</div>}
        </div>
 
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <button type="submit" className="arrow-btn" style={{ minWidth: '12rem', padding: '0.5rem 1.5rem', fontSize: '1.1rem', whiteSpace: 'nowrap', marginBottom: '1.5rem' }}>
            Send Reservation
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem', marginTop: '1.5rem' }}>
          <button className="arrow-btn" style={{ minWidth: '12rem', padding: '0.5rem 1.5rem', fontSize: '1.3rem', whiteSpace: 'nowrap' }} onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservePiece;
