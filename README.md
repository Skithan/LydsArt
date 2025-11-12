# LydsArt

A modern art portfolio and e-commerce platform built for none other than my personal friend, teacher, artist, and inspiration, Lydia Paterson. The application showcases artwork with an elegant gallery interface, Firebase Storage photo management, and handles online art sales with embedded Stripe payment processing.

## 🌐 Live Site
**Production**: https://lydsart-f6966.web.app

## 🏗️ Architecture Overview

This is a full-stack application built on Firebase with the following architecture:
- **Frontend**: React Javascript hosted on Firebase Hosting
- **Backend**: Firebase Serverless Functions 
- **Database**: Firestore (NoSQL document database)
- **Image Storage**: Firebase Storage with URL conversion
- **Payments**: Embedded Stripe Checkout Sessions
- **Authentication**: Firebase Auth with admin system
- **Email**: EmailJS for payment confirmations

---

## 📁 Project Structure & File Connections

### **Root Directory** *(Streamlined Structure)*
```
LydsArt/
├── .firebase/              # Firebase deployment cache
├── .firebaserc            # Firebase project ID settings
├── .git/                  # Git repository
├── .github/               # GitHub workflows
├── .gitignore             # Git ignore rules
├── client/                # React frontend application
├── server/                # Firebase Functions backend
├── firebase.json          # Firebase project configuration
└── README.md              # This documentation
```

---

## 🎨 Frontend (client/)

### **Core React Components**

#### **`client/src/App.js`**
- **Purpose**: Main application router 
- **Connects to**: All page components via React Router
- **Routes defined**:
  - `/` → Home component
  - `/artwork` → Artwork gallery
  - `/contact` → Instagram Linnk
  - `/cart` → Shopping cart & checkout
  - `/success` → Thank you page after payment

#### **`client/src/Artwork.js`** ⭐ *Core Gallery*
- **Purpose**: Main artwork gallery with filtering, animations, and Firebase Storage querying
- **Data Flow**: Firestore → Firebase Storage URL conversion → Cache → UI display
- **Features**:
  - Fetches artwork from Firestore with automatic refresh
  - **Firebase Storage Integration**: Converts database URLs to Firebase Storage HTTP URLs
  - **URL Conversion**: Handles both `gs://` and `/filename.jpeg` formats automatically
  - Grid/single view toggle with smooth transitions
  - Advanced filtering by medium, size, availability status
  - Smooth fly-in animations with Intersection Observer
  - Responsive touch/swipe navigation for mobile
  - Smart caching
- **Connects to**: 
  - `firebase.js` for database queries and storage
  - `CartContext.js` for shopping cart functionality


#### **`client/src/Cart.js`**
- **Purpose**: Shopping cart and Stripe checkout integration
- **Data Flow**: Artwork selection → Stripe → Firebase Functions
- **Features**:
  - Displays selected artwork details
  - Handles sold artwork prevention
  - Stripe embedded checkout
  - Customer information collection
- **Connects to**:
  - Firebase Functions (`createCheckoutSession`)
  - Stripe SDK for payment processing
  - `ThankYou.js` after successful payment

#### **`client/src/ThankYou.js`**
- **Purpose**: Post-purchase confirmation and email notifications
- **Data Flow**: Stripe session → Display confirmation → Send emails
- **Features**:
  - Retrieves payment session details
  - Sends customer confirmation email
  - Sends artist notification email
- **Connects to**:
  - Firebase Functions (`sessionStatus`)
  - EmailJS SDK for email delivery

#### **`client/src/Header.js`** & **`client/src/Footer.js`**
- **Purpose**: Consistent navigation and branding across all pages
- **Connects to**: All pages via App.js routing

#### **`client/src/Home.js`** & **`client/src/Contact.js`**
- **Purpose**: Static content pages (landing and contact information)

---

### **Configuration & Utilities**

#### **`client/src/firebase.js`**
- **Purpose**: Firebase SDK configuration and initialization
- **Exports**: 
  - `db` - Firestore database instance
  - `storage` - Firebase Storage for image management
  - `auth` - Firebase Authentication for admin system
