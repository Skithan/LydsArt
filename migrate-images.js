const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase config (you'll need to add your config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// Public images directory
const publicImagesDir = path.join(__dirname, 'client/public');

// List of image files to migrate
const imageFiles = [
  'AnUptownPerspective2.jpeg',
  'BlueFrog.jpeg',
  'ComfortInChange.jpeg',
  'EndOfSummerFlowers.jpeg',
  'FalseLight.jpeg',
  'FamiliarFaces.jpeg',
  'HabitualRoutines1.jpeg',
  'HabitualRoutines2.jpeg',
  'Headshot.jpeg',
  'KingSquareAtNight.jpeg',
  'NoDogsOnTheCouch.jpeg',
  'SharingATemporaryHome.jpeg',
  'SimonAndGarfunkelKids.jpeg',
  'YellowFrog.jpeg'
];

async function migrateImages() {
  console.log('🚀 Starting image migration to Firebase Storage...');
  
  try {
    // Get all artwork documents
    const artworkRef = collection(db, 'artwork');
    const snapshot = await getDocs(artworkRef);
    
    console.log(`📄 Found ${snapshot.docs.length} artwork documents`);
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      
      console.log(`\n🔍 Processing document: ${docId}`);
      console.log(`📸 Current imageUrl: ${data.imageUrl}`);
      
      // Check if imageUrl is a local path (starts with / or is a filename)
      if (data.imageUrl && (data.imageUrl.startsWith('/') || !data.imageUrl.startsWith('http'))) {
        const imageName = data.imageUrl.replace('/', '');
        
        if (imageFiles.includes(imageName)) {
          console.log(`⬆️  Uploading ${imageName} to Firebase Storage...`);
          
          try {
            // Read the image file
            const imagePath = path.join(publicImagesDir, imageName);
            const imageBuffer = fs.readFileSync(imagePath);
            
            // Create Firebase Storage reference
            const storageRef = ref(storage, `artwork/${imageName}`);
            
            // Upload to Firebase Storage
            const uploadResult = await uploadBytes(storageRef, imageBuffer);
            
            // Get download URL
            const downloadURL = await getDownloadURL(uploadResult.ref);
            
            console.log(`✅ Uploaded successfully: ${downloadURL}`);
            
            // Update Firestore document
            await updateDoc(doc(db, 'artwork', docId), {
              imageUrl: downloadURL,
              migratedAt: new Date()
            });
            
            console.log(`✅ Updated document ${docId} with new URL`);
            
          } catch (error) {
            console.error(`❌ Error uploading ${imageName}:`, error);
          }
        } else {
          console.log(`⚠️  Image ${imageName} not found in public folder`);
        }
      } else {
        console.log(`ℹ️  Skipping - already using Firebase Storage or external URL`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateImages();
