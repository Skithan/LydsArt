import emailjs from '@emailjs/browser';

// EmailJS configuration - replace these with your actual EmailJS credentials
const SERVICE_ID = ''; // Replace with your EmailJS service ID
const TEMPLATE_ID = ''; // Replace with your EmailJS template ID  
const PUBLIC_KEY_EMAILJS = ''; // Replace with your EmailJS public key

/**
 * Sends a confirmation email to the customer after successful purchase
 * @param {string} customerEmail - The customer's email address
 * @param {Object} orderDetails - Optional order details to include in email
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendConfirmationEmail = async (customerEmail, orderDetails = {}) => {
  try {
    console.log('Sending confirmation email to:', customerEmail);
    
    // Prepare email template parameters
    const templateParams = {
      to_email: customerEmail,
      customer_email: customerEmail,
      message: 'Thank you for your artwork purchase!',
      subject: 'LydsArt - Purchase Confirmation',
      // Add any additional order details
      ...orderDetails
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY_EMAILJS
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
export const sendArtistNotification = async (customerEmail, orderDetails = {}) => {
  try {
    console.log('Sending artist notification for order from:', customerEmail);
    
    const templateParams = {
      to_email: 'lydiapatersonart@gmail.com', // Replace with artist's email
      customer_email: customerEmail,
      message: `New artwork purchase from ${customerEmail}`,
      subject: 'LydsArt - New Order Notification',
      ...orderDetails
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID, // You might want a different template for artist notifications
      templateParams,
      PUBLIC_KEY_EMAILJS
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
