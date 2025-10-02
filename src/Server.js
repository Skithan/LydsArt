// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.
// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
const stripe = require('stripe')('sk_test_51SD4ntAIRFwBRpKYIq5QksYC2UrTIththTXZvRT8b3cYec8X9oQPSOKFiDrLBTKkoLCJDdjuUJGkcJdtdLxhydzQ00prdK7bjT');
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json());

const YOUR_DOMAIN = 'http://localhost:3001';

app.post('/create-checkout-session', async (req, res) => {
  console.log('Received POST from Cart.js:', req.body);
  try {
    const { line_items, customer_email } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      customer_email,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Running on port 3001'));