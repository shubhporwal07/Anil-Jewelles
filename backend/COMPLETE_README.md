# LUMIÈRE E-Commerce Dashboard

A modern, luxury jewelry e-commerce platform built with React, Firebase, and Tailwind CSS. Features responsive design, role-based authentication, admin product management, and a beautiful shopping experience.

## 🎯 Features

### Authentication & Authorization
✅ **Email/Password Login** - Secure authentication via Firebase<br>
✅ **Google OAuth** - Quick sign-in with Google<br>
✅ **Role-Based Access** - Admin and User roles<br>
✅ **Session Persistence** - Remember login across sessions<br>
✅ **Protected Routes** - Automatic redirection based on auth status<br>

### Product Management (Admin Only)
✅ **Add Products** - Upload products with image to Cloud Storage<br>
✅ **Edit Products** - Modify existing product details<br>
✅ **Delete Products** - Remove products from catalog<br>
✅ **Image Handling** - Firebase Cloud Storage integration<br>
✅ **Real-time Updates** - UI auto-refreshes when products change<br>

### Product Browsing (All Users)
✅ **Dynamic Product Grid** - Responsive 4-column layout<br>
✅ **Smart Filtering** - Filter by category, metal type, price, diamond weight, certification<br>
✅ **Sorting Options** - Sort by newest, price (low-high), price (high-low)<br>
✅ **Pagination** - 12 items per page with navigation<br>
✅ **Product Details** - View details with image, name, price, specifications<br>

### Shopping Features
✅ **Add to Cart** - Add products to shopping cart<br>
✅ **Cart Management** - Real-time cart item count in navbar<br>
✅ **Wishlist UI** - Ready for implementation<br>
✅ **Product Search** - Live filtering of products<br>

### User Experience
✅ **Responsive Design** - Mobile, tablet, desktop optimized<br>
✅ **Loading States** - Spinners and placeholders for async operations<br>
✅ **Error Handling** - Comprehensive error messages<br>
✅ **Toast Notifications** - User feedback for all actions<br>
✅ **Luxury Aesthetic** - Clean, elegant UI matching luxury brand<br>
✅ **Smooth Animations** - Hover effects, transitions, tooltips<br>

---

## 📁 Project Structure

```
d:/apj/
├── App.jsx                    # Main app router
├── main.jsx                   # React entry point
├── index.html                 # HTML template
├── index.css                  # Global styles
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.js         # PostCSS config
├── package.json              # Dependencies
│
├── 🔐 Authentication
│   ├── LoginPage.jsx         # Login page component
│   ├── AuthContext.jsx       # Auth state management
│   └── ProtectedRoute.jsx    # Route protection
│
├── 📊 Dashboard & Products
│   ├── Dashboard.jsx         # Main dashboard page
│   ├── Navbar.jsx            # Top navigation bar
│   ├── SidebarFilters.jsx    # Filter sidebar
│   ├── ProductGrid.jsx       # Product grid with pagination
│   ├── ProductCard.jsx       # Individual product card
│   └── ProductContext.jsx    # Product state management
│
├── 🛠️ Admin Features
│   └── AdminAddProductModal.jsx  # Add/edit product form
│
├── 🎨 UI Components
│   ├── Toast.jsx             # Toast notifications
│   └── ...utility components
│
└── 📚 Documentation
    ├── README.md             # This file
    ├── FIREBASE_SETUP.md     # Firebase configuration guide
    ├── SETUP_GUIDE.md        # Quick start guide
    └── QUICK_REFERENCE.md    # API reference
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase account

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Install React Router
npm install react-router-dom

# 3. Add Firebase
npm install firebase

# 4. Ensure Tailwind is configured
# (Already included in project)
```

### Environment Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration.

### Running the Application

```bash
# Start development server
npm run dev

# The app runs at http://localhost:5173 (or your configured port)
```

---

## 🔐 Authentication Flow

### Login Flow
1. User goes to `/login`
2. Enters email/password or uses Google OAuth
3. Firebase validates credentials
4. User role is fetched from Firestore `users` collection
5. User is redirected to `/dashboard`
6. Session persists across browser refreshes

### Role-Based Access
```javascript
if (user.role === 'admin') {
  // Show: Add/Edit/Delete buttons
  // Can access admin features
} else {
  // Show: Browse-only interface
  // Can add to cart, apply filters
}
```

---

## 📦 Key Components

### AuthContext
**Purpose**: Manages user authentication and role state

**Exports**:
```javascript
<AuthProvider>
  {children}
</AuthProvider>

// Hook usage
const { user, userRole, isAdmin, logout } = useAuth();
```

**Features**:
- Automatic user state sync via Firebase Auth
- Role fetching from Firestore
- Logout functionality
- Error handling

### ProductContext
**Purpose**: Manages all product data and operations

**State**:
- `products` - All products from database
- `filteredProducts` - Products after filters applied
- `paginatedProducts` - Current page of products
- `filters` - Active filter selections
- `cartItems` - Items in shopping cart
- `sortBy` - Current sort method

