// Firebase Firestore data upload script
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKo9lccSbOpIUopEaIipxAXKE70frynPo",
  authDomain: "lydsart-f6966.firebaseapp.com",
  projectId: "lydsart-f6966",
  storageBucket: "lydsart-f6966.firebasestorage.app",
  messagingSenderId: "899561262220",
  appId: "1:899561262220:web:2d3c87bb5edc6a356e7fa9",
  measurementId: "G-JLP938KMS4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Converted artwork data for Firestore
const artworkData = [
  {
    title: "An Uptown Perspective",
    medium: "Acrylic on Canvas", 
    size: "18\"x24\"",
    date: "2025",
    price: null, // null instead of "N/A"
    sold: true,
    imageUrl: "/AnUptownPerspective2.jpeg",
    slug: "an-uptown-perspective", // URL-friendly identifier
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Comfort In Change",
    medium: "Oil on Canvas",
    size: "24\"x30\"", 
    date: "2024",
    price: 450, // Convert to number for easier querying
    priceDisplay: "$450", // Keep formatted string for display
    sold: false,
    imageUrl: "/ComfortInChange.jpeg",
    slug: "comfort-in-change",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Simon And Garfunkel Kids",
    medium: "Acrylic on Canvas",
    size: null, // null instead of "N/A"
    date: "2024",
    price: null,
    sold: true,
    imageUrl: "/SimonAndGarfunkelKids.jpeg",
    slug: "simon-and-garfunkel-kids",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Function to upload artwork to Firestore
async function uploadArtwork() {
  try {
    const artworkCollection = collection(db, 'artwork');
    
    for (const artwork of artworkData) {
      const docRef = await addDoc(artworkCollection, artwork);
      console.log('Artwork added with ID:', docRef.id);
    }
    
    console.log('All artwork uploaded successfully!');
  } catch (error) {
    console.error('Error uploading artwork:', error);
  }
}

// Run the upload
uploadArtwork();
