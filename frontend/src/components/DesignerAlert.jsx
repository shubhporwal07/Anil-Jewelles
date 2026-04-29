import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function DesignerAlert({ isOpen, message, onClose, title = "Attention Required" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[5px]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 2 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar - Premium Gold Gradient */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#F9E2AF] to-[#D4AF37]" />
            
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
                >
                  <AlertCircle className="h-10 w-10" strokeWidth={1.5} />
                </motion.div>
                
                <h3 className="mb-3 font-serif text-2xl font-medium tracking-tight text-slate-900">
                  {title}
                </h3>
                
                <p className="mb-10 text-sm leading-relaxed text-slate-500">
                  {message}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#0f172a" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold tracking-[0.1em] text-white shadow-xl transition-all"
                >
                  UNDERSTOOD
                </motion.button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
