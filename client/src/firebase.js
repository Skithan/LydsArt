// Firebase configuration for LydsArt
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCKo9lccSbOpIUopEaIipxAXKE70frynPo",
  authDomain: "lydsart-f6966.firebaseapp.com",
  projectId: "lydsart-f6966",
  storageBucket: "lydsart-f6966.appspot.com",
  messagingSenderId: "899561262220",
  appId: "1:899561262220:web:2d3c87bb5edc6a356e7fa9",
  measurementId: "G-JLP938KMS4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage (for future image uploads)
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
