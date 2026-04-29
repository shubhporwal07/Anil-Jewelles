# ✅ LUMIÈRE Dashboard - Quick Start Checklist

Complete these steps in order to get your application running:

## Phase 1: Firebase Setup (15 mins)

- [ ] Go to https://console.firebase.google.com/
- [ ] Create new project: "anil-jewellers"
- [ ] Wait for project initialization (2-3 mins)
- [ ] Go to **Build** → **Authentication**
- [ ] Click **Get Started**
- [ ] Enable **Email/Password** provider
- [ ] Enable **Google** provider
- [ ] Go to **Build** → **Firestore Database**
- [ ] Click **Create database**
- [ ] Choose **Start in test mode**
- [ ] Select location (default is fine)
- [ ] Go to **Build** → **Storage**
- [ ] Click **Get Started** → **Create bucket**
- [ ] Keep default settings

## Phase 2: Configuration (10 mins)

- [ ] Copy your Firebase config from **Project Settings** → **Your apps** → **Web** (</> icon)
- [ ] Create `.env` file in project root:
  ```env
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```
- [ ] Create/Update `firebase.js` in project root with proper config
- [ ] Update LoginPage.jsx to use environment variables
- [ ] Update AuthContext.jsx to use correct Firebase import

## Phase 3: Database Setup (10 mins)

In Firestore Console, create these collections:

### Collection: `users`
- [ ] Create collection named "users"
- [ ] Add test document:
  - Document ID: `<admin-uid>`
  - Fields:
    - `uid` (string): same as document ID
    - `email` (string): admin@lumiere.com
    - `role` (string): "admin"

- [ ] Add another document for regular user:
  - Document ID: `<user-uid>`
  - Fields:
    - `uid` (string): same as ID
    - `email` (string): user@lumiere.com
    - `role` (string): "user"

### Collection: `products`
- [ ] Create collection named "products"
- [ ] Add sample products (at least 15-20 for pagination demo):
  ```
  {
    "name": "THE ASTRAEA SOLITAIRE DIAMOND RING",
    "description": "Elegant solitaire diamond ring with GIA certification",
    "price": 5850000,
    "category": "Fine Jewellery",
    "metalType": "White Gold",
    "diamondWeight": 1.5,
    "certification": "GIA Certified",
    "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    "createdAt": (server timestamp)
  }
  ```
- [ ] Add 15-20 more products with varied data

## Phase 4: User Accounts (5 mins)

In Firebase Authentication:

- [ ] Click **Create User**
- [ ] Email: admin@lumiere.com
- [ ] Password: admin123456
- [ ] Copy the User UID to the users collection
- [ ] Create another user:
  - Email: user@lumiere.com
  - Password: user123456
  - Add to users collection with `role: "user"`

## Phase 5: Security Rules (5 mins)

### Firestore Rules
Go to **Firestore** → **Rules**, replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```
- [ ] Click **Publish**

### Cloud Storage Rules
Go to **Storage** → **Rules**, replace with:
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
- [ ] Click **Publish**

## Phase 6: Application Testing (20 mins)

### Terminal Commands
```bash
# In project directory
cd d:/apj

# Install dependencies
npm install

