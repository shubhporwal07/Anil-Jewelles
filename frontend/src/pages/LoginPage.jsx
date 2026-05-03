import React, { useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Toast from '../components/Toast';
import { getFirebaseErrorMessage } from '../utils/validators';

export default function LoginPage({ onAdminLogin }) {
  const ADMIN_EMAIL = 'admin@gmail.com';
  const ADMIN_PASSWORD = 'admin9876';
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const afterAuthPath = useCallback(() => {
    const raw = searchParams.get('redirect');
    if (!raw) return '/dashboard';
    try {
      const path = decodeURIComponent(raw);
      if (path.startsWith('/') && !path.startsWith('//') && path !== '/') return path;
    } catch {
      /* ignore */
    }
    return '/dashboard';
  }, [searchParams]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

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

    if (isSignup) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 4000);
  };

  const saveCustomerRecord = async (user, isNewAccount = false) => {
    if (!user?.uid || !user?.email) return;
    const record = {
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      role: 'user',
      lastLoginAt: serverTimestamp(),
    };
    if (isNewAccount) record.createdAt = serverTimestamp();
    await setDoc(doc(db, 'users', user.uid), record, { merge: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Admin login
        localStorage.setItem('adminSession', JSON.stringify({
          adminId: ADMIN_EMAIL,
          loginTime: new Date().toISOString(),
          isAdmin: true,
        }));
        if (onAdminLogin) {
          onAdminLogin();
        }
        showToast('Admin login successful! Redirecting...', 'success');
        setTimeout(() => {
          navigate('/admin/panel');
        }, 700);
        return;
      }

      // Regular user login
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveCustomerRecord(result.user);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        navigate(afterAuthPath(), { replace: true });
      }, 1000);
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error) || 'Unable to sign in right now. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveCustomerRecord(result.user, true);
      showToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => {
        navigate(afterAuthPath(), { replace: true });
      }, 1000);
    } catch (error) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email already registered. Please log in instead.'
        : error.code === 'auth/weak-password'
          ? 'Password is too weak. Please use a stronger password.'
          : error.code === 'auth/invalid-email'
            ? 'Invalid email address.'
            : error.message;
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      await saveCustomerRecord(result.user, result._tokenResponse?.isNewUser);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        navigate(afterAuthPath(), { replace: true });
      }, 1000);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        const errorMessage = getFirebaseErrorMessage(error) || 'Google login failed. Please try again.';
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    showToast('Facebook login will be available soon', 'info');
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-xl md:text-2xl font-light tracking-[0.3em] text-slate-900 transition hover:opacity-80">
              <img src="/images/logo.png" alt="Logo" className="h-10 md:h-12 w-auto object-contain rounded-[15px]" />
              ANIL JEWELLER&apos;S
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/dashboard?category=all" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Fine Jewellery</Link>
              <Link to="/dashboard?category=engagement" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Engagement</Link>
              <Link to="/dashboard?category=mens" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Men&apos;s</Link>
              <Link to="/about-us" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">About Us</Link>
            </div>
            <button className="md:hidden text-slate-900" type="button" aria-label="Open navigation">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex p-0">
        <div className="w-full flex-1 bg-white overflow-hidden flex flex-col md:flex-row min-h-full">

          {/* Left Side - Image and Text */}
          <div className="relative w-full md:w-[47%] bg-slate-50 hidden md:block">
            <img
              src="/images/solstice_diamond_ring.png"
              alt="Jewelry"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Better overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8f2e9]/88 via-[#f8f2e9]/45 to-transparent"></div>

            {/* Text */}
            <div className="relative z-10 h-full flex flex-col justify-end px-12 lg:px-20 pb-24 pt-16">

              <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6 leading-tight">
                Timeless Elegance,<br />Trusted Since 2010
              </h2>

              <div className="w-12 h-0.5 bg-[#b59551] mb-6"></div>

              <p className="text-slate-700 text-sm lg:text-base font-medium leading-relaxed max-w-md">
                Discover exquisite jewellery crafted<br />with passion and perfection.
              </p>

            </div>
          </div>

          {/* Right Side - Form */}
          <div
            className="relative w-full md:w-[53%] min-h-[calc(100vh-65px)] md:min-h-0 p-5 sm:p-8 lg:p-12 flex items-center justify-center bg-[#fdfcf9] md:rounded-tl-[36px] md:rounded-bl-[36px] shadow-[-10px_0_35px_rgba(15,23,42,0.08)] overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(circle at 24px 24px, rgba(181,149,81,0.08) 1px, transparent 1px), radial-gradient(circle at 35% 20%, rgba(181,149,81,0.13), transparent 30%), linear-gradient(135deg, rgba(181,149,81,0.08) 0%, rgba(255,255,255,0) 42%)',
              backgroundSize: '42px 42px, cover, cover',
            }}
          >
            <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-[#b59551]/15 blur-3xl"></div>
            <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-white/80 blur-3xl"></div>
            <div className="flex w-full max-w-[512px] min-h-[620px] flex-col rounded-[28px] border border-white/70 bg-white/70 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:px-8 sm:py-10 lg:px-9 lg:py-11">
              <div className="flex w-full mb-7 border-b border-gray-200/80">
                <button
                  onClick={() => {
                    setIsSignup(false);
                    setErrors({});
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className={`flex-1 pb-3 text-xs font-bold tracking-widest ${!isSignup
                    ? 'text-slate-900 border-b-2 border-[#b59551]'
                    : 'text-gray-400 hover:text-slate-700'
                    } transition`}
                >
                  SIGN IN
                </button>
                <button
                  onClick={() => {
                    setIsSignup(true);
                    setErrors({});
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className={`flex-1 pb-3 text-xs font-bold tracking-widest ${isSignup
                    ? 'text-slate-900 border-b-2 border-[#b59551]'
                    : 'text-gray-400 hover:text-slate-700'
                    } transition`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center">
              <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-[2.15rem] font-serif text-slate-900 mb-2 leading-none">
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isSignup ? 'Sign up to explore our collection' : 'Sign in to continue to your account'}
                </p>
              </div>

              <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="you@example.com"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white/70 text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b59551] focus:border-[#b59551] sm:text-sm transition ${errors.email ? 'border-red-500' : 'border-gray-200/80'}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      placeholder="••••••••"
                      className={`block w-full pl-10 pr-10 py-2 border rounded-lg bg-white/70 text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b59551] focus:border-[#b59551] sm:text-sm transition ${errors.password ? 'border-red-500' : 'border-gray-200/80'}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                        }}
                        placeholder="••••••••"
                        className={`block w-full pl-10 pr-10 py-2 border rounded-lg bg-white/70 text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b59551] focus:border-[#b59551] sm:text-sm transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200/80'}`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                  </div>
                )}


                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-[#182235] hover:bg-[#101827] text-white font-semibold py-2.5 px-4 rounded-md transition duration-200 disabled:opacity-50"
                  >
                    {loading
                      ? (isSignup ? 'CREATING ACCOUNT...' : 'SIGNING IN...')
                      : (isSignup ? 'CREATE ACCOUNT' : 'SIGN IN')
                    }
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>

                {!isSignup && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200/80"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-transparent text-[#b59551] font-medium">OR</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex min-h-10 items-center justify-center gap-2 py-2 px-4 border border-gray-200/80 rounded-md bg-white/60 hover:bg-white/85 transition text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  </>
                )}
              </form>
              </div>

              <div className="mt-auto flex items-center justify-center gap-1.5 pt-8 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
