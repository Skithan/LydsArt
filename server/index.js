const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {defineSecret} = require("firebase-functions/params");
const cors = require("cors")({
  origin: true, // Allow all origins for now, you can restrict this later
  credentials: true,
});

// Define the secret for Stripe
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

// Initialize Stripe - this will be done within each function
const initStripe = (secretValue) => {
  if (!secretValue) {
    throw new Error("Stripe secret key not configured");
  }
  return require("stripe")(secretValue);
};

// Create checkout session endpoint
exports.createCheckoutSession = onRequest({secrets: [stripeSecretKey]}, (req, res) => {
  cors(req, res, async () => {
    logger.info("Received request: /create-checkout-session");
    logger.info("Origin:", req.headers.origin);
    logger.info("Request body:", req.body);

    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    try {
      const stripe = initStripe(stripeSecretKey.value());

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        line_items: req.body.line_items,
        customer_email: req.body.customer_email,
        metadata: {
          customer_name: req.body.customer_name,
          piece_name: req.body.line_items[0].price_data.product_data.name,
        },
        mode: "payment",
        ui_mode: "embedded",
        return_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      });

      logger.info("Checkout session created with ID:", session.id);
      logger.info("Return URL:", `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`);
      logger.info("Line items:", req.body.line_items);

      res.json({clientSecret: session.client_secret});
    } catch (error) {
      logger.error("Checkout session error:", error);
      res.status(500).json({error: error.message});
    }
  });
});

// Get session status endpoint
exports.sessionStatus = onRequest({secrets: [stripeSecretKey]}, (req, res) => {
  cors(req, res, async () => {
    logger.info("Received request: /session-status");

    if (req.method !== "GET") {
      res.status(405).send("Method not allowed");
      return;
    }

    try {
      const stripe = initStripe(stripeSecretKey.value());

      const sessionId = req.query.session_id;
      if (!sessionId) {
        res.status(400).json({error: "Missing session_id parameter"});
        return;
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      logger.info("Session retrieved:", session);
      logger.info("Customer email:", session.customer_email);
      logger.info("Customer name from metadata:", session.metadata?.customer_name);

      res.json({
        status: session.status,
        customer_email: session.customer_email,
        customer_name: session.metadata?.customer_name,
        piece_name: session.metadata?.piece_name,
      });
    } catch (error) {
      logger.error("Session status error:", error);
      res.status(500).json({error: error.message});
    }
  });
});
