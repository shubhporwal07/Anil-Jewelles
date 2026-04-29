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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-slate-900/90 text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] px-5 py-2 rounded-full border border-white/20">
              Sold Out
            </span>
          </div>
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
