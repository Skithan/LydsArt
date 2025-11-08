import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './App.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);



  // Redirect if already admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-form">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Loading...</h2>
            <p>Checking authentication status...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div 
        ref={formRef}
        className="admin-login-form"
        style={{
          transform: 'translateY(0)',
          opacity: 1,
          transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div className="admin-login-header">
          <h1>Admin Portal</h1>
          <p>Please enter your credentials to verify admin access</p>
          <small style={{color: '#999', fontSize: '0.8rem'}}>Debug: AdminLogin component loaded</small>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="admin-login-button"
          >
            {loading ? 'Signing In...' : 'Access Admin Panel'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Enter your email and password to access admin features</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
