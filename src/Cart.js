import React, { useState } from 'react';
import './App.css';

// Simple Stripe.js embed (replace with your own publishable key for production)
const STRIPE_PK = 'pk_test_51NxxxxxxReplaceWithYourKey';

const Cart = (props) => {
  const [showForm, setShowForm] = useState(true);
  const card = props.card;
  return (
    <section id="cart" className="cart-section" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '70vh', justifyContent: 'center', background: 'linear-gradient(90deg, #f7ecd0 0%, #f3e3b3 100%)', boxShadow: '0 4px 24px #f3e3b366', borderRadius: '1.2rem', margin: '2rem auto', maxWidth: '520px', padding: '2.5rem 2rem', fontFamily: 'Playfair Display, Inter, Segoe UI, Arial, serif', color: '#6d4c1b', letterSpacing: '2px'}}>
      <h2 style={{ fontWeight: 700, fontSize: '2.2rem', marginBottom: '1.5rem', color: '#8c6a2a', textShadow: '0 2px 12px #f3e3b355, 0 1px 0 #fffbe6' }}>Reserve & Checkout</h2>
      {card && (
        <div style={{ background: '#fffbe6', borderRadius: '1rem', boxShadow: '0 2px 8px #f3e3b322', padding: '1.2rem', marginBottom: '2rem', width: '100%', maxWidth: '400px' }}>
          <h3 style={{ color: '#6d4c1b', fontWeight: 600, fontSize: '1.3rem', marginBottom: '0.7rem' }}>{card.title}</h3>
          <div style={{ color: '#6d4c1b', fontSize: '1.1rem', marginBottom: '0.3rem' }}><strong>Medium:</strong> {card.medium}</div>
          <div style={{ color: '#6d4c1b', fontSize: '1.1rem', marginBottom: '0.3rem' }}><strong>Size:</strong> {card.size}</div>
          <div style={{ color: '#6d4c1b', fontSize: '1.1rem', marginBottom: '0.3rem' }}><strong>Price:</strong> {card.price}</div>
          <div style={{ color: '#6d4c1b', fontSize: '1.1rem', marginBottom: '0.3rem' }}><strong>Description:</strong> {card.text}</div>
          <div style={{ color: '#6d4c1b', fontSize: '1.1rem', marginBottom: '0.3rem' }}><strong>Date Completed:</strong> {card.date}</div>
          <div style={{ color: '#6d4c1b', fontSize: '1.1rem', marginBottom: '0.3rem' }}><strong>Sold:</strong> {card.sold ? 'Yes' : 'No'}</div>
          {card.imgs && card.imgs.length > 0 && (
            <img src={card.imgs[0]} alt={card.title} style={{ width: '100%', maxWidth: '320px', borderRadius: '1rem', marginTop: '0.7rem', boxShadow: '0 2px 8px #0002' }} />
          )}
        </div>
      )}
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>Please enter your payment details to reserve your selected artwork. All transactions are securely processed.</p>
      {showForm && (
        <form
          style={{width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
          onSubmit={async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            const email = e.target.email.value.trim();
            const name = e.target.name.value.trim();
            console.log('Name:', name);
            console.log('Email:', email);
            // Simple email validation
            const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailPattern.test(email)) {
              console.log('Invalid email');
              alert('Please enter a valid email address.');
              return;
            }
            // Prepare Stripe line_items
            console.log('Card price:', card.price);
            const line_items = [
              {
                price_data: card.price,
                quantity: 1,
              }
            ];
            console.log('Line items:', line_items);
            try {
              const res = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ line_items, customer_email: email }),
              });
              console.log('Fetch response status:', res.status);
              const data = await res.json();
              console.log('Stripe session response:', data);
              if (data.url) {
                console.log('Redirecting to Stripe Checkout:', data.url);
                window.location.href = data.url;
              } else {
                console.log('Stripe error:', data.error);
                alert('Error creating checkout session: ' + (data.error || 'Unknown error'));
              }
            } catch (err) {
              console.log('Network or fetch error:', err);
              alert('Network error: ' + err.message);
            }
          }}
        >
            
          <input type="text" name="name" placeholder="Name on Card" required style={{ padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #e7d3a1', fontSize: '1.1rem', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }} />
          <input type="email" name="email" placeholder="Email" required style={{ padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #e7d3a1', fontSize: '1.1rem', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }} />
          <button type="submit" style={{ background: '#6d4c1b', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 2px 8px #f3e3b322', transition: 'background 0.2s, color 0.2s' }}>Pay & Reserve</button>
        </form>
      )}
      {!showForm && (
        <div style={{ color: '#8c6a2a', fontSize: '1.3rem', marginTop: '2rem' }}>Thank you for your reservation!</div>
      )}
    </section>
  );
};

export default Cart;
