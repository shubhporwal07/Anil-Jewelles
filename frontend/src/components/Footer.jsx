import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, MapPin, X } from 'lucide-react';
import { realtimeDb } from '../config/firebase';
import { ref as rtdbRef, push } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // '' | 'loading' | 'success'
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(''); // '' | 'loading' | 'success'
  const getBackendUrl = () => {
    const raw = (import.meta.env.VITE_BACKEND_URL || '').trim();
    if (!raw) return '';
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return withProtocol.replace(/\/+$/, '');
  };

  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setStatus('loading');
    
    try {
      // 1. Save to Database
      const subscribersRef = rtdbRef(realtimeDb, 'subscribers');
      await push(subscribersRef, {
        email,
        subscribedAt: new Date().toISOString()
      });

      // 2. Send Email via Backend
      const backendUrl = getBackendUrl();
      if (!backendUrl) {
        throw new Error('Backend URL is missing. Set VITE_BACKEND_URL to your deployed backend URL.');
      }
      await fetch(`${backendUrl}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Something went wrong. Please try again.');
      setStatus('');
    }
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Guest';
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const message = feedbackText.trim();

    if (!message) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    setFeedbackStatus('loading');

    try {
      const feedbackRef = rtdbRef(realtimeDb, 'feedback');
      await push(feedbackRef, {
        message,
        userName: getUserName(),
        userEmail: user?.email || '',
        userId: user?.uid || '',
        submittedAt: new Date().toISOString()
      });

      setFeedbackStatus('success');
      setFeedbackText('');
      setTimeout(() => {
        setFeedbackStatus('');
        setIsFeedbackOpen(false);
      }, 1200);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Something went wrong. Please try again.');
      setFeedbackStatus('');
    }
  };

  return (
    <footer className="bg-[#f5f5f5] border-t border-black/10">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand Section */}
          <div className="flex flex-col">
            <h3 className="font-sans text-base font-normal tracking-[0.2em] text-slate-900 mb-4">
              ANIL JEWELLER&apos;S
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Crafting timeless elegance since 2010. Discover our exquisite collection of artisanal jewelry.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h4 className="font-sans text-sm font-semibold tracking-[0.15em] text-slate-900 mb-4 uppercase">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="flex flex-col">
            <h4 className="font-sans text-sm font-semibold tracking-[0.15em] text-slate-900 mb-4 uppercase">
              Collections
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/dashboard?category=Rings"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Rings
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard?category=EarRings"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Earrings
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard?category=Necklace"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Necklaces
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard?category=Engagement"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Engagement
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col">
            <h4 className="font-sans text-sm font-semibold tracking-[0.15em] text-slate-900 mb-4 uppercase">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-slate-600">
                  Bharthana, Etawah, Uttar Pradesh, India
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <a
                  href="tel:+919997364680"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  +91-9997364680
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <a
                  href="mailto:aniljewellersbharthana@gmail.com"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  aniljewellersbharthana@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 sm:my-10 border-t border-black/10" />

        {/* Newsletter Section */}
        <div className="mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <h4 className="font-sans text-sm font-semibold tracking-[0.15em] text-slate-900 mb-3 uppercase">
              Newsletter
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              Subscribe to receive updates on new collections and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm disabled:opacity-50"
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition font-medium text-sm whitespace-nowrap disabled:bg-slate-400"
              >
                {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-emerald-600 text-xs mt-2 font-medium">
                Thank you for subscribing to our newsletter!
              </p>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-black/10 pt-6 sm:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <p>© {currentYear} Anil Jeweller&apos;s. All rights reserved.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
              <Link to="/privacy-policy" className="hover:text-slate-900 transition">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-slate-900 transition">
                Terms of Service
              </Link>
              <Link to="/return-policy" className="hover:text-slate-900 transition">
                Return Policy
              </Link>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="text-left hover:text-slate-900 transition"
              >
                Give Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFeedbackOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Give Feedback</h3>
              <button
                type="button"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setFeedbackStatus('');
                }}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close feedback form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your feedback..."
                rows={5}
                maxLength={600}
                disabled={feedbackStatus === 'loading' || feedbackStatus === 'success'}
                className="w-full resize-none rounded-md border border-black/10 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-slate-900 disabled:opacity-60"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Posting as {getUserName()}
                </p>
                <button
                  type="submit"
                  disabled={feedbackStatus === 'loading' || feedbackStatus === 'success'}
                  className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {feedbackStatus === 'loading' ? 'Submitting...' : feedbackStatus === 'success' ? 'Submitted!' : 'Submit'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
