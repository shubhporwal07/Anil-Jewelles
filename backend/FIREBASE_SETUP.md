# LUMIÈRE E-Commerce Dashboard - Complete Setup Guide

## Project Overview

This is a full-featured luxury jewelry e-commerce dashboard built with:
- **Frontend**: React with React Router
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Cloud Storage
- **Styling**: Tailwind CSS

## Features Implemented

### ✅ User Management
- Email/Password Authentication
- Google OAuth Integration
- Role-Based Access Control (User vs Admin)
- Session Persistence

### ✅ Product Management
- Browse products with dynamic grid layout
- Filtering by: Category, Metal Type, Price Range, Diamond Weight, Certification
- Sorting: Newest, Price (Low to High), Price (High to Low)
- Pagination: 12 items per page
- Product search with live updates

### ✅ Admin Features
- Add new products with image upload
- Edit existing products
- Delete products
- Real-time inventory updates

### ✅ Shopping Features
- Add to cart functionality
- Cart item management
- Wishlist support (UI ready)

### ✅ UI/UX
- Responsive design (Mobile, Tablet, Desktop)
- Luxury aesthetic matching design reference
- Loading states and spinners
- Error handling and notifications
- Toast notifications

---

## Firebase Setup Instructions

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `anil-jewellers` (or your preferred name)
4. Accept the terms and create project
5. Wait for project initialization

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click enable, toggle both options, save
   - **Google**: 
     - Click enable
     - Select your project from the dropdown
     - Save

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select location (closest to your region)
5. Click **Enable**

### Step 4: Create Collections and Sample Data

#### Collection: `users`
Add documents for testing. Example:
```
Document ID: {user_uid_from_login}
Fields:
  - uid (string): {user_uid}
  - email (string): user@example.com
  - role (string): "admin" or "user"
```

#### Collection: `products`
Add sample products:
```
Document ID: auto-generated

Fields:
  - name (string): "THE ASTRAEA SOLITAIRE DIAMOND RING"
  - description (string): "Elegant solitaire diamond ring..."
  - price (number): 5850000
  - category (string): "Fine Jewellery"
  - metalType (string): "White Gold"
  - diamondWeight (number): 1.5
  - certification (string): "GIA Certified"
  - imageUrl (string): "https://..."
  - createdAt (timestamp): server timestamp
```

**Add multiple products for good pagination demonstration**

### Step 5: Setup Cloud Storage

1. Go to **Cloud Storage**
2. Click **Get Started**
3. Choose test mode for development
4. Select default location

### Step 6: Update Firebase Config

The app uses `anil-jewellers-a948c-firebase-adminsdk-fbsvc-f6f27949c6.json` but you need to update the web config.

Open `vite.config.js` or create a `firebase.js` file to initialize Firebase with your credentials:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

Get your config from Firebase Console → Project Settings → Your apps → Web

---

## Project Structure

```
src/
├── App.jsx                    # Main app with routing
├── main.jsx                   # Entry point
├── index.css                  # Global styles
├── LoginPage.jsx             # Login page
├── Dashboard.jsx             # Main dashboard
├── AuthContext.jsx           # Auth provider with role management
├── ProductContext.jsx        # Product state management
├── ProtectedRoute.jsx        # Route protection components
├── Navbar.jsx                # Navigation bar
├── SidebarFilters.jsx        # Filter sidebar
├── ProductCard.jsx           # Individual product card
├── ProductGrid.jsx           # Product grid with pagination
├── AdminAddProductModal.jsx  # Add/edit product modal
├── Toast.jsx                 # Toast notifications
└── Firebase config files
```

---

## Component Documentation

### AuthContext
Manages user authentication and role-based access:
- `user`: Current authenticated user
- `userRole`: User role (admin/user)
- `isAuthenticated`: Boolean auth state
- `isAdmin`: Boolean admin flag
- `logout()`: Logout function

### ProductContext
Manages all product operations:
- **State**: products, filteredProducts, paginatedProducts, filters, sortBy, cartItems
- **Functions**:
  - `fetchProducts()`: Get all products from Firestore
  - `addProduct(data, imageFile)`: Add new product with image
  - `editProduct(id, data, imageFile)`: Update product
  - `deleteProduct(id)`: Delete product
  - `updateFilter()`: Apply filters
  - `addToCart()`: Add product to cart
  - `removeFromCart()`: Remove from cart

### Protected Routes
- `<ProtectedRoute>`: Requires authentication
- `<AdminRoute>`: Requires admin role
- `<PublicRoute>`: Redirects if already authenticated

---

## Testing the Application

### Test User Accounts

1. **Create test users** in Firebase Authentication:
   - Admin: admin@lumiere.com / password123
   - Regular User: user@lumiere.com / password123

2. **Assign roles**:
   - Go to Firestore → Create `users` collection
   - Add documents with `role` field set to "admin" or "user"

### Test Flows

**Flow 1: User Login & Browse**
1. Go to http://localhost:3000
2. Login with user credentials
3. View products on dashboard
4. Apply filters
5. Change sorting
6. Navigate pagination

**Flow 2: Admin - Add Product**
1. Login as admin
2. Click "Add New Product"
3. Fill in product details
4. Upload image
5. Submit - product should appear immediately

**Flow 3: Admin - Edit Product**
1. Hover over product card
2. Click "Edit"
3. Update details
4. Submit changes

**Flow 4: Admin - Delete Product**
1. Hover over product card
2. Click "Delete"
3. Confirm deletion

**Flow 5: Shopping**
1. Click "Add to Bag" on product
2. See cart count update in navbar
3. View cart from navbar icon

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then update the Firebase initialization to use these:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

---

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run at `http://localhost:3000` (or your configured Vite port)

---

## Security Rules for Development

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read products
    match /products/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow authenticated users to read carts
    match /carts/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Cloud Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Deployment

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Build the app
npm run build

# Deploy
firebase deploy
```

---

## Troubleshooting

### Products not loading
- Check Firestore rules allow read access
- Verify Firebase is initialized correctly
- Check browser console for errors

### Images not uploading
- Ensure Cloud Storage is enabled
- Check storage security rules
- Verify file is under 10MB

### Admin features not showing
- Check user has `role: "admin"` in users collection
- Clear browser cache and login again
- Check console for auth errors

### Authentication errors
- Verify Firebase project ID in config
- Check email/password provider is enabled
- For Google OAuth, ensure correct Google Cloud project

---

## Next Steps / Enhancements

- [ ] Implement wishlist persistence to Firestore
- [ ] Add shopping cart to Firestore (currently local state)
- [ ] Implement checkout flow
- [ ] Add order management
- [ ] Product detail modal with full information
- [ ] Search functionality
- [ ] User profile page
- [ ] Order history
- [ ] Review and ratings system
- [ ] Email notifications
- [ ] Payment integration (Stripe/PayPal)

---

## Support & Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide React Icons](https://lucide.dev/)

---

## Notes

- The application uses local state for cart (can be moved to Firestore)
- Product images are stored in Firebase Cloud Storage
- User roles are stored in Firestore `users` collection
- Firestore queries are optimized with indexing where needed
- All timestamps use Firestore Timestamp for consistency
