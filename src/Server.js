const express = require('express');
const stripe = require('stripe')('sk_test_51SD4ntAIRFwBRpKYIq5QksYC2UrTIththTXZvRT8b3cYec8X9oQPSOKFiDrLBTKkoLCJDdjuUJGkcJdtdLxhydzQ00prdK7bjT');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001', // Allow your React frontend
  methods: ['GET', 'POST'],
  credentials: true
}));

// Checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { line_items, customer_email, customer_name } = req.body;
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded', // Use 'embedded' for embedded checkout
      payment_method_types: ['card'],
      line_items: line_items,
      customer_email: customer_email,
      mode: 'payment',
      return_url: `${req.headers.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });
    
    res.json({ clientSecret: session.client_secret });
    
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session status endpoint
app.get('/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});