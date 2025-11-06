// Upload artwork data to Firestore from Firebase Functions environment
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin (this will use the built-in service account in Functions)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Artwork data to upload
const artworkData = [
  {
    title: "An Uptown Perspective",
    medium: "Acrylic on Canvas",
    size: "18\"x24\"",
    date: "2025",
    price: null,
    sold: true,
    imageUrl: "/AnUptownPerspective2.jpeg",
    slug: "an-uptown-perspective",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Comfort In Change",
    medium: "Oil on Canvas",
    size: "24\"x30\"",
    date: "2024",
    price: 450,
    priceDisplay: "$450",
    sold: false,
    imageUrl: "/ComfortInChange.jpeg",
    slug: "comfort-in-change",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "End Of Summer Flowers",
    medium: "Acrylic on Panel",
    size: "18\"x24\"",
    date: "2025",
    price: 400,
    priceDisplay: "$400",
    sold: false,
    imageUrl: "/EndOfSummerFlowers.jpeg",
    slug: "end-of-summer-flowers",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "False Light",
    medium: "Acrylic on Canvas",
    size: "18\"x24\"",
    date: "2025",
    price: null,
    sold: true,
    imageUrl: "/FalseLight.jpeg",
    slug: "false-light",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Familiar Faces",
    medium: "Acrylic on Canvas",
    size: "18\"x24\"",
    date: "2025",
    price: null,
    sold: true,
    imageUrl: "/FamiliarFaces.jpeg",
    slug: "familiar-faces",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "King Square At Night",
    medium: "Oil on Canvas",
    size: "18\"x24\"",
    date: "2022",
    price: null,
    sold: true,
    imageUrl: "/KingSquareAtNight.jpeg",
    slug: "king-square-at-night",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "No Dogs On The Couch",
    medium: "Oil on Canvas",
    size: "18\"x24\"",
    date: "2022",
    price: null,
    sold: true,
    imageUrl: "/NoDogsOnTheCouch.jpeg",
    slug: "no-dogs-on-the-couch",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Sharing A Temporary Home",
    medium: "Acrylic on Canvas",
    size: "48\"x60\"",
    date: "2023",
    price: 5000,
    priceDisplay: "$5000",
    sold: false,
    imageUrl: "/SharingATemporaryHome.jpeg",
    slug: "sharing-a-temporary-home",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Simon And Garfunkel Kids",
    medium: "Acrylic on Canvas",
    size: null,
    date: "2024",
    price: null,
    sold: true,
    imageUrl: "/SimonAndGarfunkelKids.jpeg",
    slug: "simon-and-garfunkel-kids",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Yellow Frog",
    medium: "Oil on Canvas",
    size: "24\"x30\"",
    date: "2024",
    price: null,
    sold: true,
    imageUrl: "/YellowFrog.jpeg",
    slug: "yellow-frog",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Blue Frog",
    medium: "Oil on Canvas",
    size: "24\"x30\"",
    date: "2024",
    price: null,
    sold: true,
    imageUrl: "/BlueFrog.jpeg",
    slug: "blue-frog",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Cloud Function to upload artwork data (one-time use)
exports.uploadArtworkData = onRequest(async (req, res) => {
  try {
    logger.info("Starting artwork data upload...");

    const artworkCollection = db.collection("artwork");

    // Check if data already exists
    const existingDocs = await artworkCollection.limit(1).get();
    if (!existingDocs.empty) {
      res.status(400).json({
        error: "Artwork data already exists in Firestore",
        message: "Delete the collection first if you want to re-upload",
      });
      return;
    }

    const uploadPromises = artworkData.map(async (artwork) => {
      const docRef = await artworkCollection.add(artwork);
      logger.info("Artwork added with ID:", docRef.id, "- Title:", artwork.title);
      return {id: docRef.id, title: artwork.title};
    });

    const results = await Promise.all(uploadPromises);

    logger.info("All artwork uploaded successfully!");
    res.json({
      success: true,
      message: "All artwork uploaded successfully!",
      uploaded: results,
    });
  } catch (error) {
    logger.error("Error uploading artwork:", error);
    res.status(500).json({
      error: "Error uploading artwork",
      details: error.message,
    });
  }
});