- **Used by**: 
  - `Artwork.js` for data fetching and image URL conversion
  - `AdminDashboard.js` for admin artwork management
  - `ArtworkForm.js` for image uploads and data management
- **Config**: Contains API keys, project settings, and Firebase Storage bucket

#### **`client/src/emailService.js`**
- **Purpose**: EmailJS integration for sending confirmation emails
- **Used by**: ThankYou.js for post-purchase notifications

#### **`client/src/.env`**
- **Purpose**: Environment variables for API keys and URLs
- **Contains**:
  - `REACT_APP_CREATE_CHECKOUT_URL` - Firebase Function URL
  - `REACT_APP_SESSION_STATUS_URL` - Firebase Function URL
  - `REACT_APP_STRIPE_PUBLIC_KEY` - Stripe public key
  - EmailJS configuration keys

#### **`client/src/App.css`** & **`client/src/index.css`**
- **Purpose**: Application styling and responsive design
- **Features**:
  - Custom animations and transitions
  - Responsive breakpoints
  - Gallery grid layouts
  - Touch-friendly mobile interface

---

## ⚡ Backend (server/)

### **Firebase Functions**

#### **`server/index.js`** ⭐ *Main Backend*
- **Purpose**: Core business logic and Stripe integration
- **Functions**:
  - `createCheckoutSession` - Validates artwork availability, creates Stripe payment
  - `sessionStatus` - Retrieves payment status, updates sold status in Firestore
- **Security**: Uses Firebase secrets for Stripe API key
- **Connects to**: 
  - Firestore for artwork data
  - Stripe API for payments
  - Client Cart.js and ThankYou.js

#### **`server/uploadFunction.js`**
- **Purpose**: One-time data upload utility
- **Function**: `uploadArtworkData` - Populates Firestore with initial artwork data
- **Usage**: Called once via HTTPS endpoint to seed database
- **Security**: Prevents duplicate uploads

#### **`server/package.json`**
- **Purpose**: Firebase Functions configuration and dependencies
- **Key settings**:
  - Node.js 20 engine
  - Dependencies: firebase-functions, stripe, cors
  - ESLint configuration for code quality

---

## 🔄 Data Flow & Connections

### **Artwork Display Flow**
```
Firestore Database → client/src/Artwork.js → localStorage cache → UI Display
                                        ↓
                              Filter/Search Interface → Real-time UI updates
```

### **Purchase Flow**
```
Artwork Selection → Cart.js → Firebase Function (createCheckoutSession) 
                                      ↓
Stripe Payment Processing → sessionStatus Function → Firestore Update (sold: true)
                                      ↓
                            ThankYou.js → EmailJS → Confirmation emails
```

### **Database Schema (Firestore)**
```
Collection: artwork/
├── title: string
├── medium: string  
├── size: string (dimensions)
├── date: string (year created)
├── price: number (null if not for sale)
├── priceDisplay: string (formatted price)
├── sold: boolean (availability status)
├── imageUrl: string (Firebase Storage URL or legacy path)
├── slug: string (URL-friendly identifier)
├── description: string (optional artwork description)
├── available: boolean (legacy field, mapped from !sold)
├── createdAt: timestamp
├── updatedAt: timestamp
└── [When sold]:
    ├── soldAt: timestamp
    ├── soldTo: string (customer name)
    └── soldToEmail: string (customer email)
```

### **Firebase Storage Structure**
```
gs://lydsart-f6966.firebasestorage.app/
└── artwork/
    ├── AnUptownPerspective2.jpeg
    ├── EndOfSummerFlowers.jpeg
    ├── ComfortInChange.jpeg
    └── [other artwork images...]
```

---

## 🔧 Key Features & Integrations

### **Admin Management System**
- **Firebase Authentication**: Secure admin login system
- **Admin Dashboard**: Full CRUD operations for artwork management
- **Image Upload**: Direct upload to Firebase Storage via admin interface
- **URL Conversion**: Automatic handling of Firebase Storage URLs
- **Secure Access**: Admin-only routes and server-side validation

