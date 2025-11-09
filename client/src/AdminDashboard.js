import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, orderBy, query, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import './App.css';

const AdminDashboard = () => {
  const [artwork, setArtwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  console.log('AdminDashboard render - isAdmin:', isAdmin, 'loading:', loading, 'isVisible:', isVisible, 'currentUser:', currentUser?.email);

  // Fly-in animation effect - trigger immediately on mount
  useEffect(() => {
    console.log('AdminDashboard mounted - setting isVisible to true');
    setIsVisible(true);
  }, []);

  // Track isVisible state changes
  useEffect(() => {
    console.log('AdminDashboard isVisible changed to:', isVisible);
  }, [isVisible]);

  // Track isAdmin state changes
  useEffect(() => {
    console.log('AdminDashboard isAdmin changed to:', isAdmin);
  }, [isAdmin]);

  // Track loading state changes
  useEffect(() => {
    console.log('AdminDashboard loading changed to:', loading);
  }, [loading]);

  // Fetch artwork data
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const artworkQuery = query(collection(db, 'artwork'), orderBy('title'));
        const querySnapshot = await getDocs(artworkQuery);
        
        const artworkData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Convert database URLs to Firebase Storage URLs (same logic as Artwork.js)
          let processedImageUrl = null;
          if (data.imageUrl) {
            if (data.imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
              // Already a Firebase Storage HTTP URL - use as-is
              processedImageUrl = data.imageUrl;
              console.log(`🔥 Admin Firebase Storage HTTP URL: "${data.imageUrl}"`);
            } else if (data.imageUrl.startsWith('gs://')) {
              // Google Cloud Storage URL - convert to HTTP Firebase Storage URL
              const gsUrl = data.imageUrl.replace('gs://', '');
              const [bucket, ...pathParts] = gsUrl.split('/');
              const encodedPath = pathParts.join('/').replace(/\//g, '%2F');
              processedImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
              console.log(`🔥 Admin GS URL converted: "${data.imageUrl}" → "${processedImageUrl}"`);
            } else if (data.imageUrl.startsWith('/') && data.imageUrl.includes('.jpeg')) {
              // Database URL like "/AnUptownPerspective2.jpeg" - convert to Firebase Storage
              const fileName = data.imageUrl.substring(1); // Remove leading slash
              const gsUrl = `gs://lydsart-f6966.firebasestorage.app/artwork/${fileName}`;
              // Convert to HTTP Firebase Storage URL
              const encodedPath = `artwork%2F${fileName}`;
              processedImageUrl = `https://firebasestorage.googleapis.com/v0/b/lydsart-f6966.firebasestorage.app/o/${encodedPath}?alt=media`;
              console.log(`🔥 Admin Database URL converted: "${data.imageUrl}" → GS: "${gsUrl}" → HTTP: "${processedImageUrl}"`);
            } else {
              // Unknown format - use as-is and log
              processedImageUrl = data.imageUrl;
              console.log(`❓ Admin Unknown URL format: "${data.imageUrl}"`);
            }
          }

          return {
            id: doc.id,
            ...data,
            imageUrl: processedImageUrl // Use the processed URL
          };
        });
        
        setArtwork(artworkData);
      } catch (err) {
        console.error('Error fetching artwork:', err);
        setError('Failed to load artwork data.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchArtwork();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAddNew = () => {
    navigate('/admin/artwork/new');
  };

  const handleEdit = (artworkId) => {
    navigate(`/admin/artwork/edit/${artworkId}`);
  };

  const handleDeleteConfirm = (artworkId) => {
    console.log('🚨 Delete confirmation requested for artwork:', artworkId);
    alert('Confirmation modal opening for: ' + artworkId); // Temporary alert
    setShowDeleteConfirm(artworkId);
  };

  const handleDelete = async (artworkId) => {
    try {
      console.clear(); // Clear console for easier debugging
      console.log('�🚨🚨 HANDLEDELETE CALLED AT:', new Date().toLocaleTimeString());
      console.log('�🗑️ Starting deletion process for artwork:', artworkId);
      console.log('🔍 handleDelete function called with ID type:', typeof artworkId);
      alert('Delete function called! Check console for details.'); // Temporary alert
      
      // First, get the artwork data to find the image URL
      const artworkRef = doc(db, 'artwork', artworkId);
      const artworkSnap = await getDoc(artworkRef);
      
      if (artworkSnap.exists()) {
        const artworkData = artworkSnap.data();
        console.log('Artwork data retrieved:', artworkData);
        
        // Delete the image from Firebase Storage if it exists
        if (artworkData.imageUrl) {
          try {
            const imageUrl = artworkData.imageUrl;
            console.log('🖼️ Image URL found:', imageUrl);
            
            // Try multiple URL parsing methods for different Firebase Storage formats
            let storagePath = null;
            
            // Method 1: Standard Firebase Storage URLs with /o/ pattern
            const standardMatch = imageUrl.match(/\/o\/([^?]+)/);
            if (standardMatch) {
              storagePath = decodeURIComponent(standardMatch[1]);
              console.log('📁 Extracted path (standard format):', storagePath);
            }
            
            // Method 2: Alternative format with firebasestorage.app domain
            if (!storagePath) {
              const altMatch = imageUrl.match(/firebasestorage\.app\/v0\/b\/[^/]+\/o\/([^?]+)/);
              if (altMatch) {
                storagePath = decodeURIComponent(altMatch[1]);
                console.log('📁 Extracted path (alt format):', storagePath);
              }
            }
            
            // Method 3: Direct path extraction from URL structure
            if (!storagePath && imageUrl.includes('artwork/')) {
              const pathStart = imageUrl.indexOf('artwork/');
              const pathEnd = imageUrl.indexOf('?') > -1 ? imageUrl.indexOf('?') : imageUrl.length;
              if (pathStart > -1) {
                storagePath = imageUrl.substring(pathStart, pathEnd);
                console.log('📁 Extracted path (direct method):', storagePath);
              }
            }
            
            if (storagePath) {
              console.log('🗑️ Attempting to delete from storage path:', storagePath);
              const imageRef = ref(storage, storagePath);
              await deleteObject(imageRef);
              console.log('✅ Image deleted from storage successfully');
            } else {
              console.warn('⚠️ Could not extract storage path from URL:', imageUrl);
              console.warn('🔍 URL analysis - includes artwork/:', imageUrl.includes('artwork/'));
              console.warn('🔍 URL parts:', imageUrl.split('/'));
            }
          } catch (storageError) {
            console.error('❌ Error deleting image from storage:', storageError);
            console.error('🔧 Storage error details:', {
              code: storageError.code,
              message: storageError.message
            });
            // Continue with database deletion even if storage deletion fails
          }
        } else {
          console.log('📷 No image URL found in artwork data');
        }
      }
      
      // Delete the document from Firestore
      await deleteDoc(artworkRef);
      console.log('Artwork deleted from database successfully');
      
      // Update the local state
      setArtwork(prev => prev.filter(item => item.id !== artworkId));
      setShowDeleteConfirm(null);
      
    } catch (err) {
      console.error('Error deleting artwork:', err);
      setError('Failed to delete artwork.');
    }
  };

  const closeDeleteConfirm = () => {
    console.log('❌ Delete confirmation cancelled');
    setShowDeleteConfirm(null);
  };

  if (loading) {
    console.log('AdminDashboard showing loading state');
    return (
      <div className="loading-container">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  console.log('AdminDashboard rendering main content - isVisible:', isVisible, 'opacity:', isVisible ? 1 : 0);

  return (
    <div className="admin-dashboard-container">
      <div 
        className={`admin-dashboard ${isVisible ? 'fly-in-visible' : ''}`}
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {currentUser?.email}</p>
          </div>
          <div className="admin-header-right">
            <button className="admin-button secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="admin-actions">
          <button className="admin-button primary" onClick={handleAddNew}>
            Add New Artwork
          </button>
        </div>

        <div className="artwork-grid">
          {artwork.length === 0 ? (
            <div className="no-artwork">
              <p>No artwork found. Add some artwork to get started.</p>
            </div>
          ) : (
            artwork.map((piece) => (
              <div key={piece.id} className="artwork-card-admin">
                <div className="artwork-image-container">
                  <img 
                    src={piece.imageUrl || '/placeholder.jpg'} 
                    alt={piece.title}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="artwork-info">
                  <h3>{piece.title}</h3>
                  <p className="artwork-price">${piece.price}</p>
                  <p className="artwork-medium">{piece.medium}</p>
                  <p className="artwork-dimensions">{piece.dimensions}</p>
                  <p className="artwork-status">
                    Status: {piece.available ? 'Available' : 'Reserved'}
                  </p>
                </div>
                <div className="artwork-actions">
                  <button 
                    className="admin-button edit"
                    onClick={() => handleEdit(piece.id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="admin-button delete"
                    onClick={() => handleDeleteConfirm(piece.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this artwork? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="admin-button secondary"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>
              <button 
                className="admin-button delete"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
