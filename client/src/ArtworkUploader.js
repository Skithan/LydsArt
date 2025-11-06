// Component to upload artwork data to Firestore
import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Your artwork data converted to Firestore format
const artworkData = [
  {
    title: "An Uptown Perspective",
    medium: "Acrylic on Canvas", 
    size: "18\"x24\"",
    date: "2025",
    price: null,
    sold: true,
    imageUrl: "/AnUptownPerspective2.jpeg",
    slug: "an-uptown-perspective"
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
    slug: "comfort-in-change"
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
    slug: "end-of-summer-flowers"
  },
  {
    title: "False Light",
    medium: "Acrylic on Canvas",
    size: "18\"x24\"", 
    date: "2025",
    price: null,
    sold: true,
    imageUrl: "/FalseLight.jpeg",
    slug: "false-light"
  },
  {
    title: "Familiar Faces",
    medium: "Acrylic on Canvas",
    size: "18\"x24\"", 
    date: "2025",
    price: null,
    sold: true,
    imageUrl: "/FamiliarFaces.jpeg",
    slug: "familiar-faces"
  },
  {
    title: "King Square At Night",
    medium: "Oil on Canvas",
    size: "18\"x24\"", 
    date: "2022",
    price: null,
    sold: true,
    imageUrl: "/KingSquareAtNight.jpeg",
    slug: "king-square-at-night"
  },
  {
    title: "No Dogs On The Couch",
    medium: "Oil on Canvas",
    size: "18\"x24\"", 
    date: "2022",
    price: null,
    sold: true,
    imageUrl: "/NoDogsOnTheCouch.jpeg",
    slug: "no-dogs-on-the-couch"
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
    slug: "sharing-a-temporary-home"
  },
  {
    title: "Simon And Garfunkel Kids",
    medium: "Acrylic on Canvas",
    size: null,
    date: "2024",
    price: null,
    sold: true,
    imageUrl: "/SimonAndGarfunkelKids.jpeg",
    slug: "simon-and-garfunkel-kids"
  },
  {
    title: "Yellow Frog",
    medium: "Oil on Canvas",
    size: "24\"x30\"", 
    date: "2024",
    price: null,
    sold: true,
    imageUrl: "/YellowFrog.jpeg",
    slug: "yellow-frog"
  },
  {
    title: "Blue Frog",
    medium: "Oil on Canvas",
    size: "24\"x30\"", 
    date: "2024",
    price: null,
    sold: true,
    imageUrl: "/BlueFrog.jpeg",
    slug: "blue-frog"
  }
];

const ArtworkUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);

  const uploadArtwork = async () => {
    setUploading(true);
    setUploadStatus('Starting upload...');
    setUploadedCount(0);

    try {
      const artworkCollection = collection(db, 'artwork');
      
      for (let i = 0; i < artworkData.length; i++) {
        const artwork = {
          ...artworkData[i],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(artworkCollection, artwork);
        setUploadedCount(i + 1);
        setUploadStatus(`Uploaded: ${artwork.title} (${i + 1}/${artworkData.length})`);
        console.log('Artwork added with ID:', docRef.id);
      }
      
      setUploadStatus(`✅ Successfully uploaded all ${artworkData.length} artworks!`);
    } catch (error) {
      console.error('Error uploading artwork:', error);
      setUploadStatus(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '2rem auto',
      background: '#f5f5f5',
      borderRadius: '1rem',
      textAlign: 'center'
    }}>
      <h2>🎨 Artwork Data Uploader</h2>
      <p>Upload your artwork collection to Firestore database.</p>
      
      <div style={{ margin: '2rem 0' }}>
        <strong>Ready to upload: {artworkData.length} artworks</strong>
      </div>

      <button
        onClick={uploadArtwork}
        disabled={uploading}
        style={{
          background: uploading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '0.5rem',
          fontSize: '1.1rem',
          cursor: uploading ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {uploading ? 'Uploading...' : '🚀 Upload Artwork to Firestore'}
      </button>

      {uploadStatus && (
        <div style={{
          padding: '1rem',
          background: uploadStatus.includes('✅') ? '#d4edda' : 
                     uploadStatus.includes('❌') ? '#f8d7da' : '#fff3cd',
          border: '1px solid',
          borderColor: uploadStatus.includes('✅') ? '#c3e6cb' : 
                      uploadStatus.includes('❌') ? '#f5c6cb' : '#ffeaa7',
          borderRadius: '0.5rem',
          marginTop: '1rem'
        }}>
          {uploadStatus}
          {uploading && (
            <div style={{ marginTop: '0.5rem' }}>
              Progress: {uploadedCount}/{artworkData.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtworkUploader;
