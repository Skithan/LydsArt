require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://lydiapaterson.netlify.app', // Allow your React frontend
  methods: ['GET', 'POST'],
  credentials: true
}));

// Checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  console.log('Received request: /create-checkout-session');
  console.log(req.headers.origin);
  console.log('req.boyd is :: ', req.body);
  try {
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.line_items,
      customer_email: req.body.customer_email,
      customer_name: req.body.customer_name,
      mode: 'payment',
      ui_mode: 'embedded',
      return_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`
    });
      
    console.log('Checkout session created with ID:', session.id);
    console.log('returnurl: ', `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`);
    
    res.json({ clientSecret: session.client_secret });
    
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session status endpoint
app.get('/session-status', async (req, res) => {
  console.log('Received request: /session-status');
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id,
      {
        expand: ['line_items']
      }
    );
    
    console.log('Session retrieved:', session);
    console.log('Line items:', session.line_items);
    
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      line_items: session.line_items?.data || [],
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status
    });
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});