# Start development server
npm run dev
```

- [ ] Open http://localhost:3000 in browser
- [ ] You should be redirected to login

### Test 1: User Login
- [ ] Click "Create Account" or login with:
  - Email: user@lumiere.com
  - Password: user123456
- [ ] Verify redirect to dashboard

### Test 2: Browse Products
- [ ] See product grid (4 columns)
- [ ] Apply filters:
  - [ ] Select category
  - [ ] Select metal type
  - [ ] Change price range
  - [ ] Verify products update
- [ ] Change sorting:
  - [ ] Click "Newest"
  - [ ] Click "Price: Low to High"
  - [ ] Click "Price: High to Low"
- [ ] Test pagination:
  - [ ] Click page 2
  - [ ] Click next/previous
  - [ ] See item count update

### Test 3: Add to Cart
- [ ] Click "Add to Bag" on a product
- [ ] See cart count increase in navbar
- [ ] Add more products
- [ ] Verify count updates correctly

### Test 4: User Logout
- [ ] Click logout button (top right)
- [ ] Verify redirect to login

### Test 5: Admin Login
- [ ] Login with:
  - Email: admin@lumiere.com
  - Password: admin123456
- [ ] Verify "Add New Product" button appears
- [ ] Verify admin badge shows

### Test 6: Admin - Add Product
- [ ] Click "Add New Product"
- [ ] Fill in form:
  - [ ] Name: Test Product
  - [ ] Description: Test product description
  - [ ] Price: 5000
  - [ ] Category: Fine Jewellery
  - [ ] Metal Type: White Gold
  - [ ] Diamond Weight: 1.0
  - [ ] Certification: Certified
  - [ ] Upload image (or use URL placeholder)
- [ ] Click "Add Product"
- [ ] Verify new product appears on grid

### Test 7: Admin - Edit Product
- [ ] Hover over a product
- [ ] Click "Edit"
- [ ] Modal opens with product data
- [ ] Change a field (e.g., name)
- [ ] Click "Update Product"
- [ ] Verify changes appear on grid

### Test 8: Admin - Delete Product
- [ ] Hover over a product
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Verify product removed from grid

## Phase 7: Production Build (5 mins)

```bash
# Build for production
npm run build

# Test production build locally
npm run preview
```

- [ ] Verify `dist` folder is created
- [ ] Open preview URL and test
- [ ] All functionality works

## Phase 8: Deployment (Optional)

Choose one:

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```
- [ ] Deployed to Firebase Hosting

### Netlify
- [ ] Push to GitHub
- [ ] Connect GitHub repo to Netlify
- [ ] Deploy automatically

### Vercel
- [ ] Push to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Deploy automatically

---

## 📱 Testing Checklist

### Desktop (1920x1080)
- [ ] Layout renders correctly
- [ ] All buttons clickable
- [ ] Products display in 4 columns
- [ ] Filters work
- [ ] Pagination works

### Tablet (768x1024)
- [ ] Products display in 2 columns
- [ ] Sidebar collapses if responsive
- [ ] All buttons accessible
- [ ] Touch interactions work

### Mobile (375x667)
- [ ] Products display in 1 column
- [ ] Menu is accessible
- [ ] Filters work
- [ ] All text readable

---

## ⚠️ Troubleshooting

### Problem: "Cannot find module 'firebase'"
**Solution**: 
```bash
npm install firebase
```

### Problem: Login not working
**Solution**:
- Check Firebase project ID matches `.env`
- Verify Email/Password auth is enabled
- Check email/password in Authentication console

### Problem: Products not showing
**Solution**:
- Verify products exist in Firestore
- Check Firestore rules allow reads
- Check browser console for errors

### Problem: Images not uploading
**Solution**:
- Verify Cloud Storage bucket exists
- Check Storage rules allow writes for admins
- Verify file size < 10MB

### Problem: Admin features not showing
**Solution**:
- Verify user has `role: "admin"` in users collection
- Logout and login again
- Clear browser cache

---

## 🎯 Success Indicators

You'll know everything is working when:

✅ Can login with test credentials<br>
✅ Dashboard loads with product grid<br>
✅ Filters update products in real-time<br>
✅ Can add items to cart (count updates)<br>
✅ Admin can add products from modal<br>
✅ Admin can edit products inline<br>
✅ Admin can delete products<br>
✅ Images upload to Firebase Storage<br>
✅ Responsive design works on all devices<br>
✅ Can logout and return to login<br>

---

## 📞 Still Having Issues?

1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup
2. Check [COMPLETE_README.md](./COMPLETE_README.md) for API reference
3. Review component code comments
4. Check browser console for error messages
5. Check Firebase console logs

---

## 🎉 You're All Set!

Once all checkboxes are complete, your LUMIÈRE e-commerce dashboard is fully operational!

**Estimated total time: 1-2 hours** ⏱️

Happy coding! 🚀
