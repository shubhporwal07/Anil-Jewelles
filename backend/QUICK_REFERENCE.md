# LUMIÈRE Login Page - Developer Quick Reference

## 📁 File Overview

| File | Purpose | Status |
|------|---------|--------|
| `LoginPage.jsx` | Main login component (standalone) | ✅ Complete |
| `EnhancedLoginPage.jsx` | Advanced version with hooks/validators | ✅ Complete |
| `Toast.jsx` | Toast notification component | ✅ Complete |
| `App.jsx` | App wrapper with auth state | ✅ Complete |
| `AuthContext.jsx` | Global auth state management | ✅ Complete |
| `useForm.js` | Custom form state hook | ✅ Complete |
| `validators.js` | Validation utilities | ✅ Complete |
| `index.css` | Global styles + Tailwind | ✅ Complete |
| `tailwind.config.js` | Tailwind configuration | ✅ Complete |
| `vite.config.js` | Vite build configuration | ✅ Complete |
| `.env.example` | Environment variables template | ✅ Complete |

## 🚀 Quick Start

### 1. Install & Run
```bash
npm install
cp .env.example .env.local
# Add your Firebase credentials to .env.local
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy
```bash
# Choose one:
npm install -g vercel && vercel          # Vercel
npm install -g firebase-tools && firebase deploy  # Firebase Hosting
# Or use Netlify dashboard
```

## 🔧 Configuration Quick Links

### Firebase Setup
1. [Firebase Console](https://console.firebase.google.com)
2. Create project → Add app
3. Copy config to `.env.local`
4. Enable Email/Password auth
5. Enable Google Sign-In

### Environment Variables Needed
```env
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
```

## 🎨 Common Customizations

### Change Brand Color
```javascript
// In tailwind.config.js
colors: {
  blue: {
    950: '#1a1a2e',  // Your dark color
    900: '#16213e',  // Your medium color
  }
}
```

### Change Background Image
```javascript
// In LoginPage.jsx, line ~180
backgroundImage: 'url(YOUR_IMAGE_URL)'
```

### Change Logo Text
```javascript
// In LoginPage.jsx, line ~155
<div className="text-2xl font-light tracking-[0.3em]">
  YOUR BRAND NAME
</div>
```

### Add Signup Page Route
```javascript
// In App.jsx
import SignupPage from './SignupPage';

// Replace login with:
return user ? <Dashboard /> : <SignupPage />;
```

## 📚 Component Usage Examples

### Basic Usage
```javascript
import LoginPage from './LoginPage';

function App() {
  return <LoginPage />;
}
```

### With Auth Provider
```javascript
import { AuthProvider } from './AuthContext';
import App from './App';

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
```

### Using useAuth Hook
```javascript
import { useAuth } from './AuthContext';

