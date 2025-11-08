import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import './App.css';

const ArtworkForm = () => {
  const { artworkId } = useParams();
  const isEditing = Boolean(artworkId);
  
  const [formData, setFormData] = useState({
    title: '',
    medium: '',
    dimensions: '',
    price: '',
    description: '',
    available: true,
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const { isAdmin, currentUser } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

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

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load artwork data if editing
  useEffect(() => {
    const loadArtwork = async () => {
      if (isEditing && artworkId) {
        try {
          const docRef = doc(db, 'artwork', artworkId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              title: data.title || '',
              medium: data.medium || '',
              dimensions: data.dimensions || '',
              price: data.price || '',
              description: data.description || '',
              available: data.available !== false, // Default to true if not set
            });
            setCurrentImageUrl(data.imageUrl || '');
          } else {
            setError('Artwork not found.');
          }
        } catch (err) {
          console.error('Error loading artwork:', err);
          setError('Failed to load artwork data.');
        }
      }
    };

    if (isAdmin) {
      loadArtwork();
    }
  }, [isEditing, artworkId, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(''); // Clear error when user types
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      // Validate file size (20MB limit for high-quality artwork)
      if (file.size > 20 * 1024 * 1024) {
        setError('Image file must be less than 20MB.');
        return;
      }
      
      setImageFile(file);
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return currentImageUrl;
    
    try {
      console.log('Starting image upload...');
      console.log('File details:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });
      
      // Create filename from artwork title (sanitized for file system)
      let sanitizedTitle = formData.title
        ? formData.title
            .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
            .replace(/_+/g, '_') // Replace multiple underscores with single
            .replace(/^_|_$/g, '') // Remove leading/trailing underscores
            .toLowerCase()
        : `untitled_${Date.now()}`; // Fallback if no title
      
      // Ensure we have a valid filename
      if (!sanitizedTitle || sanitizedTitle === '') {
        sanitizedTitle = `artwork_${Date.now()}`;
      }
      
      // Get file extension from original file
      const fileExtension = imageFile.name.split('.').pop();
      
      // Create a reference to the image in Firebase Storage using title as filename
      const imagePath = `artwork/${sanitizedTitle}.${fileExtension}`;
      console.log('Upload path:', imagePath);
      
      const imageRef = ref(storage, imagePath);
      console.log('Storage reference created');
      
      // Upload the file
      console.log('Starting upload to Firebase Storage...');
      const uploadResult = await uploadBytes(imageRef, imageFile);
      console.log('Upload successful:', uploadResult);
      
      // Get the download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL obtained:', downloadURL);
      
      return downloadURL;
    } catch (err) {
      console.error('Error uploading image:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);
      throw new Error(`Failed to upload image: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Form submission started');
      console.log('Is admin:', isAdmin);
      console.log('Current user:', currentUser);
      
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Please enter a title for the artwork.');
      }
      
      // Upload image if there's a new one
      const imageUrl = await uploadImage();
      console.log('Image upload completed, URL:', imageUrl);
      
      // Generate slug from title
      const generateSlug = (title) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      };

      // Prepare artwork data in the specified format
      const currentTimestamp = new Date();
      const currentYear = currentTimestamp.getFullYear().toString();
      
      const artworkData = {
        title: formData.title.trim(),
        medium: formData.medium.trim(),
        size: formData.dimensions.trim(), // Using 'size' instead of 'dimensions'
        price: formData.price ? parseFloat(formData.price) : null, // null if no price
        imageUrl: imageUrl || null,
        date: currentYear, // Current year as string
        slug: generateSlug(formData.title),
        sold: !formData.available, // Convert 'available' to 'sold' (inverted)
        updatedAt: currentTimestamp,
      };

      // Add description if provided
      if (formData.description && formData.description.trim()) {
        artworkData.description = formData.description.trim();
      }

      if (isEditing) {
        // Update existing artwork (don't change createdAt)
        const docRef = doc(db, 'artwork', artworkId);
        await updateDoc(docRef, artworkData);
        console.log('✅ Artwork updated with new format:', artworkData);
      } else {
        // Add new artwork
        artworkData.createdAt = currentTimestamp;
        await addDoc(collection(db, 'artwork'), artworkData);
        console.log('✅ New artwork created with format:', artworkData);
      }

      // Navigate back to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error saving artwork:', err);
      setError(err.message || 'Failed to save artwork.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };



  return (
    <div className="artwork-form-container">
      <div 
        ref={formRef}
        className={`artwork-form ${isVisible ? 'fly-in-visible' : ''}`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div className="form-header">
          <h1>{isEditing ? 'Edit Artwork' : 'Add New Artwork'}</h1>
          <p>Fill in the artwork details below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter artwork title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="medium">Medium *</label>
              <input
                type="text"
                id="medium"
                name="medium"
                value={formData.medium}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="e.g., Oil on canvas"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dimensions">Dimensions *</label>
              <input
                type="text"
                id="dimensions"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="e.g., 24&quot; x 36&quot;"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={loading}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                Available for purchase
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows="4"
              placeholder="Enter artwork description (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">
              {isEditing ? 'Update Image (optional)' : 'Image *'}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              required={!isEditing && !currentImageUrl}
            />
            {currentImageUrl && (
              <div className="current-image">
                <p>Current image:</p>
                <img 
                  src={currentImageUrl} 
                  alt="Current artwork" 
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button"
              className="admin-button secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-button primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Artwork' : 'Add Artwork')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtworkForm;
