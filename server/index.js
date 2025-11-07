const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {defineSecret} = require("firebase-functions/params");
const cors = require("cors")({
  origin: true, // Allow all origins for now, you can restrict this later
  credentials: true,
});

// Import Firebase Admin SDK for Firestore operations
const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Define the secret for Stripe
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

// Initialize Stripe - this will be done within each function
const initStripe = (secretValue) => {
  if (!secretValue) {
    throw new Error("Stripe secret key not configured");
  }
  return require("stripe")(secretValue);
};

/**
 * Helper function to find artwork by title in Firestore
 * @param {string} title - The title of the artwork to find
 * @return {Object|null} The artwork document or null if not found
 */
async function findArtworkByTitle(title) {
  try {
    const artworkQuery = await db.collection("artwork")
        .where("title", "==", title)
        .limit(1)
        .get();

    if (artworkQuery.empty) {
      return null;
    }

    const doc = artworkQuery.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    logger.error("Error finding artwork:", error);
    return null;
  }
}

/**
 * Helper function to mark artwork as sold
 * @param {string} artworkId - The Firestore document ID of the artwork
 * @param {Object} customerInfo - Customer information object
 * @return {boolean} Success status
 */
async function markArtworkAsSold(artworkId, customerInfo) {
  try {
    await db.collection("artwork").doc(artworkId).update({
      sold: true,
      soldAt: admin.firestore.FieldValue.serverTimestamp(),
      soldTo: customerInfo.customer_name,
      soldToEmail: customerInfo.customer_email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info(`Artwork ${artworkId} marked as sold`);
    return true;
  } catch (error) {
    logger.error("Error marking artwork as sold:", error);
    return false;
  }
}

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
      const artworkTitle = req.body.line_items[0].price_data.product_data.name;

      // Check if artwork is still available
      const artwork = await findArtworkByTitle(artworkTitle);
      if (!artwork) {
        res.status(404).json({error: "Artwork not found"});
        return;
      }

      if (artwork.sold) {
        res.status(400).json({error: "This artwork has already been sold"});
        return;
      }

      const stripe = initStripe(stripeSecretKey.value());

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        line_items: req.body.line_items,
        customer_email: req.body.customer_email,
        metadata: {
          customer_name: req.body.customer_name,
          piece_name: artworkTitle,
          artwork_id: artwork.id, // Store Firestore document ID
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

// Import and export the upload function
const {uploadArtworkData} = require("./uploadFunction");
exports.uploadArtworkData = uploadArtworkData;

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

      // Retrieve session with expanded payment intent for full payment details
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      });

      logger.info("Session retrieved:", {
        session_id: session.id,
        session_status: session.status,
        payment_status: session.payment_status,
        payment_intent_status: session.payment_intent?.status,
        amount_received: session.payment_intent?.amount_received,
      });

      // Comprehensive payment verification
      const isPaymentSuccessful =
        session.status === "complete" &&
        session.payment_status === "paid" &&
        session.payment_intent?.status === "succeeded";

      logger.info("Payment verification:", {
        session_complete: session.status === "complete",
        payment_paid: session.payment_status === "paid",
        intent_succeeded: session.payment_intent?.status === "succeeded",
        overall_success: isPaymentSuccessful,
      });

      // Only mark artwork as sold if payment actually succeeded
      if (isPaymentSuccessful && session.metadata?.artwork_id) {
        const customerInfo = {
          customer_name: session.metadata.customer_name,
          customer_email: session.customer_email,
        };

        const soldSuccessfully = await markArtworkAsSold(
            session.metadata.artwork_id,
            customerInfo,
        );

        if (!soldSuccessfully) {
          logger.error("Failed to mark artwork as sold in Firestore");
        }
      }

      res.json({
        status: session.status,
        payment_status: session.payment_status,
        payment_intent_status: session.payment_intent?.status,
        payment_verified: isPaymentSuccessful,
        customer_email: session.customer_email,
        customer_name: session.metadata?.customer_name,
        piece_name: session.metadata?.piece_name,
        amount_received: session.payment_intent?.amount_received,
        currency: session.payment_intent?.currency,
        session_id: session.id,
      });
    } catch (error) {
      logger.error("Session status error:", error);
      res.status(500).json({error: error.message});
    }
  });
});
