import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useCart } from './CartContext';
import './App.css';

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
console.log('Stripe Public Key:', stripePublicKey);
console.log('Environment variables:', process.env);

if (!stripePublicKey) {
  console.error('REACT_APP_STRIPE_PUBLIC_KEY is not set in environment variables');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

// Helper function to convert image URLs to Firebase Storage URLs (same logic as Artwork.js)
const convertToFirebaseStorageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
    // Already a Firebase Storage HTTP URL - use as-is
    console.log(`🛒 Cart Firebase Storage HTTP URL: "${imageUrl}"`);
    return imageUrl;
  } else if (imageUrl.startsWith('gs://')) {
    // Google Cloud Storage URL - convert to HTTP Firebase Storage URL
    const gsUrl = imageUrl.replace('gs://', '');
    const [bucket, ...pathParts] = gsUrl.split('/');
    const encodedPath = pathParts.join('/').replace(/\//g, '%2F');
    const convertedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    console.log(`🛒 Cart GS URL converted: "${imageUrl}" → "${convertedUrl}"`);
    return convertedUrl;
  } else if (imageUrl.startsWith('/') && imageUrl.includes('.jpeg')) {
    // Database URL like "/AnUptownPerspective2.jpeg" - convert to Firebase Storage
    const fileName = imageUrl.substring(1); // Remove leading slash
    // Convert to HTTP Firebase Storage URL
    const encodedPath = `artwork%2F${fileName}`;
    const convertedUrl = `https://firebasestorage.googleapis.com/v0/b/lydsart-f6966.firebasestorage.app/o/${encodedPath}?alt=media`;
    console.log(`🛒 Cart Database URL converted: "${imageUrl}" → "${convertedUrl}"`);
    return convertedUrl;
  } else {
    // Unknown format - use as-is
    console.log(`🛒 Cart Unknown URL format: "${imageUrl}"`);
    return imageUrl;
  }
};

