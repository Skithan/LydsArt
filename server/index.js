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

// Define secrets
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const adminEmail = defineSecret("ADMIN_EMAIL");

// Initialize Stripe - this will be done within each function
const initStripe = (secretValue) => {
  if (!secretValue) {
    throw new Error("Stripe secret key not configured");
  }
  return require("stripe")(secretValue);
};

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
      const artworkIds = req.body.artwork_ids || [];

      // Check if all artworks are still available
      for (const artworkId of artworkIds) {
        const artworkDoc = await db.collection("artwork").doc(artworkId).get();

        if (!artworkDoc.exists) {
          res.status(404).json({error: `Artwork with ID ${artworkId} not found`});
          return;
        }

        const artworkData = artworkDoc.data();
        if (artworkData.sold) {
          res.status(400).json({error: `Artwork "${artworkData.title}" has already been sold`});
          return;
        }
      }

      const stripe = initStripe(stripeSecretKey.value());

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        line_items: req.body.line_items,
        customer_email: req.body.customer_email,
        metadata: {
          customer_name: req.body.customer_name,
          piece_name: req.body.line_items[0].price_data.product_data.name,
          artwork_ids: JSON.stringify(artworkIds), // Store all artwork IDs
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
      if (isPaymentSuccessful && session.metadata?.artwork_ids) {
        const customerInfo = {
          customer_name: session.metadata.customer_name,
          customer_email: session.customer_email,
        };

        try {
          const artworkIds = JSON.parse(session.metadata.artwork_ids);

          // Mark all artworks as sold
          for (const artworkId of artworkIds) {
            const soldSuccessfully = await markArtworkAsSold(artworkId, customerInfo);
            if (!soldSuccessfully) {
              logger.error(`Failed to mark artwork ${artworkId} as sold in Firestore`);
            }
          }
        } catch (parseError) {
          logger.error("Error parsing artwork IDs from metadata:", parseError);
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

/**
 * Helper function to verify admin user
 * @param {string} token - Firebase Auth ID token
 * @param {string} adminEmailValue - Admin email from secret
 * @return {boolean} Whether user is admin
 */
async function verifyAdminUser(token, adminEmailValue) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.email === adminEmailValue;
  } catch (error) {
    logger.error("Error verifying admin token:", error);
    return false;
  }
}

// Admin: Get all artwork
exports.adminGetArtwork = onRequest({secrets: [adminEmail]}, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method not allowed");
      return;
    }

    try {
      // Verify admin user
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || !(await verifyAdminUser(token, adminEmail.value()))) {
        res.status(403).json({error: "Unauthorized: Admin access only"});
        return;
      }

      const artworkSnapshot = await db.collection("artwork")
          .orderBy("title")
          .get();

      const artwork = artworkSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({artwork});
    } catch (error) {
      logger.error("Error fetching artwork:", error);
      res.status(500).json({error: error.message});
    }
  });
});

// Admin: Add new artwork
exports.adminAddArtwork = onRequest({secrets: [adminEmail]}, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    try {
      // Verify admin user
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || !(await verifyAdminUser(token, adminEmail.value()))) {
        res.status(403).json({error: "Unauthorized: Admin access only"});
        return;
      }

      const artworkData = {
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        sold: false,
      };

      const docRef = await db.collection("artwork").add(artworkData);

      res.json({
        success: true,
        id: docRef.id,
        message: "Artwork added successfully",
      });
    } catch (error) {
      logger.error("Error adding artwork:", error);
      res.status(500).json({error: error.message});
    }
  });
});

// Admin: Update artwork
exports.adminUpdateArtwork = onRequest({secrets: [adminEmail]}, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "PUT") {
      res.status(405).send("Method not allowed");
      return;
    }

    try {
      // Verify admin user
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || !(await verifyAdminUser(token, adminEmail.value()))) {
        res.status(403).json({error: "Unauthorized: Admin access only"});
        return;
      }

      const {artworkId, ...updateData} = req.body;
      if (!artworkId) {
        res.status(400).json({error: "Artwork ID is required"});
        return;
      }

      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await db.collection("artwork").doc(artworkId).update(updateData);

      res.json({
        success: true,
        message: "Artwork updated successfully",
      });
    } catch (error) {
      logger.error("Error updating artwork:", error);
      res.status(500).json({error: error.message});
    }
  });
});

// Admin: Delete artwork
exports.adminDeleteArtwork = onRequest({secrets: [adminEmail]}, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "DELETE") {
      res.status(405).send("Method not allowed");
      return;
    }

    try {
      // Verify admin user
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || !(await verifyAdminUser(token, adminEmail.value()))) {
        res.status(403).json({error: "Unauthorized: Admin access only"});
        return;
      }

      const artworkId = req.query.id;
      if (!artworkId) {
        res.status(400).json({error: "Artwork ID is required"});
        return;
      }

      await db.collection("artwork").doc(artworkId).delete();

      res.json({
        success: true,
        message: "Artwork deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting artwork:", error);
      res.status(500).json({error: error.message});
    }
  });
});
