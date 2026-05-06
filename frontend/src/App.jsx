import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { PageSkeletonLoader } from './components/SkeletonLoader';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

function PageShell({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function AppRoutes({ isAdminLoggedIn, setIsAdminLoggedIn }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageSkeletonLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* User Login Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <PageShell>
                  <LoginPage onAdminLogin={() => setIsAdminLoggedIn(true)} />
                </PageShell>
              </PublicRoute>
            }
          />

          {/* Landing Page - always at / */}
          <Route
            path="/"
            element={
              <PageShell>
                <LandingPage />
              </PageShell>
            }
          />

          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageShell>
                  <DashboardPage />
                </PageShell>
              </ProtectedRoute>
            }
          />

          {/* Cart Route */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <PageShell>
                  <CartPage />
                </PageShell>
              </ProtectedRoute>
            }
          />

          {/* Orders Route */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <PageShell>
                  <OrdersPage />
                </PageShell>
              </ProtectedRoute>
            }
          />

          {/* About Us Route */}
          <Route
            path="/about-us"
            element={
              <ProtectedRoute>
                <PageShell>
                  <AboutUsPage />
                </PageShell>
              </ProtectedRoute>
            }
          />

          {/* Policy Routes (Publicly Accessible) */}
          <Route
            path="/privacy-policy"
            element={
              <PageShell>
                <PrivacyPolicy />
              </PageShell>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <PageShell>
                <TermsOfService />
              </PageShell>
            }
          />
          <Route
            path="/return-policy"
            element={
              <PageShell>
                <ReturnPolicy />
              </PageShell>
            }
          />

          {/* Admin Route via sign-in credentials */}
          <Route
            path="/admin/panel"
            element={
              isAdminLoggedIn ? (
                <PageShell>
                  <AdminPanel onLogout={() => setIsAdminLoggedIn(false)} />
                </PageShell>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin session on app load
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      setIsAdminLoggedIn(false);
      setIsLoading(false);
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      setIsAdminLoggedIn(!!session?.isAdmin);
    } catch {
      localStorage.removeItem('adminSession');
      setIsAdminLoggedIn(false);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <PageSkeletonLoader />;
  }

  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <AppRoutes isAdminLoggedIn={isAdminLoggedIn} setIsAdminLoggedIn={setIsAdminLoggedIn} />
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
