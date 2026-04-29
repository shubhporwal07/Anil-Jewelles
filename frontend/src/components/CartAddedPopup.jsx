import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

export default function CartAddedPopup({ productName, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2600);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="pointer-events-auto fixed bottom-6 right-6 z-[70] w-[calc(100%-2rem)] max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 p-4 shadow-[0_22px_45px_rgba(16,185,129,0.22)]">
        <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-emerald-200/40" aria-hidden />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-emerald-700 transition hover:bg-emerald-200/40"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="min-w-0 pr-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
              <CheckCircle2 className="h-4 w-4" />
              Added to bag
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-emerald-900/90">{productName}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
