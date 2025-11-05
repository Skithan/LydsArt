import React, { useEffect, useState } from 'react';
import { sendConfirmationEmail, sendArtistNotification } from './emailService';


const ThankYou = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    console.log('Session ID from URL:', sessionId);
    if (sessionId) {
      fetch(`https://lydsart.onrender.com/session-status?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          // Set state for UI rendering
          setCustomerEmail(data.customer_email);
          setCustomerName(data.customer_name);
          setStatus(data.status);
    

          console.log('Customer Email:', data.customer_email);
          console.log('Customer Name:', data.customer_name);
          console.log('Piece Name:', data.piece_name);
          console.log('Session status data:', data.status);
          console.log('Full session data:', data);

          // Send emails immediately with fresh data (don't wait for state updates)
          if(data.customer_email && data.status === 'complete'){
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
      <div className="ThankYou">
        <h2 className="thankyou-title">Thank You!</h2>
      {status === 'complete' ? (
        <div>
          <p>
            Your purchase was successful.<br />
            Confirmation sent to: <strong>{customerEmail}</strong>
          </p>
          {customerName && (
            <p>Customer: <strong>{customerName}</strong></p>
          )}
          
        </div>
      ) : (
        <p>Processing your payment...</p>
      )}
    </div>
  );
};

export default ThankYou;