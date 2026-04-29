import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { SkeletonCardGrid } from './SkeletonLoader';
import { useProducts } from '../contexts/ProductContext';

export default function ProductGrid({ onViewDetails, onEdit, onDelete, isAdmin = false }) {
  const {
    paginatedProducts,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredProducts,
    itemsPerPage,
    loading,
    sortBy,
    setSortBy,
  } = useProducts();

  if (loading) {
    return (
      <div className="min-w-0 flex-1 py-2" aria-label="Loading products">
        <div className="mb-6 flex flex-col gap-4 border-b border-black/10 bg-[#f5f5f5] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-44 rounded-md bg-slate-200/80" />
          <div className="flex gap-4">
            <div className="h-10 w-32 rounded-md bg-slate-200/80" />
            <div className="h-10 w-40 rounded-md bg-slate-200/80" />
          </div>
        </div>
        <SkeletonCardGrid count={6} />
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="text-center">
          <p className="font-serif text-xl text-slate-900">No products found</p>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  const isDateSort = sortBy === 'newest' || sortBy === 'oldest';
  const dateValue = sortBy === 'oldest' ? 'oldest' : 'newest';

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-6 flex flex-col gap-3 border-b border-black/10 bg-[#f5f5f5] pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-slate-600">
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {startItem} of {filteredProducts.length}
          </span>{' '}
          items
        </p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex-1 sm:flex-none flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Sort:</label>
            <div className="relative w-full sm:w-auto">
              <select
                value={dateValue}
                onChange={(e) => {
                  const v = e.target.value;
                  setSortBy(v === 'oldest' ? 'oldest' : 'newest');
                }}
                className="w-full min-w-[120px] sm:min-w-[140px] cursor-pointer appearance-none rounded-md border border-black/10 bg-[#f5f5f5] py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            </div>
          </div>

          <div className="flex-1 sm:flex-none flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Price:</label>
            <div className="relative w-full sm:w-auto">
              <select
                value={isDateSort ? '' : sortBy === 'price-high' ? 'price-high' : 'price-low'}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'price-high') setSortBy('price-high');
                  if (v === 'price-low') setSortBy('price-low');
                }}
                className="w-full min-w-[120px] sm:min-w-[180px] cursor-pointer appearance-none rounded-md border border-black/10 bg-[#f5f5f5] py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {isDateSort && <option value="">Sort by price...</option>}
                <option value="price-high">High to Low</option>
                <option value="price-low">Low to High</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 justify-center justify-items-center gap-6 sm:gap-8 sm:grid-cols-[repeat(auto-fit,minmax(320px,320px))]">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-10">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-md border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`h-10 min-w-[2.5rem] rounded-md text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-md border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>
        </div>
      )}
    </div>
  );
}
