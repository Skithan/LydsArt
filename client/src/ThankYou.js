import React, { useEffect, useState } from 'react';

const ThankYou = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    console.log('Session ID from URL:', sessionId);
    if (sessionId) {
      fetch(`https://lydsart.onrender.com/session-status?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setCustomerEmail(data.customer_email);
          setStatus(data.status);
          console.log('Customer Email:', data.customer_email);
          console.log('Session status data:', data.status);
          console.log('data:', data);
        });
    }
  }, []);

  return (
      <div className="ThankYou">
        <h2 className="thankyou-title">Thank You!</h2>
      {status === 'complete' ? (
        <p>
          Your purchase was successful.<br />
          Confirmation sent to: <strong>{customerEmail}</strong>
        </p>
      ) : (
        <p>Processing your payment...</p>
      )}
    </div>
  );
};

export default ThankYou;