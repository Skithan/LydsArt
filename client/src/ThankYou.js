import React, { useEffect, useState } from 'react';
import { sendConfirmationEmail, sendArtistNotification } from './emailService';


const ThankYou = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState('');
  const [pieceName, setPieceName] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    console.log('Session ID from URL:', sessionId);
    if (sessionId) {
      const statusUrl = process.env.REACT_APP_SESSION_STATUS_URL || 'https://sessionstatus-pdcnged4ca-uc.a.run.app';
      console.log('Using session status URL:', statusUrl);
      fetch(`${statusUrl}?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          // Set state for UI rendering
          setCustomerEmail(data.customer_email);
          setCustomerName(data.customer_name);
          setStatus(data.status);
          setPieceName(data.piece_name);
          setPaymentVerified(data.payment_verified);
    

          console.log('Customer Email:', data.customer_email);
          console.log('Customer Name:', data.customer_name);
          console.log('Piece Name:', data.piece_name);
          console.log('Session status:', data.status);
          console.log('Payment status:', data.payment_status);
          console.log('Payment intent status:', data.payment_intent_status);
          console.log('Payment verified:', data.payment_verified);
          console.log('Full session data:', data);

          // Send emails only if payment is fully verified and successful
          if(data.customer_email && data.payment_verified){
              // Prepare order details for email
              const emailOrderDetails = {
                session_id: sessionId,
                piece_name: data.piece_name,
                customer_name: data.customer_name
              };
               console.log('order details: ', emailOrderDetails);

              // Send confirmation email using the email service
              sendConfirmationEmail(data.customer_email, emailOrderDetails).then((result) => {
                if (result.success) {
                  console.log('Confirmation email sent successfully');
                } else {
                  console.error('Failed to send confirmation email:', result.error);
                }
              });

              // Send notification to artist
              sendArtistNotification(data.customer_email, emailOrderDetails).then((result) => {
                if (result.success) {
                  console.log('Artist notification sent successfully');
                } else {
                  console.error('Failed to send artist notification:', result.error);
                }
              });
           }
        });
    }

   
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      overflowY: 'auto', 
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      padding: '1rem 0.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 'max(2rem, 10vh)',
      paddingBottom: '2rem'
    }}>
      <div style={{
        background: '#ffffffdd', 
        borderRadius: '1.2rem', 
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)', 
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        maxWidth: '600px',
        width: 'calc(100% - 1rem)',
        minWidth: '280px',
        textAlign: 'center',
        fontFamily: 'Playfair Display, Inter, Segoe UI, Arial, serif',
        color: '#333333',
        margin: '0 auto',
        boxSizing: 'border-box',
        flex: '0 0 auto'
      }}>
        {customerName && (
        <h2 style={{ 
          fontWeight: 700, 
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', 
          marginBottom: 'clamp(1rem, 3vw, 2rem)', 
          color: '#333333', 
          textShadow: '0 2px 12px rgba(0, 0, 0, 0.1), 0 1px 0 #ffffff',
          lineHeight: '1.2'
        }}>
          Thank You {customerName}!
        </h2>
        )}
        
        {status === 'complete' && paymentVerified ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            fontSize: 'clamp(0.9rem, 2.8vw, 1.2rem)',
            lineHeight: '1.5'
          }}>
            <div style={{
              background: '#f0f8ff',
              borderRadius: 'clamp(0.5rem, 2vw, 1rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '2px solid #e6f3ff',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              <p style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#2c5530' }}>
                🎉 Your purchase was successful!
              </p>
              {pieceName && (
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: 'clamp(1rem, 3.2vw, 1.3rem)', 
                  fontWeight: '600',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}>
                  Artwork: <strong style={{ color: '#1a472a' }}>"{pieceName}"</strong>
                </p>
              )}
              <p style={{ 
                margin: '0', 
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)'
              }}>
                Confirmation sent to:<br />
                <strong style={{ color: '#1a472a' }}>{customerEmail}</strong>
              </p>
            </div>
            
            
            <div style={{
              background: '#fff8e1',
              borderRadius: 'clamp(0.5rem, 2vw, 1rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid #ffecb3',
              marginTop: 'clamp(0.5rem, 2vw, 1rem)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              <p style={{ 
                margin: '0', 
                fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                color: '#5d4037',
                fontStyle: 'italic',
                lineHeight: '1.4'
              }}>
                📧 Please check your email for order confirmation and next steps.<br />
                🎨 Thank you for supporting independent art!
              </p>
            </div>
          </div>
        ) : status === 'complete' && !paymentVerified ? (
          <div style={{
            background: '#ffebee',
            borderRadius: 'clamp(0.5rem, 2vw, 1rem)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            border: '2px solid #f44336',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: '#c62828', 
              margin: '0 0 1rem 0',
              fontSize: 'clamp(1.2rem, 4vw, 1.8rem)'
            }}>
              ⚠️ Payment Issue
            </h3>
            <p style={{ 
              margin: '0 0 1rem 0',
              color: '#d32f2f',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)'
            }}>
              There was an issue processing your payment. Please contact support or try again.
            </p>
            <button 
              onClick={() => window.location.href = '/cart'}
              style={{
                background: '#c62828',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.7rem 1.5rem',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                cursor: 'pointer'
              }}
            >
              Return to Cart
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #666666',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ 
              margin: '0',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: '#666666'
            }}>
              Processing your payment...
            </p>
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ThankYou;