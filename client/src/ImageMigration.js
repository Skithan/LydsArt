import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const ImageMigration = () => {
  const [migrationStatus, setMigrationStatus] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState([]);

  // List of images to migrate (from your public folder)
  const imagesToMigrate = [
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

  const fetchImageAsBlob = async (imagePath) => {
    try {
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${imagePath}`);
      }
      return await response.blob();
    } catch (error) {
      console.error(`Error fetching ${imagePath}:`, error);
      throw error;
    }
  };

  const migrateImages = async () => {
    setIsRunning(true);
    setProgress([]);
    setMigrationStatus('Starting migration...');

    try {
      // Get all artwork documents
      const artworkRef = collection(db, 'artwork');
      const snapshot = await getDocs(artworkRef);
      
      const progressLog = [];
      progressLog.push(`Found ${snapshot.docs.length} artwork documents`);
      setProgress([...progressLog]);
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        
        progressLog.push(`\nProcessing: ${data.title || docId}`);
        progressLog.push(`Current imageUrl: ${data.imageUrl}`);
        setProgress([...progressLog]);
        
        // Check if imageUrl is a local path
        if (data.imageUrl && (data.imageUrl.startsWith('/') || !data.imageUrl.startsWith('http'))) {
          const imageName = data.imageUrl.replace('/', '');
          
          if (imagesToMigrate.includes(imageName)) {
            progressLog.push(`Uploading ${imageName} to Firebase Storage...`);
            setProgress([...progressLog]);
            
            try {
              // Fetch image from public folder
              const imageBlob = await fetchImageAsBlob(`/${imageName}`);
              
              // Create Firebase Storage reference
              const storageRef = ref(storage, `artwork/${imageName}`);
              
              // Upload to Firebase Storage
              const uploadResult = await uploadBytes(storageRef, imageBlob);
              
              // Get download URL
              const downloadURL = await getDownloadURL(uploadResult.ref);
              
              progressLog.push(`✅ Uploaded: ${imageName}`);
              setProgress([...progressLog]);
              
              // Update Firestore document
              await updateDoc(doc(db, 'artwork', docId), {
                imageUrl: downloadURL,
                migratedAt: new Date(),
                originalImagePath: data.imageUrl // Keep track of original path
              });
              
              progressLog.push(`✅ Updated database record for ${data.title || docId}`);
              setProgress([...progressLog]);
              
            } catch (error) {
              progressLog.push(`❌ Error with ${imageName}: ${error.message}`);
              setProgress([...progressLog]);
            }
          } else {
            progressLog.push(`⚠️ Image ${imageName} not in migration list`);
            setProgress([...progressLog]);
          }
        } else {
          progressLog.push(`ℹ️ Already using Firebase Storage or external URL`);
          setProgress([...progressLog]);
        }
      }
      
      setMigrationStatus('Migration completed successfully!');
      
    } catch (error) {
      setMigrationStatus(`Migration failed: ${error.message}`);
      console.error('Migration error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '2rem', 
      borderRadius: '8px', 
      marginTop: '2rem',
      border: '1px solid #e0e0e0'
    }}>
      <h2>Image Migration Tool</h2>
      <p>This will migrate all public folder images to Firebase Storage and update database records.</p>
      
      <button 
        onClick={migrateImages}
        disabled={isRunning}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: isRunning ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          fontSize: '1rem'
        }}
      >
        {isRunning ? 'Migration Running...' : 'Start Migration'}
      </button>
      
      {migrationStatus && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: migrationStatus.includes('failed') ? '#ffebee' : '#e8f5e8',
          color: migrationStatus.includes('failed') ? '#c62828' : '#2e7d32',
          borderRadius: '4px'
        }}>
          {migrationStatus}
        </div>
      )}
      
      {progress.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h4>Progress Log:</h4>
          <pre style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
            {progress.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ImageMigration;
