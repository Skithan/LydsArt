import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import Header from './Header';
import Home from './Home';
import Artwork from './Artwork';
import Contact from './Contact';
import Cart from './Cart';
import ThankYou from './ThankYou';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import ArtworkForm from './ArtworkForm';
import ProtectedRoute from './ProtectedRoute';
import Footer from './Footer';
import './App.css';

const App = () => (
  <div className="animated-bg">
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/artwork" element={<Artwork />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/success" element={<ThankYou />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/artwork/new" element={
              <ProtectedRoute>
                <ArtworkForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/artwork/edit/:artworkId" element={
              <ProtectedRoute>
                <ArtworkForm />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  </div>
);

export default App;