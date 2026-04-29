# LUMIÈRE Login Page - Setup Guide

A pixel-perfect React login page with Firebase authentication integration, built for a luxury jewelry brand.

## 📦 Installation

### 1. Install Dependencies

```bash
npm install react react-dom firebase lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### 2. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        blue: {
          950: '#0a1e3f',
          900: '#1e3a5f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

### 3. Update `index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}
```

## 🔥 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Authentication > Email/Password & Google Sign-In

### 2. Get Firebase Config

In Firebase Console:
- Project Settings > Your apps > Web
- Copy the config object

### 3. Set Environment Variables

Create `.env.local` in your project root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Enable Google Sign-In in Firebase

1. Firebase Console > Authentication > Sign-in method
2. Enable "Google"
3. Add your domain to authorized domains (localhost:3000 for development)

### 5. Facebook Login (Optional)

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com/)
2. Get your App ID and Secret
3. Configure App Domains
4. In Firebase, enable Facebook provider with the App ID

To implement Facebook login, update `LoginPage.jsx`:

```javascript
import { FacebookAuthProvider } from 'firebase/auth';

const handleFacebookLogin = async () => {
  setLoading(true);
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    showToast('Login successful!', 'success');
    console.log('User logged in with Facebook:', result.user);
  } catch (error) {
    console.error('Facebook login error:', error);
    if (error.code !== 'auth/popup-closed-by-user') {
      showToast('Facebook login failed. Please try again.', 'error');
    }
  } finally {
    setLoading(false);
  }
};
```

## 📁 File Structure

```
src/
├── LoginPage.jsx        # Main login component
├── Toast.jsx            # Toast notification component
├── index.css            # Global styles (Tailwind)
└── App.jsx             # App component
```

## 🎨 Customization

### Change Background Image

In `LoginPage.jsx`, update the background image URL:

```javascript
<div className="min-h-screen w-full bg-cover bg-center bg-no-repeat" 
  style={{
    backgroundImage: 'url(YOUR_IMAGE_URL)'
  }}>
```

**Recommended sources:**
- Unsplash: https://unsplash.com (photographer-credit required in commercial use)
- Pexels: https://pexels.com (free for commercial use)
- Pixels: https://pixabay.com (free for commercial use)

### Customize Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  blue: {
    950: '#your_dark_blue',
    900: '#your_light_blue',
  },
}
```

### Change Typography

The component uses:
- **Serif**: Playfair Display (headlines)
- **Sans-serif**: Inter (body text)

To use different fonts, update `index.css` and `tailwind.config.js` fontFamily.

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env.local` - add it to `.gitignore`
2. **Firebase Rules**: Set up Firestore/Realtime Database rules
3. **CORS**: Configure CORS in Firebase if needed
4. **Rate Limiting**: Firebase Authentication includes built-in rate limiting
5. **HTTPS**: Always use HTTPS in production
6. **Password Rules**: Consider enforcing strong password requirements

## 🚀 Usage

### Import in Your App

```javascript
import LoginPage from './LoginPage';

function App() {
  return <LoginPage />;
}

export default App;
```

### Handle Authentication State

```javascript
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? <Dashboard /> : <LoginPage />;
}
```

## ✨ Features

- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Facebook Sign-In (ready to implement)
- ✅ Form validation (email format, password length)
- ✅ Error handling with user-friendly messages
- ✅ Loading state with spinner
- ✅ Password visibility toggle
- ✅ Toast notifications
- ✅ Responsive design (mobile-first)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Firebase persistence (remembers logged-in user)

## 🎯 Form Validation

The component validates:

- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters

Customize validation in the `validateForm()` function:

```javascript
const validateForm = () => {
  const newErrors = {};

  if (!email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  if (!password) {
    newErrors.password = 'Password is required';
  } else if (password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## 🐛 Error Handling

Firebase error codes handled:
- `auth/user-not-found` → "No account found with this email"
- `auth/wrong-password` → "Incorrect password"
- `auth/invalid-email` → "Invalid email format"
- `auth/user-disabled` → "This account has been disabled"
- `auth/popup-closed-by-user` → (silent, user cancelled popup)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (single column, full width inputs)
- **Tablet**: 640px - 1024px (card width adjusts)
- **Desktop**: > 1024px (optimized navigation, max card width)

## 🔗 Navigation Links

Update these routes in your app:
- `/forgot-password` - Password recovery page
- `/signup` - Create account page
- `/dashboard` - After successful login

## 📚 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.0 | UI library |
| firebase | ^9.0+ | Authentication |
| lucide-react | ^0.200+ | Icons (Eye, EyeOff, CheckCircle, etc.) |
| tailwindcss | ^3.0+ | Styling |

## 🎯 Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure environment variables
3. ✅ Install dependencies
4. ✅ Integrate LoginPage component
5. ✅ Create signup and forgot password pages
6. ✅ Set up authentication state management
7. ✅ Deploy to production

## 📄 License

Free to use for commercial and personal projects.

## 💡 Support & Customization

For any modifications:
- Update component props to pass custom colors/text
- Extend error handling for additional use cases
- Add two-factor authentication using Firebase
- Integrate with your backend API
- Add remember-me functionality