**Functions**:
```javascript
// Fetching
fetchProducts()                      // Get all products
paginatedProducts                    // Current page data

// CRUD Operations
addProduct(data, imageFile)         // Add new product
editProduct(id, data, imageFile)    // Update product
deleteProduct(id)                    // Remove product

// Filtering & Sorting
updateFilter(type, value, checked)  // Apply filters
setSortBy(sortType)                 // Change sort

// Cart Management
addToCart(product)                  // Add to cart
removeFromCart(id)                  // Remove from cart
updateCartQuantity(id, qty)         // Update quantity
```

### ProtectedRoute
**Purpose**: Guards routes based on authentication and role

```javascript
// Require authentication
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Require admin role
<AdminRoute>
  <AdminPanel />
</AdminRoute>

// Public only (redirect if authenticated)
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

---

## 🎨 UI Components

### ProductCard
Displays individual product with image, details, and actions

**Props**:
```javascript
<ProductCard
  product={productObject}
  onViewDetails={handleViewDetails}
  onEdit={handleEditProduct}
  onDelete={handleDeleteProduct}
  isAdmin={false}
/>
```

### SidebarFilters
Collapsible filter sidebar with multiple filter categories

**Filters**:
- Product Category
- Metal Type
- Price Range
- Diamond Weight
- Certification

### ProductGrid
Responsive grid with pagination controls

**Features**:
- 4-column responsive layout
- Pagination navigation
- Items per page display
- Loading states

### AdminAddProductModal
Modal form for adding/editing products

**Fields**:
- Product name
- Description
- Price
- Category
- Metal type
- Diamond weight
- Certification
- Image upload

---

## 📊 Data Models

### Product
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  category: string,  // "Fine Jewellery", "Engagement", "Men's"
  metalType: string, // "White Gold", "Rose Gold", "Platinum"
  diamondWeight: number,
  certification: string, // "Certified", "GIA Certified", etc.
  imageUrl: string,  // Firebase Storage URL
  createdAt: Timestamp
}
```

### User
```javascript
{
  uid: string,
  email: string,
  role: string  // "admin" or "user"
}
```

### Cart Item
```javascript
{
  id: string,
  ...productData,
  quantity: number
}
```

---

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.js`:
- Extended colors for luxury aesthetic
- Custom spacing
- Typography settings

### Vite
Configured in `vite.config.js`:
- React plugin enabled
- Port set to 3000 (or auto)
- Build optimization

### PostCSS
Standard PostCSS with Tailwind and autoprefixer

---

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Netlify
```bash
npm run build
# Drag & drop 'dist' folder to Netlify
```

### Vercel
```bash
npm run build
# Connect repo to Vercel for auto-deployment
```

---

## 🧪 Testing

### Manual Testing Workflows

**Test 1: User Registration & Login**
1. Go to app home
2. Redirected to login
3. Enter test credentials
4. Click "Sign In"
5. Should be redirected to dashboard

**Test 2: Browse Products**
1. Login as regular user
2. View product grid
3. Apply filters
4. Change sorting
5. Navigate pages

**Test 3: Admin - Add Product**
1. Login as admin
2. Click "Add New Product"
3. Fill form
4. Upload image
5. Submit
6. Verify product appears

**Test 4: Admin - Edit Product**
1. Hover over product
2. Click "Edit"
3. Modify details
4. Submit
5. Verify changes

**Test 5: Add to Cart**
1. Click "Add to Bag"
2. See cart count increase
3. Add more items
4. Count updates correctly

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: "AuthContext not found"
- **Solution**: Ensure App.jsx wraps components with `<AuthProvider>`

**Problem**: Products not loading
- **Solution**: Check Firestore rules, verify Firebase initialization

**Problem**: Images not uploading
- **Solution**: Check Cloud Storage rules, verify file size

**Problem**: Admin features not visible
- **Solution**: Check user has `role: admin` in Firestore

---

## 📈 Performance Optimization

- **Code Splitting**: React Router enables automatic code splitting
- **Lazy Loading**: Images lazy-load in product grid
- **Caching**: Firebase automatically caches data
- **Pagination**: Only loads 12 items per page
- **Memoization**: Components use React.memo where appropriate

---

## 🔒 Security

### Firebase Security Rules
- Firestore: Authenticated users can read products, only admins can write
- Storage: Same as Firestore
- Auth: Email verification recommended for production

### Best Practices Implemented
✅ Protected routes require authentication<br>
✅ Admin operations verify role<br>
✅ Sensitive data never stored in client<br>
✅ Firebase handles password security<br>
✅ No API keys exposed in code<br>

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (4 columns)
- **Large Desktop**: > 1280px (4-5 columns)

---

## 🎯 Future Enhancements

- [ ] Shopping cart persistence to Firestore
- [ ] Checkout flow with payment integration
- [ ] Order management and history
- [ ] User profile and preferences
- [ ] Product reviews and ratings
- [ ] Email notifications
- [ ] Advanced search with filters
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Analytics dashboard

---

## 📚 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x.x",
  "firebase": "^10.x.x",
  "lucide-react": "^0.292.0",
  "tailwindcss": "^3.3.0"
}
```

---

## 🤝 Contributing

This is a demonstration project. Feel free to extend it with additional features!

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 📞 Support

For issues or questions:
1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for setup help
2. Review component code comments
3. Check browser console for errors
4. Verify Firebase configuration

---

## 🎉 Getting Started

1. Complete Firebase setup (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
2. Run `npm run dev`
3. Create test accounts in Firebase
4. Login and explore!

**Happy coding! 🚀**
