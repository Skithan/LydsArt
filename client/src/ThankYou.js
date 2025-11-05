import React, { useEffect, useState } from 'react';
import { sendConfirmationEmail, sendArtistNotification } from './emailService';


const ThankYou = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    console.log('Session ID from URL:', sessionId);
    if (sessionId) {
      fetch(`https://lydsart.onrender.com/session-status?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setCustomerEmail(data.customer_email);
          setCustomerName(data.customer_details?.name);
          setStatus(data.status);
          setOrderDetails(data);
          
          console.log('Customer Email:', data.customer_email);
          console.log('Customer Name:', data.customer_details?.name);
          console.log('Session status data:', data.status);
          console.log('Line items:', data.line_items);
          console.log('Full session data:', data);
          
           if(data.customer_email){
            
              // Prepare order details for email
              const emailOrderDetails = {
                session_id: sessionId,
                purchase_status: data.status,
                purchase_date: new Date().toLocaleDateString(),
                line_items: data.line_items,
                customer_name: data.customer_details?.name
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
          {orderDetails?.line_items && orderDetails.line_items.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '0.5rem' }}>
              <h3>Order Details:</h3>
              {orderDetails.line_items.map((item, index) => (
                <div key={index} style={{ marginBottom: '0.5rem' }}>
                  <strong>{item.description}</strong> - Quantity: {item.quantity} - 
                  ${(item.amount_total / 100).toFixed(2)} {orderDetails.currency?.toUpperCase()}
                </div>
              ))}
              {orderDetails.amount_total && (
                <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                  Total: ${(orderDetails.amount_total / 100).toFixed(2)} {orderDetails.currency?.toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>Processing your payment...</p>
      )}
    </div>
  );
};

export default ThankYou;