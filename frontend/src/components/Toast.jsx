import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'error', show = true, onClose }) {
  useEffect(() => {
    if (!show || !message) return undefined;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose, show]);

  if (!show || !message) return null;

  const styles = {
    error: {
      bg: 'bg-white',
      border: 'border-red-100',
      icon: 'text-red-500',
      accent: 'bg-red-500',
      shadow: 'shadow-[0_8px_30px_rgb(239,68,68,0.12)]'
    },
    success: {
      bg: 'bg-white',
      border: 'border-emerald-100',
      icon: 'text-emerald-500',
      accent: 'bg-emerald-500',
      shadow: 'shadow-[0_8px_30px_rgb(16,185,129,0.12)]'
    },
    info: {
      bg: 'bg-white',
      border: 'border-slate-100',
      icon: 'text-slate-500',
      accent: 'bg-slate-900',
      shadow: 'shadow-[0_8px_30px_rgb(15,23,42,0.1)]'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-6 right-6 z-[100] w-full max-w-sm overflow-hidden rounded-xl border ${style.border} ${style.bg} ${style.shadow}`}
    >
      <div className={`h-1 w-full ${style.accent}`} />
      <div className="flex items-center gap-4 p-4">
        <div className={`flex-shrink-0 ${style.icon}`}>
          {type === 'success' && <CheckCircle className="h-5 w-5" />}
          {type === 'error' && <AlertCircle className="h-5 w-5" />}
          {type === 'info' && <Info className="h-5 w-5" />}
        </div>
        
        <p className="flex-1 text-sm font-medium text-slate-800">{message}</p>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
