import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

const AdminDashboard = () => {
  const [artwork, setArtwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  // Fly-in animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (dashboardRef.current) {
      observer.observe(dashboardRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    return (
      <div className="loading-container">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div 
        ref={dashboardRef}
        className={`admin-dashboard ${isVisible ? 'fly-in-visible' : ''}`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
