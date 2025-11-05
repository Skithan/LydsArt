import emailjs from '@emailjs/browser';

// EmailJS configuration using Netlify environment variables
// Set these in your Netlify dashboard under Site settings > Environment variables
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_BUYER = process.env.REACT_APP_EMAILJS_TEMPLATE_ID_BUYER;
const TEMPLATE_ID_SELLER = process.env.REACT_APP_EMAILJS_TEMPLATE_ID_SELLER;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

/**
 * Sends a confirmation email to the customer after successful purchase
 * @param {string} customerEmail - The customer's email address
 * @param {Object} orderDetails - Optional order details to include in email
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendConfirmationEmail = async (customerEmail, orderDetails) => {
  try {
    
    
    // Validate inputs
    if (!customerEmail || !customerEmail.includes('@')) {
      throw new Error('Invalid customer email address');
    }
    
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      throw new Error('EmailJS configuration is missing. Check environment variables.');
    }
    
    // Prepare email template parameters
    const templateParams = {
      to_name: orderDetails?.customer_name,
      to_email: customerEmail,
      from_name: 'Lydia Paterson Art',
      message: 'Thank you for your artwork purchase!',
      piece_name: orderDetails?.line_items?.[0]?.price_data?.product_data?.name,
    };
    
    console.log('Template parameters:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_BUYER,
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
      to_name: orderDetails?.customer_name,
      to_email: 'lydiapatersonart@gmail.com',
      from_name: 'Past Ethan:)',
      customer_email: customerEmail,
      piece_name: orderDetails?.line_items?.[0]?.price_data?.product_data?.name,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_SELLER, 
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