### **Firebase Storage Integration**
- **Automatic URL Conversion**: Converts `gs://` and legacy paths to HTTP URLs
- **Image Management**: Centralized storage for all artwork images
- **Admin Uploads**: New artwork uploads directly to Firebase Storage
- **URL Processing**: Smart detection and conversion of different URL formats

### **Performance Optimizations**
- **Firestore Caching**: Artwork data cached in localStorage with manual refresh
- **Firebase Storage CDN**: Images served via Google's CDN for fast loading
- **Smart Caching**: Cache invalidation with refresh button
- **Lazy Loading**: Intersection Observer for smooth animations
- **Mobile Optimization**: Touch gestures and responsive image loading

### **Payment Security**
- **Server-side validation**: Artwork availability checked before payment
- **Stripe integration**: PCI-compliant payment processing with embedded checkout
- **Concurrent purchase prevention**: Database locks prevent duplicate sales
- **Admin Notifications**: Automatic email alerts for new purchases

### **User Experience**
- **Responsive design**: Mobile-first approach with touch gestures
- **Smooth Animations**: Fly-in effects and smooth transitions
- **Advanced Filtering**: Real-time filtering by medium, size, and availability
- **Grid/Single View**: Toggle between gallery grid and detailed single view
- **Accessibility**: ARIA labels and keyboard navigation support

---

## 🚀 Deployment & Development

### **Firebase Configuration**
- **Project ID**: `lydsart-f6966`
- **Hosting**: `client/build/` → Firebase Hosting
- **Functions**: `server/` → Firebase Functions
- **Database**: Firestore in `us-central1`

### **Build Process**
```bash
# Frontend build
cd client && npm run build

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
```

### **Environment Setup**
1. Install dependencies: `npm install` (in both client/ and server/)
2. Configure Firebase CLI: `firebase login`
3. Set environment variables in `client/.env`
4. Deploy: `firebase deploy`

---

## 🛠️ Technology Stack

- **Frontend**: React.js, CSS3, HTML5
- **Backend**: Firebase Functions (Node.js 20)
- **Database**: Firestore (NoSQL document database)
- **Storage**: Firebase Storage (Google Cloud Storage)
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting with CDN
- **Payments**: Stripe API with embedded checkout
- **Email**: EmailJS for notifications
- **Build Tools**: Create React App, Firebase CLI
- **Styling**: Custom CSS with responsive design and animations
- **Image Processing**: Automatic Firebase Storage URL conversion
- **Security**: Firebase Security Rules, admin authentication

---

---

## 🚀 Recent Updates & Improvements

### **Project Cleanup (November 2025)**
- ✅ **Streamlined Structure**: Removed temporary files, debug logs, and development scripts
- ✅ **Firebase Storage Integration**: Implemented automatic URL conversion for artwork images
- ✅ **Admin Dashboard**: Added comprehensive artwork management system
- ✅ **Image Management**: Unified Firebase Storage system for all artwork
- ✅ **Security Cleanup**: Removed credential files and sensitive data
- ✅ **Performance**: Optimized caching and image loading

### **Current Features**
- 🎨 **Complete Art Gallery**: Browse artwork with advanced filtering
- � **E-commerce**: Secure Stripe integration for art purchases
- 🔐 **Admin System**: Full CRUD operations for artwork management
- 📱 **Mobile-First**: Responsive design with touch gestures
- ☁️ **Cloud Storage**: Firebase Storage for scalable image hosting
- 🚀 **Fast Performance**: Optimized caching and CDN delivery

---

## �📞 Support & Maintenance

For technical issues or feature requests, this README provides the complete architecture overview to understand how each component connects and functions within the LydsArt ecosystem.

### **Admin Access**
- Admin dashboard: `/admin/dashboard`
- Add artwork: `/admin/artwork/new`
- Authentication required via Firebase Auth

### **Key URLs**
- **Live Site**: https://lydsart-f6966.web.app
- **Admin Login**: https://lydsart-f6966.web.app/admin
- **Firebase Console**: https://console.firebase.google.com/project/lydsart-f6966