const Cart = () => {
  const navigate = useNavigate();
  const { items, totalPrice, itemCount, isEmpty, removeItem, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState(null);
  
  // Animation state
  const [containerVisible, setContainerVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  
  // Animation refs
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cartRef = useRef(null);
  const formRef = useRef(null);

  // Animation effect - similar to homepage
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fully enters view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === containerRef.current) {
            setContainerVisible(true);
          } else if (entry.target === titleRef.current) {
            setTitleVisible(true);
          } else if (entry.target === cartRef.current) {
            setCartVisible(true);
          } else if (entry.target === formRef.current) {
            setFormVisible(true);
          }
        }
      });
    }, observerOptions);

    // Capture current ref values for cleanup
    const currentContainerRef = containerRef.current;
    const currentTitleRef = titleRef.current;
    const currentCartRef = cartRef.current;
    const currentFormRef = formRef.current;

    // Start observing elements
    if (currentContainerRef) observer.observe(currentContainerRef);
    if (currentTitleRef) observer.observe(currentTitleRef);
    if (currentCartRef) observer.observe(currentCartRef);
    if (currentFormRef) observer.observe(currentFormRef);

    return () => {
      if (currentContainerRef) observer.unobserve(currentContainerRef);
      if (currentTitleRef) observer.unobserve(currentTitleRef);
      if (currentCartRef) observer.unobserve(currentCartRef);
      if (currentFormRef) observer.unobserve(currentFormRef);
    };
  }, []);

  // Process the payment when "Pay & Reserve" is clicked
  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Check if cart is empty
    if (isEmpty) {
      setError('Your cart is empty. Please add items before checkout.');
      return;
    }

    // Check if any items are sold
    const soldItems = items.filter(item => item.sold);
    if (soldItems.length > 0) {
      setError(`Some items in your cart have been sold: ${soldItems.map(item => item.title).join(', ')}. Please remove them before checkout.`);
      return;
    }
    
    // Get form data
    const email = e.target.email.value.trim();
    const name = e.target.name.value.trim();
    
    // Simple email validation
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    // Prepare payment data for multiple items
    const line_items = items.map(item => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: `${item.title}${item.size ? ` (${item.size})` : ''}${item.medium ? ` - ${item.medium}` : ''}`,
        },
        unit_amount: parseInt(item.price.replace(/[^\d]/g, '')) * 100
      },
      quantity: item.quantity,
    }));

    // Send artwork IDs separately for the Firebase Function
    const artworkIds = items.map(item => item.id);

    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call your Firebase Function to create a checkout session
      const checkoutUrl = process.env.REACT_APP_CREATE_CHECKOUT_URL || 'https://createcheckoutsession-pdcnged4ca-uc.a.run.app';
      console.log('🔥 UPDATED CODE - sending request to Firebase Function : createCheckoutSession');
      console.log('🔗 Using URL:', checkoutUrl);
      console.log('📦 Environment URL:', process.env.REACT_APP_CREATE_CHECKOUT_URL);
      console.log('🌍 All React env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
      console.log('⚡ Cache buster:', Date.now());
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          line_items: line_items, 
          customer_email: email,
          customer_name: name,
          artwork_ids: artworkIds
        }),
      });
      
      const data = await response.json();
      console.log('Response from server:', data);
      
      if (data.error) {
        setError(`Payment Error: ${data.error}`);
        setIsProcessing(false);
        return;
      }
      
      if (data.clientSecret) {
        // For embedded checkout
        setClientSecret(data.clientSecret);
      } else if (data.url) {
        // For hosted checkout (redirect)
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Payment request error:', err);
      setError(`Network Error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // Handle when checkout is complete
  const handleCheckoutComplete = () => {
    console.log('🎉 handleCheckoutComplete called - payment successful!');
    setPaymentCompleted(true);
    setIsProcessing(false);
    
    // Clear the cart after successful payment
    console.log('🛒 Clearing cart after successful payment...');
    clearCart();
    console.log('✅ Cart cleared successfully');
    
    // Optional: Show success message or redirect
    setTimeout(() => {
      console.log('🔄 Redirecting to success page...');
      navigate('/success');
    }, 2000);
  };

  return (
    <div style={{ 
      height: '100vh', 
      overflowY: 'auto', 
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      padding: '2rem 0'
    }}>
      <section 
        ref={containerRef}
        id="cart" 
        className="cart-section" 
        style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          minHeight: '150vh',
          justifyContent: 'flex-start', 
          background: '#ffffffdd', 
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)', 
          borderRadius: '1.2rem', 
          margin: '2rem auto 4rem auto', 
          maxWidth: '520px', 
          padding: '2.5rem 2rem', 
          fontFamily: 'Playfair Display, Inter, Segoe UI, Arial, serif', 
          color: '#333333', 
          letterSpacing: '2px',
          transform: containerVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: containerVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
      <div 
        ref={titleRef}
        style={{
          transform: titleVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: titleVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: '2.2rem', marginBottom: '1.5rem', color: '#333333', textShadow: '0 2px 12px rgba(0, 0, 0, 0.1), 0 1px 0 #ffffff' }}>
          Shopping Cart
        </h2>
      </div>
      
      <div 
        ref={cartRef}
        style={{
          transform: cartVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: cartVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          width: '100%',
          maxWidth: '500px'
        }}
      >
        {isEmpty ? (
          <div style={{
            background: '#f5f5f5',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
            margin: '0 auto'
          }}>
            <h3 style={{ color: '#666666', marginBottom: '1rem' }}>Your Cart is Empty</h3>
            <p style={{ color: '#888888', fontSize: '1.1rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Browse our artwork collection and add pieces you'd like to reserve.
            </p>
            <button 
              onClick={() => navigate('/artwork')}
              style={{
                padding: '0.7rem 1.5rem',
                background: '#666666',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Browse Artwork
            </button>
          </div>
        ) : (
        <>
          {/* Cart Items */}
          <div style={{ width: '100%', maxWidth: '500px', marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #eee'
            }}>
              <h3 style={{ color: '#333333', fontWeight: 600, fontSize: '1.2rem', margin: 0 }}>
                {itemCount} Item{itemCount !== 1 ? 's' : ''}
              </h3>
              <button 
                onClick={clearCart}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'transparent',
                  color: '#c62828',
                  border: '1px solid #c62828',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Clear Cart
              </button>
            </div>

            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} style={{ 
                background: '#ffffffdd', 
                borderRadius: '1rem', 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                padding: '1.2rem', 
                marginBottom: '1rem',
                border: item.sold ? '2px solid #c62828' : '1px solid #eee'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {item.imgs && item.imgs.length > 0 && (
                    <img 
                      src={convertToFirebaseStorageUrl(item.imgs[0])} 
                      alt={item.title} 
                      onError={(e) => {
                        console.log(`❌ Cart image failed to load: "${item.imgs[0]}" for "${item.title}"`);
                        e.target.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)';
                        e.target.style.display = 'flex';
                        e.target.style.alignItems = 'center';
                        e.target.style.justifyContent = 'center';
                        e.target.style.color = '#666';
                        e.target.style.fontSize = '0.8rem';
                        e.target.alt = 'Image not available';
                      }}
                      style={{
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover',
                        borderRadius: '0.5rem', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }} 
                    />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#333333', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.3rem', margin: 0 }}>
                      {item.title}
                    </h4>
                    
                    {item.sold && (
                      <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        display: 'inline-block'
                      }}>
                        SOLD
                      </div>
                    )}
                    
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      {item.size && <span>Size: {item.size} • </span>}
                      {item.medium && <span>Medium: {item.medium}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#333' }}>
                        {item.price}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Qty: {item.quantity}</div>
                        {/* Quantity selector temporarily commented out */}
                        {/* 
                        <label style={{ fontSize: '0.9rem', color: '#666' }}>Qty:</label>
                        <select 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          style={{
                            padding: '0.2rem 0.4rem',
                            border: '1px solid #ccc',
                            borderRadius: '0.3rem',
                            fontSize: '0.9rem'
                          }}
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                        */}
                        
                        <button 
                          onClick={() => removeItem(item.id)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            background: '#c62828',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.3rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            marginLeft: '0.5rem'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '1rem',
              padding: '1.2rem',
              border: '2px solid #333333',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                color: '#333333', 
                fontWeight: 700, 
                fontSize: '1.4rem', 
                margin: 0 
              }}>
                Total: ${totalPrice.toFixed(2)} CAD
              </h3>
            </div>
          </div>
        </>
        )}
      </div>

      <div 
        ref={formRef}
        style={{
          transform: formVisible ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.3)',
          opacity: formVisible ? 1 : 0.3,
          transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        {!isEmpty && !clientSecret && !paymentCompleted && (
        <>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Please enter your payment details below.
          </p>
          
          {error && (
            <div style={{ 
              color: '#c62828', 
              background: '#ffebee', 
              padding: '0.8rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem', 
              width: '100%', 
              maxWidth: '400px', 
              textAlign: 'center' 
            }}>
              {error}
            </div>
          )}
          
          <form
            style={{
              width: '100%', 
              maxWidth: '400px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.2rem'
            }}
            onSubmit={handlePayment}
          >
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              required 
              style={{ 
                padding: '0.7rem 1rem', 
                borderRadius: '1rem', 
                border: '1px solid #d0d0d0', 
                fontSize: '1.1rem', 
                fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                background: '#ffffff',
                color: '#333333'
              }} 
            />
            
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              required 
              style={{ 
                padding: '0.7rem 1rem', 
                borderRadius: '1rem', 
                border: '1px solid #d0d0d0', 
                fontSize: '1.1rem', 
                fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                background: '#ffffff',
                color: '#333333'
              }} 
            />
            
            <button 
              type="submit" 
              disabled={isProcessing}
              style={{ 
                background: isProcessing ? '#888888' : '#666666', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '1rem', 
                padding: '0.7rem 1.5rem', 
                fontWeight: 600, 
                fontSize: '1.2rem', 
                cursor: isProcessing ? 'not-allowed' : 'pointer', 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                transition: 'background 0.2s, color 0.2s', 
                marginTop: '2rem' 
              }}
            >
              {isProcessing ? 'Processing...' : 'Pay & Reserve'}
            </button>
          </form>
        </>
        )}
      </div>

      {clientSecret && !paymentCompleted && stripePromise && (
        <div style={{ width: '100%', maxWidth: '450px' }}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout 
              onComplete={handleCheckoutComplete}
            />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      {clientSecret && !stripePromise && (
        <div style={{ 
          color: '#c62828', 
          background: '#ffebee', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          Payment configuration error. 
        </div>
      )}
    </section>
    </div>
  );
};

export default Cart;