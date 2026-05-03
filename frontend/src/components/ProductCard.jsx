import React from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';

export default function ProductCard({ product, onViewDetails, onEdit, onDelete, isAdmin = false }) {
  const { addToCart } = useProducts();

  const openDetails = () => {
    onViewDetails(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.inStock === false) return;
    addToCart(product);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      await onDelete(product.id);
    }
  };

  const formatInr = (price) => {
    const n = Number(price) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const imgSrc =
    (Array.isArray(product.imageDatas) && product.imageDatas[0]) ||
    product.imageData ||
    product.imageUrl ||
    'https://via.placeholder.com/400x400?text=ANIL+JEWELLERS';

  const isSoldOut = product.inStock === false;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.99 }}
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
      className={`group mx-auto flex h-full w-full max-w-[320px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f5f5f5] shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)] sm:w-[320px] ${isSoldOut ? 'opacity-55 grayscale-[30%]' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-black/5">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {/* Sold Out Overlay */}
        {isSoldOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 z-10 overflow-hidden bg-black/30 backdrop-blur-[2px]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.06)_38%,rgba(0,0,0,0.08)_100%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-center rounded-lg border-2 border-white/85 bg-slate-900/88 px-4 py-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] sm:px-6 sm:py-2"
              >
                <span className="text-sm font-bold uppercase tracking-[0.32em] text-white sm:text-base">
                  Sold Out
                </span>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 12, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
              className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-stone-700 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              Sold Out
            </motion.div>
          </motion.div>
        )}
        {isAdmin && (
          <div className="absolute left-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="font-serif text-lg leading-snug text-slate-900 line-clamp-2">{product.name}</h3>
          <p className="mt-1.5 text-sm text-slate-500">
            {product.metalType || '—'}
            {product.certification ? ` · ${product.certification}` : ''}
          </p>
        </div>
        <div>
          <div className="mt-4">
            <p className="text-lg font-semibold tracking-tight text-slate-900">{formatInr(product.price)}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">India (INR)</p>
          </div>
          <div className="mt-5 flex gap-3">
            {isSoldOut ? (
              <button
                type="button"
                disabled
                className="flex-1 rounded-xl bg-slate-400 py-2.5 text-sm font-semibold text-white cursor-not-allowed opacity-80"
              >
                Sold Out
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add to Bag
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDetails();
              }}
              className="flex-1 rounded-xl border border-slate-900 bg-[#f5f5f5] py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-black/5"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
