import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { LogIn, LogOut, Menu, ShoppingBag, X, Package } from 'lucide-react';

const navLinkClass =
  'text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors';

export default function Navbar() {
  const { logout, user, isAdmin } = useAuth();
  const { cartItems } = useProducts();
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Use window.location.href for a full page refresh/redirect to home
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-black/10 bg-[#f5f5f5]"
    >
      <nav className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[56px] sm:h-[72px] items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center sm:gap-3">
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity flex-shrink-0"
              onClick={closeMobile}
              title="Go to home page"
            >
              <img src="/images/logo.png" alt="Logo" className="h-12 sm:h-16 w-auto object-contain rounded-[15px]" />
            </Link>
            <Link
              to="/"
              className="font-sans text-[13px] sm:text-lg font-normal tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 hover:opacity-80 transition-opacity flex-1 text-center sm:text-left sm:flex-none"
              onClick={closeMobile}
            >
              ANIL JEWELLER&apos;S
            </Link>
          </div>

          {user && (
            <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
              <Link to="/dashboard?category=all" className={navLinkClass}>
                Fine Jewellery
              </Link>
              <Link to="/dashboard?category=engagement" className={navLinkClass}>
                Engagement
              </Link>
              <Link to="/dashboard?category=mens" className={navLinkClass}>
                Men&apos;s
              </Link>
              <Link to="/about-us" className={navLinkClass}>
                About Us
              </Link>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {user && (
              <Link
                to="/cart"
                className="relative hidden p-2 text-slate-700 transition hover:text-slate-900 sm:block"
                title="Cart"
                aria-label="Shopping bag"
                onClick={closeMobile}
              >
                <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
                {totalCartItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <Link
                to="/orders"
                className="hidden p-2 text-slate-700 transition hover:text-slate-900 sm:block"
                title="My Orders"
                aria-label="My orders"
                onClick={closeMobile}
              >
                <Package className="h-6 w-6" strokeWidth={1.5} />
              </Link>
            )}

            {user ? (
              <div className="hidden items-center border-l border-slate-200 pl-4 sm:flex">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  title="Logout"
                  aria-label="Logout"
                >
                  <span>Logout</span>
                  <LogOut className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-2 border-l border-slate-200 pl-4 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:flex"
                title="Login"
                aria-label="Login"
                onClick={closeMobile}
              >
                <span>Login</span>
                <LogIn className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            )}

            {/* Mobile: show cart icon inline (always visible) */}
            {user && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-700 transition hover:text-slate-900 sm:hidden"
                title="Cart"
                aria-label="Shopping bag"
                onClick={closeMobile}
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {totalCartItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-slate-900 px-0.5 text-[9px] font-semibold text-white">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              className="rounded-full p-2 text-slate-700 md:hidden"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-slate-100 py-2 md:hidden">
            <div className="flex flex-col">
              {user && (
                <>
                  <Link
                    to="/dashboard?category=all"
                    className="py-2 text-sm font-medium text-slate-600"
                    onClick={closeMobile}
                  >
                    Fine Jewellery
                  </Link>
                  <Link
                    to="/dashboard?category=engagement"
                    className="py-2.5 text-sm font-medium text-slate-600"
                    onClick={closeMobile}
                  >
                    Engagement
                  </Link>
                  <Link
                    to="/dashboard?category=mens"
                    className="py-2.5 text-sm font-medium text-slate-600"
                    onClick={closeMobile}
                  >
                    Men&apos;s
                  </Link>
                  <Link
                    to="/about-us"
                    className="py-2.5 text-sm font-medium text-slate-600"
                    onClick={closeMobile}
                  >
                    About Us
                  </Link>

                  {/* Divider before utility links */}
                  <div className="my-1 border-t border-slate-100" />

                  <Link
                    to="/cart"
                    className="flex items-center gap-3 py-2 text-sm font-medium text-slate-800"
                    onClick={closeMobile}
                  >
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                    Shopping Bag
                    {totalCartItems > 0 && (
                      <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold text-white">
                        {totalCartItems}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 py-2.5 text-sm font-medium text-slate-800"
                    onClick={closeMobile}
                  >
                    <Package className="h-4 w-4" strokeWidth={1.5} />
                    My Orders
                  </Link>
                </>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                  onClick={closeMobile}
                  aria-label="Log in"
                  title="Log in"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.5} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex justify-end border-t border-slate-100 py-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Admin
            </span>
          </div>
        )}
      </nav>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25"
          >
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-slate-800 shadow-lg"
            >
              Logging out...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
