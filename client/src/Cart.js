import { useState } from "react";
import { useLocation } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import './App.css';

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
console.log('Stripe Public Key:', stripePublicKey);
console.log('Environment variables:', process.env);

if (!stripePublicKey) {
  console.error('REACT_APP_STRIPE_PUBLIC_KEY is not set in environment variables');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const Cart = () => {
  const location = useLocation();
  const card = location.state;
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState(null);


  // Process the payment when "Pay & Reserve" is clicked
  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Get form data
    const email = e.target.email.value.trim();
    const name = e.target.name.value.trim();
    
    // Simple email validation
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    // Prepare payment data
    const line_items = [{
      price_data: {
        currency: 'cad',
        product_data: {
          name: card.title,
        },
        unit_amount: parseInt(card.price.replace(/[^\d]/g, '')) * 100
      },
      quantity: 1,
    }];

    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call your Firebase Function to create a checkout session
      console.log('sending request to Firebase Function : createCheckoutSession');
      const response = await fetch(process.env.REACT_APP_CREATE_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          line_items: line_items, 
          customer_email: email,
          customer_name: name
        }),
      });
      
      const data = await response.json();
      console.log('Response from server:', data);
      
      if (data.error) {
        setError(`Payment Error: ${data.error}`);
        setIsProcessing(false);
        return;
      }
      
      if (data.clientSecret) {
        // For embedded checkout
        setClientSecret(data.clientSecret);
      } else if (data.url) {
        // For hosted checkout (redirect)
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Payment request error:', err);
      setError(`Network Error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // Handle when checkout is complete
  const handleCheckoutComplete = () => {
    setPaymentCompleted(true);
    setIsProcessing(false);
  };

  return (
    <div style={{ 
      height: '100vh', 
      overflowY: 'auto', 
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      padding: '2rem 0'
    }}>
      <section id="cart" className="cart-section" style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        minHeight: '150vh',
        justifyContent: 'flex-start', 
        background: '#ffffffdd', 
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)', 
        borderRadius: '1.2rem', 
        margin: '2rem auto 4rem auto', 
        maxWidth: '520px', 
        padding: '2.5rem 2rem', 
        fontFamily: 'Playfair Display, Inter, Segoe UI, Arial, serif', 
        color: '#333333', 
        letterSpacing: '2px'
      }}>
      <h2 style={{ fontWeight: 700, fontSize: '2.2rem', marginBottom: '1.5rem', color: '#333333', textShadow: '0 2px 12px rgba(0, 0, 0, 0.1), 0 1px 0 #ffffff' }}>
        Reserve & Checkout
      </h2>
      
   
      {card && (
        <div style={{ background: '#ffffffdd', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', padding: '1.2rem', marginBottom: '2rem', width: '100%', maxWidth: '400px' }}>
          <h3 style={{ color: '#333333', fontWeight: 600, fontSize: '1.3rem', marginBottom: '0.7rem' }}>{card.title}</h3>
          {Object.entries(card).map(([key, value]) => (
            key !== 'imgs' && key !== 'sold' ? (
              <div key={key} style={{ color: '#4a4a4a', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
              </div>
            ) : null
          ))}
          {card.imgs && card.imgs.length > 0 && (
            <img src={card.imgs[0]} alt={card.title} style={{position: 'center', width: '100%', maxWidth: '320px', borderRadius: '1rem', marginTop: '0.7rem', boxShadow: '0 2px 8px #0002' }} />
          )}
        </div>
      )}


      {!clientSecret && !paymentCompleted && (
        <>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Please enter your payment details below.
          </p>
          
          {error && (
            <div style={{ 
              color: '#c62828', 
              background: '#ffebee', 
              padding: '0.8rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem', 
              width: '100%', 
              maxWidth: '400px', 
              textAlign: 'center' 
            }}>
              {error}
            </div>
          )}
          
          <form
            style={{
              width: '100%', 
              maxWidth: '400px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.2rem'
            }}
            onSubmit={handlePayment}
          >
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              required 
              style={{ 
                padding: '0.7rem 1rem', 
                borderRadius: '1rem', 
                border: '1px solid #d0d0d0', 
                fontSize: '1.1rem', 
                fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                background: '#ffffff',
                color: '#333333'
              }} 
            />
            
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              required 
              style={{ 
                padding: '0.7rem 1rem', 
                borderRadius: '1rem', 
                border: '1px solid #d0d0d0', 
                fontSize: '1.1rem', 
                fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                background: '#ffffff',
                color: '#333333'
              }} 
            />
            
            <button 
              type="submit" 
              disabled={isProcessing}
              style={{ 
                background: isProcessing ? '#888888' : '#666666', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '1rem', 
                padding: '0.7rem 1.5rem', 
                fontWeight: 600, 
                fontSize: '1.2rem', 
                cursor: isProcessing ? 'not-allowed' : 'pointer', 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                transition: 'background 0.2s, color 0.2s', 
                marginTop: '2rem' 
              }}
            >
              {isProcessing ? 'Processing...' : 'Pay & Reserve'}
            </button>
          </form>
        </>
      )}

      {clientSecret && !paymentCompleted && stripePromise && (
        <div style={{ width: '100%', maxWidth: '450px' }}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout 
              onComplete={handleCheckoutComplete}
            />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      {clientSecret && !stripePromise && (
        <div style={{ 
          color: '#c62828', 
          background: '#ffebee', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          Stripe configuration error. Please check environment variables.
        </div>
      )}
    </section>
    </div>
  );
};

export default Cart;