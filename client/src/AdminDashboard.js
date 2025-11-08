import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import ImageMigration from './ImageMigration';
import './App.css';

const AdminDashboard = () => {
  const [artwork, setArtwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showMigration, setShowMigration] = useState(false);
  
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
        
        const artworkData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
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
    setShowDeleteConfirm(artworkId);
  };

  const handleDelete = async (artworkId) => {
    try {
      await deleteDoc(doc(db, 'artwork', artworkId));
      setArtwork(prev => prev.filter(item => item.id !== artworkId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting artwork:', err);
      setError('Failed to delete artwork.');
    }
  };

  const closeDeleteConfirm = () => {
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
          <button 
            className="admin-button secondary" 
            onClick={() => setShowMigration(!showMigration)}
          >
            {showMigration ? 'Hide' : 'Show'} Image Migration Tool
          </button>
        </div>

        {showMigration && <ImageMigration />}

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
