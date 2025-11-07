# LydsArt

A modern art portfolio and e-commerce platform built for artist Lydia Paterson. The application showcases artwork with an elegant gallery interface and handles online art sales with integrated payment processing.

## 🌐 Live Site
**Production**: https://lydsart-f6966.web.app

## 🏗️ Architecture Overview

This is a full-stack application built on Firebase with the following architecture:
- **Frontend**: React SPA hosted on Firebase Hosting
- **Backend**: Firebase Functions (serverless)
- **Database**: Firestore (NoSQL document database)
- **Payments**: Stripe integration
- **Email**: EmailJS for notifications

---

## 📁 Project Structure & File Connections

### **Root Directory**
```
LydsArt/
├── client/                 # React frontend application
├── server/                 # Firebase Functions backend
├── firebase.json           # Firebase project configuration
├── .firebaserc            # Firebase project ID settings
└── README.md              # This file
```

---

## 🎨 Frontend (client/)

### **Core React Components**

#### **`client/src/App.js`**
- **Purpose**: Main application router and layout wrapper
- **Connects to**: All page components via React Router
- **Routes defined**:
  - `/` → Home component
  - `/artwork` → Artwork gallery
  - `/contact` → Contact form
  - `/cart` → Shopping cart & checkout
  - `/success` → Thank you page after payment

#### **`client/src/Artwork.js`** ⭐ *Core Gallery*
- **Purpose**: Main artwork gallery with filtering and animations
- **Data Flow**: Firestore → Cache → UI display
- **Features**:
  - Fetches artwork from Firestore (cached for 24h)
  - Grid/single view toggle
  - Filter by medium, size, sold status
  - Smooth fly-in animations with Intersection Observer
  - Responsive touch/swipe navigation
- **Connects to**: 
  - `firebase.js` for database queries
  - `Cart.js` via navigation (Reserve button)
  - localStorage for caching artwork data

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
  - `storage` - Firebase Storage (for future use)
- **Used by**: Artwork.js for data fetching
- **Config**: Contains API keys and project settings

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
├── size: string
├── date: string
├── price: number
├── priceDisplay: string
├── sold: boolean
├── imageUrl: string
├── slug: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── soldAt: timestamp (when sold)
    soldTo: string (customer name)
    soldToEmail: string (customer email)
```

---

## 🔧 Key Features & Integrations

### **Performance Optimizations**
- **Firestore Caching**: Artwork data cached in localStorage for 24 hours
- **Image Optimization**: Static images served from Firebase Hosting CDN
- **Lazy Loading**: Intersection Observer for animation triggers

### **Payment Security**
- **Server-side validation**: Artwork availability checked before payment
- **Stripe integration**: PCI-compliant payment processing
- **Concurrent purchase prevention**: Database locks prevent duplicate sales

### **User Experience**
- **Responsive design**: Mobile-first approach with touch gestures
- **Progressive enhancement**: Works without JavaScript for basic browsing
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
- **Database**: Firestore (NoSQL)
- **Hosting**: Firebase Hosting
- **Payments**: Stripe API
- **Email**: EmailJS
- **Build Tools**: Create React App, Firebase CLI
- **Styling**: Custom CSS with responsive design

---

## 📞 Support & Maintenance

For technical issues or feature requests, this README provides the complete architecture overview to understand how each component connects and functions within the LydsArt ecosystem.
