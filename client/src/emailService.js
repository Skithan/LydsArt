import emailjs from '@emailjs/browser';

// EmailJS configuration using Netlify environment variables
// Set these in your Netlify dashboard under Site settings > Environment variables
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

/**
 * Sends a confirmation email to the customer after successful purchase
 * @param {string} customerEmail - The customer's email address
 * @param {Object} orderDetails - Optional order details to include in email
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendConfirmationEmail = async (customerEmail, orderDetails) => {
  try {
    console.log('Sending confirmation email to:', customerEmail);
    console.log('Using EmailJS service ID:', SERVICE_ID);
    console.log('Using EmailJS template ID:', TEMPLATE_ID);
    console.log('Using EmailJS public key:', PUBLIC_KEY);
    
    // Validate inputs
    if (!customerEmail || !customerEmail.includes('@')) {
      throw new Error('Invalid customer email address');
    }
    
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      throw new Error('EmailJS configuration is missing. Check environment variables.');
    }
    
    // Prepare email template parameters
    const templateParams = {
      to_name: customerEmail.split('@')[0], // Extract name from email
      to_email: customerEmail,
      from_name: 'Lydia Paterson Art',
      message: 'Thank you for your artwork purchase! Your order has been confirmed.',
      reply_to: customerEmail,
      // Add any additional order details
      ...orderDetails
    };
    
    console.log('Template parameters:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('Confirmation email sent successfully:', response);
    return {
      success: true,
      response: response
    };

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sends a notification email to the artist when a purchase is made
 * @param {string} customerEmail - The customer's email address
 * @param {Object} orderDetails - Order details to include in notification
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendArtistNotification = async (customerEmail, orderDetails) => {
  try {
    console.log('Sending artist notification for order from:', customerEmail);
    
    const templateParams = {
      to_name: 'Lydia',
      to_email: 'lydiapatersonart@gmail.com',
      from_name: customerEmail,
      customer_email: customerEmail,
      message: `New artwork purchase from ${customerEmail}`,
      reply_to: customerEmail,
      ...orderDetails
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID, // You might want a different template for artist notifications
      templateParams,
      PUBLIC_KEY
    );

    console.log('Artist notification sent successfully:', response);
    return {
      success: true,
      response: response
    };

  } catch (error) {
    console.error('Error sending artist notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
