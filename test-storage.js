const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyCKo9lccSbOpIUopEaIipxAXKE70frynPo",
  authDomain: "lydsart-f6966.firebaseapp.com",
  projectId: "lydsart-f6966",
  storageBucket: "lydsart-f6966.appspot.com",
  messagingSenderId: "899561262220",
  appId: "1:899561262220:web:2d3c87bb5edc6a356e7fa9",
  measurementId: "G-JLP938KMS4"
};

async function testStorage() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('Storage instance:', storage);
    console.log('Bucket:', storage.bucket);
    console.log('App name:', storage.app.name);
    
    // Test creating a reference
    console.log('Creating storage reference...');
    const testRef = ref(storage, 'test/connection.txt');
    console.log('Reference created:', testRef.toString());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testStorage();