function ProtectedPage() {
  const { user, login, logout } = useAuth();
  
  if (!user) return <LoginPage />;
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using useForm Hook
```javascript
import { useForm } from './useForm';

function MyForm() {
  const form = useForm(
    { email: '', password: '' },
    async (values) => {
      // Handle submit
      console.log(values);
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
      />
      {form.errors.email && <p>{form.errors.email}</p>}
      <button type="submit" disabled={form.isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

## 🔐 Firebase Error Codes

| Code | Message | How to Fix |
|------|---------|-----------|
| `auth/user-not-found` | No account exists | Guide user to signup |
| `auth/wrong-password` | Incorrect password | Suggest "Forgot password?" |
| `auth/invalid-email` | Email format wrong | Check email validation |
| `auth/user-disabled` | Account disabled | Contact support |
| `auth/too-many-requests` | Rate limited (120 sec) | Disable button temporarily |
| `auth/weak-password` | Password too weak | Enforce minimum requirements |
| `auth/email-already-in-use` | Email exists | On signup, offer login link |

## 💾 State Management Pattern

### Local State (useLoginPage)
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({});
```

### Global State (AuthContext)
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

### Form State (useForm)
```javascript
const form = useForm(
  initialValues,
  onSubmit
);
// Access: form.values, form.errors, form.isSubmitting
```

## 🎯 Validation Rules

### Email
- Required ✓
- Must match: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Max 254 characters (RFC 5321)

### Password (Basic)
- Required ✓
- Minimum 6 characters
- No maximum limit

### Password (Strong - Optional)
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🔗 API Methods Reference

### Authentication
```javascript
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const auth = getAuth();

// Email/Password login
await signInWithEmailAndPassword(auth, email, password);

// Google login
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);

// Check auth state
onAuthStateChanged(auth, (user) => { ... });

// Logout
await signOut(auth);
```

### Form Validation
```javascript
import { validateEmail, validatePassword } from './validators';

validateEmail(email);  // boolean
validatePassword(password);  // { isValid: boolean, errors: [] }
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Default: mobile < 640px */
/* md: tablet 640px - 1024px */
/* lg: desktop > 1024px */

/* Usage in component */
className="text-sm md:text-base lg:text-lg"
```

## 🧪 Testing Checklist

### Authentication
- [ ] Email/password login works
- [ ] Invalid email rejected
- [ ] Weak password rejected
- [ ] Google login works
- [ ] Facebook login works (if implemented)
- [ ] Logout clears session
- [ ] Remember me works (optional)

### UI/UX
- [ ] Form validation shows errors
- [ ] Loading spinner displays
- [ ] Toast notifications work
- [ ] Password visibility toggle works
- [ ] Forgot password link navigates
- [ ] Create account link navigates

### Responsive
- [ ] Mobile view (375px)
- [ ] Tablet view (768px)
- [ ] Desktop view (1920px)
- [ ] Touch targets >= 44x44px

### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order is correct
- [ ] Labels associated with inputs
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader compatible

## 🚨 Common Issues & Fixes

### "Firebase not initialized"
```javascript
// Ensure this is in LoginPage.jsx
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

### "Google popup blocked"
```javascript
// Ensure domain is in Firebase authorized domains
// Firebase Console > Settings > Authorized domains
// Add: localhost:3000 (dev), yourdomain.com (prod)
```

### "Tailwind not loading"
```bash
# Restart dev server after any config changes
npm run dev
```

### "Environment variables not found"
```bash
# Must be prefixed with REACT_APP_
# Must restart dev server after changes
npm run dev
```

## 📊 Performance Optimization

### Code Splitting
```javascript
// Lazy load non-critical pages
const Dashboard = lazy(() => import('./Dashboard'));
const AdminPanel = lazy(() => import('./AdminPanel'));
```

### Image Optimization
```javascript
// Use compressed, responsive images
// Consider using Next.js Image component in production
<img src={url} alt="description" loading="lazy" />
```

### Bundle Size
```bash
# Check bundle size
npm run build
# Should be < 100KB for login page alone
```

## 🔗 Useful Links

- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hooks API](https://react.dev/reference/react/hooks)
- [Vite Guide](https://vitejs.dev/guide/)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

## 💡 Pro Tips

1. **Use localStorage for persist data**
   ```javascript
   localStorage.setItem('rememberEmail', email);
   localStorage.getItem('rememberEmail');
   ```

2. **Add redirect after login**
   ```javascript
   window.location.href = '/dashboard';
   // Or with React Router:
   navigate('/dashboard');
   ```

3. **Show loading skeletons**
   ```javascript
   if (authLoading) return <LoadingSkeleton />;
   ```

4. **Handle offline users**
   ```javascript
   if (!navigator.onLine) {
     showToast('You are offline', 'error');
   }
   ```

5. **Add session timeout**
   ```javascript
   setTimeout(() => {
     signOut(auth);
     showToast('Session expired', 'info');
   }, 30 * 60 * 1000); // 30 minutes
   ```

## 📝 Commit Message Examples

```bash
git commit -m "feat: add email/password authentication"
git commit -m "fix: resolve firebase initialization error"
git commit -m "style: update login card border-radius"
git commit -m "refactor: extract form validation logic"
git commit -m "docs: add Firebase setup guide"
```

## 🎯 Next Steps After Setup

1. ✅ Set up Firebase project
2. ✅ Install dependencies
3. ✅ Configure environment variables
4. ✅ Test login locally
5. → Create signup page
6. → Create forgot password page
7. → Add email verification
8. → Set up password reset email
9. → Add 2FA support
10. → Deploy to production

---

**Last Updated:** March 30, 2026
**Version:** 1.0.0
