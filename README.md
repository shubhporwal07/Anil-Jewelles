# Anil jeweller's - Luxury Jewelry Login Page

A pixel-perfect, production-ready React login component for the Anil jeweller's a jewelry brand. Built with modern React, Firebase Authentication, Tailwind CSS, and featuring responsive design with accessibility in mind.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2+-61dafb.svg)
![Firebase](https://img.shields.io/badge/firebase-10.7+-ffa726.svg)

## 🎯 Features

### Authentication
- ✅ **Email & Password Login** - Firebase Authentication integration
- ✅ **Google Sign-In** - One-click OAuth login
- ✅ **Facebook Sign-In** - Ready for implementation
- ✅ **Session Persistence** - User stays logged in across browser sessions
- ✅ **Remember Me** - Browser local storage persistence

### Form & Validation
- ✅ **Form Validation** - Email format and password strength checks
- ✅ **Error Messages** - Clear, user-friendly error feedback
- ✅ **Real-time Validation** - Errors clear on input focus
- ✅ **Disabled State** - All inputs disabled during login

### User Experience
- ✅ **Password Toggle** - Show/hide password with icon
- ✅ **Loading State** - Animated spinner during login
- ✅ **Toast Notifications** - Success/error messages with auto-dismiss
- ✅ **Keyboard Navigation** - Fully keyboard accessible
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

### Design
- ✅ **Luxury Theme** - Elegant, minimal design for jewelry brand
- ✅ **Tailwind CSS** - Modern utility-first styling
- ✅ **Custom Typography** - Playfair Display & Inter fonts
- ✅ **Soft Shadows** - Subtle, professional appearance
- ✅ **Smooth Animations** - Fade-in effects and transitions

### Accessibility
- ✅ **ARIA Labels** - Proper semantic HTML
- ✅ **Keyboard Support** - Tab navigation and Enter to submit
- ✅ **Focus Management** - Clear focus indicators
- ✅ **Color Contrast** - WCAG compliant text colors
- ✅ **Screen Reader Ready** - Descriptive labels and alt text

## 📦 Project Structure

```
lumiere-login/
├── public/
├── src/
│   ├── LoginPage.jsx          # Main login component
│   ├── Toast.jsx              # Toast notification component
│   ├── App.jsx                # App wrapper with auth state
│   ├── index.css              # Global Tailwind styles
│   └── main.jsx               # React entry point
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── package.json               # Dependencies & scripts
├── .env.example               # Firebase config template
├── SETUP_GUIDE.md             # Detailed setup instructions
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password and Google authentication
3. Copy your Firebase config

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## 🔧 Configuration

### Firebase Setup

**Enable Email/Password Authentication:**
1. Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password"
3. Save

**Enable Google Sign-In:**
1. Firebase Console → Authentication → Sign-in method
2. Click "Google"
3. Add your domain to authorized domains
4. Save

**Enable Facebook Login (Optional):**
1. Create app at [developers.facebook.com](https://developers.facebook.com/)
2. Get App ID and Secret
3. Add redirect URIs
4. Firebase Console → Authentication → Add Facebook provider
5. Enter App ID and Secret

### Customize Styling

**Update Colors:**
Edit `tailwind.config.js`:
```javascript
colors: {
  blue: {
    950: '#your_color',  // Primary (button)
    900: '#your_color',  // Hover state
  },
}
```

**Change Fonts:**
1. Update `index.css` @import URLs
2. Update `tailwind.config.js` fontFamily section

**Change Background:**
In `LoginPage.jsx`, update background image URL:
```javascript
backgroundImage: 'url(YOUR_NEW_IMAGE_URL)'
```

## 📝 Component API

### LoginPage.jsx

Main login component with all authentication logic.

**Props:** None (uses Firebase directly)

**State:**
- `email` - User email input
- `password` - User password input
- `showPassword` - Password visibility toggle
- `loading` - Login in progress
- `errors` - Form validation errors
- `toast` - Notification message

**Functions:**
- `handleLogin(e)` - Email/password login
- `handleGoogleLogin()` - Google OAuth login
- `handleFacebookLogin()` - Facebook OAuth login (stub)
- `validateForm()` - Form validation
- `showToast(message, type)` - Display notification

### Toast.jsx

Reusable toast notification component.

**Props:**
- `message` (string) - Notification text
- `type` (enum) - 'success', 'error', or 'info'
- `onClose` (function) - Close callback

**Example:**
```javascript
<Toast
  message="Login successful!"
  type="success"
  onClose={() => setShow(false)}
/>
```

## 🔐 Security

### Best Practices Implemented

1. **Firebase Security Rules** - Configured for secure data access
2. **Environment Variables** - Sensitive data never in code
3. **HTTPS Only** - Required for production
4. **Password Requirements** - Minimum 6 characters
5. **Rate Limiting** - Firebase built-in protection
6. **No Password Storage** - Delegated to Firebase
7. **Session Persistence** - Browser local storage

### Additional Recommendations

1. **Add 2FA** - Two-factor authentication
2. **Email Verification** - Verify user email
3. **Anti-Bot** - Consider reCAPTCHA for production
4. **CORS Headers** - Configure for API calls
5. **CSP Headers** - Content Security Policy
6. **API Keys** - Restrict Firebase API keys

## 🎨 Customization Guide

### Change Login Title

In `LoginPage.jsx`:
```javascript
<h1 className="text-2xl md:text-3xl font-light tracking-wide text-center text-gray-900 mb-2">
  YOUR CUSTOM TITLE
</h1>
```

### Add Custom Fields

Example: Add "Remember Me" checkbox:
```javascript
const [rememberMe, setRememberMe] = useState(false);

// In form:
<div className="flex items-center">
  <input
    type="checkbox"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
    className="h-4 w-4"
  />
  <label className="ml-2">Remember me</label>
</div>
```

### Redirect After Login

In `handleLogin()` success callback:
```javascript
// Instead of console.log, redirect:
setTimeout(() => {
  window.location.href = '/dashboard';
}, 1000);
```

### Add Password Recovery

Create new file `ForgotPassword.jsx` and import in `App.jsx`.

## 📱 Responsive Breakpoints

- **Mobile (< 640px):** Full-width card, stacked layout
- **Tablet (640-1024px):** Medium card, adjusted padding
- **Desktop (> 1024px):** Optimized layout, navigation visible

## 🧪 Testing

### Manual Testing Checklist

- [ ] Email login with valid credentials
- [ ] Email login with invalid credentials
- [ ] Password visibility toggle works
- [ ] Form validation shows errors
- [ ] Google login flow works
- [ ] Toast notifications display correctly
- [ ] Page is responsive on mobile
- [ ] Tab navigation works
- [ ] Keyboard Enter submits form
- [ ] Loading spinner displays

### Unit Testing Example

```javascript
import { render, screen } from '@testing-library/react';
import LoginPage from './LoginPage';

test('renders email input', () => {
  render(<LoginPage />);
  const emailInput = screen.getByLabelText(/email address/i);
  expect(emailInput).toBeInTheDocument();
});
```

## 📚 API Reference

### Firebase Methods Used

```javascript
// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Authentication
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
```

## 🐛 Troubleshooting

### "Firebase is not initialized"
- Ensure `.env.local` has correct credentials
- Check Firebase project exists and is enabled

### "Google login popup blocked"
- Check browser popup settings
- Ensure domain is in Firebase authorized domains
- Use HTTPS in production

### "Tailwind styles not loading"
- Run `npm install` to ensure all packages installed
- Restart development server after config changes
- Check `postcss.config.js` has both tailwindcss and autoprefixer

### "Form validation not clearing"
- Component clears errors on input change
- Check `onChange` handlers are properly setting state

## 🚢 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
1. Connect GitHub repo to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📄 License

This component is free to use for commercial and personal projects.

## 🤝 Contributing

Feel free to fork, modify, and use this component in your projects. Attribution is appreciated but not required.

## 📞 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Review Firebase documentation: [firebase.google.com](https://firebase.google.com/docs)
3. Check Tailwind CSS: [tailwindcss.com](https://tailwindcss.com/docs)

## 🎯 Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email verification
- [ ] Account recovery flow
- [ ] Social login with more providers
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Phone number authentication
- [ ] Biometric login

---

Built with ❤️ for luxury brands.
