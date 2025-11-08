import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isLoggingInRef = useRef(false);

  // Admin credentials from environment variables with fallback
  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'lydiapatersonart@gmail.com';
  
  useEffect(() => {
    console.log('AuthProvider initialized - Admin email:', ADMIN_EMAIL);
    console.log('All env vars:', process.env);
    if (!process.env.REACT_APP_ADMIN_EMAIL) {
      console.warn('REACT_APP_ADMIN_EMAIL environment variable is not set, using fallback');
    }
  }, [ADMIN_EMAIL]);

  const login = async (email, password) => {
    try {
      isLoggingInRef.current = true;
      console.log('Attempting login for:', email, 'Expected admin:', ADMIN_EMAIL);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin
      if (user.email === ADMIN_EMAIL) {
        console.log('Login successful - user is admin, setting state immediately');
        // Set state immediately for smooth transition
        setCurrentUser(user);
        setIsAdmin(true);
        setLoading(false);
        isLoggingInRef.current = false;
        return { success: true, user };
      } else {
        console.log('Login failed - user is not admin:', user.email);
        // If not admin, sign them out
        await signOut(auth);
        isLoggingInRef.current = false;
        return { success: false, error: 'Unauthorized: Admin access only' };
      }
    } catch (error) {
      console.log('Login error:', error.message);
      isLoggingInRef.current = false;
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email, 'Admin email:', ADMIN_EMAIL, 'Is logging in:', isLoggingInRef.current);
      
      // Don't interfere if we're in the middle of login process
      if (isLoggingInRef.current) {
        console.log('Ignoring auth state change during login process');
        return;
      }
      
      // Handle auth state changes for logout, page refresh, etc.
      setCurrentUser(user);
      
      if (user && user.email && ADMIN_EMAIL) {
        const isUserAdmin = user.email === ADMIN_EMAIL;
        console.log('Setting isAdmin to:', isUserAdmin);
        setIsAdmin(isUserAdmin);
      } else {
        console.log('No user or missing email, setting isAdmin to false');
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [ADMIN_EMAIL]);

  const value = {
    currentUser,
    isAdmin,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
