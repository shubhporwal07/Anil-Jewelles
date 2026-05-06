import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import Navbar from '../components/Navbar';
import SidebarFilters from '../components/SidebarFilters';
import ProductGrid from '../components/ProductGrid';
import AdminAddProductModal from '../components/AdminAddProductModal';
import ProductDetailsModal from '../components/ProductDetailsModal';
import CartAddedPopup from '../components/CartAddedPopup';
import AnnouncementPopup from '../components/AnnouncementPopup';
import { Plus } from 'lucide-react';
import Footer from '../components/Footer';

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();
  const [searchParams] = useSearchParams();
  const { deleteProduct, error, applyNavCategorySlug, cartNotice, clearCartNotice } = useProducts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!searchParams.has('category')) return;
    applyNavCategorySlug(searchParams.get('category') || 'all');
  }, [searchParams, applyNavCategorySlug]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="min-h-screen bg-[#f5f5f5]"
    >
      <Navbar />
      <AnnouncementPopup userId={user?.uid} />

      {error && (
        <div className="mx-auto max-w-[1500px] px-4 py-2 text-center text-sm text-amber-800 sm:px-6 lg:px-8">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:flex lg:gap-10 lg:px-8 lg:py-10">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-[#f5f5f5] py-3 text-sm font-semibold text-slate-800 shadow-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        <aside className="hidden lg:block">
          <SidebarFilters />
        </aside>

        <AnimatePresence>
          {filtersOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-black/10 bg-[#f5f5f5] shadow-xl lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                  <span className="font-serif text-lg text-slate-900">Filters</span>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SidebarFilters className="border-0" />
                <div className="p-4 pb-8">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="w-full rounded-md bg-slate-900 py-3 text-sm font-semibold text-white"
                  >
                    View results
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <ProductGrid
          onViewDetails={handleViewDetails}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          isAdmin={isAdmin}
        />
      </div>

      <AdminAddProductModal isOpen={showAddModal} onClose={handleCloseModal} editProduct={editingProduct} />

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSelectProduct={setSelectedProduct}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartNotice && (
          <CartAddedPopup
            key={cartNotice.id}
            productName={cartNotice.name}
            onClose={clearCartNotice}
          />
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
}
