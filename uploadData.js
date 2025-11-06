// Upload artwork data to Firestore
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'lydsart-f6966'
  });
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Function to upload artwork to Firestore
async function uploadArtwork() {
  try {
    const artworkCollection = db.collection('artwork');
    
    for (const artwork of artworkData) {
      const docRef = await artworkCollection.add(artwork);
      console.log('Artwork added with ID:', docRef.id, '- Title:', artwork.title);
    }
    
    console.log('All artwork uploaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error uploading artwork:', error);
    process.exit(1);
  }
}

// Run the upload
uploadArtwork();
