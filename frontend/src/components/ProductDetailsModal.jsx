import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import DesignerAlert from './DesignerAlert';

export default function ProductDetailsModal({ product, onClose, onSelectProduct }) {
  const { addToCart, filteredProducts } = useProducts();
  const [selectedSize, setSelectedSize] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setSelectedSize('');
    setCurrentImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleAddToBag = () => {
    if (product.inStock === false) return;
    // Only require size for engagement products
    if (product.category === 'Engagement' && !selectedSize) {
      setShowAlert(true);
      return;
    }
    
    addToCart({
      ...product,
      selectedSize: product.category === 'Engagement' ? selectedSize : null,
    });
  };

  // Get related products (same category, excluding current product)
  const relatedProducts = filteredProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const ringSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'];

  const formatPrice = (price) => {
    return '₹' + (price || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!product) return null;

  const isSoldOut = product.inStock === false;

  const allImages = (Array.isArray(product.imageDatas) && product.imageDatas.length > 0) 
    ? product.imageDatas 
    : (product.imageData ? [product.imageData] : []);
  const currentImage = allImages[currentImageIndex] || (product.imageData || product.imageUrl || 'https://via.placeholder.com/400x400?text=Product');

  const handleNextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const handlePrevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-auto"
        >
          {/* Global Close Button - Fixed to top right of modal */}
          <div className="absolute right-4 top-4 z-[60]">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-gray-900 transition-all"
              aria-label="Close product details"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 md:p-6 pt-12 sm:pt-12 md:pt-6 min-h-0 overflow-y-auto">
            {/* Left - Product Image */}
            <div className="h-full flex flex-col order-1">
              <div className="rounded-xl overflow-hidden flex-1 flex items-center justify-center relative group">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                
                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-900" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-900" />
                    </motion.button>
                  </>
                )}
                
                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allImages.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                        currentImageIndex === index
                          ? 'border-slate-900 shadow-md'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Details */}
            <div className="h-full order-2 flex flex-col pt-12 md:pt-0">
              {/* Product Name & Info */}
              <div className="mb-4 sm:mb-6 pt-4 sm:pt-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide text-gray-900 mb-2 sm:mb-3">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-2 text-sm flex items-center gap-2">
                  {product.certification && <span>{product.certification}</span>}
                  {product.certification && product.metalType && <span className="opacity-30">•</span>}
                  {product.metalType && <span>{product.metalType}</span>}
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-3">
                  {formatPrice(product.price)}
                </p>
                {isSoldOut && (
                  <span className="inline-block mt-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 text-xs sm:text-sm mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Ring Size Selector */}
              {product.category === 'Engagement' && (
                <div className="mb-8">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                    Select Ring Size
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {ringSizes.map(size => (
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 rounded-lg font-medium transition text-xs sm:text-sm border ${
                          selectedSize === size
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-slate-900'
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Bag Button */}
              {isSoldOut ? (
                <button
                  disabled
                  className="w-full py-4 bg-gray-400 text-white rounded-xl font-bold tracking-widest cursor-not-allowed mb-8"
                >
                  SOLD OUT
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#1e293b' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAddToBag}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold tracking-widest hover:bg-slate-800 transition-all mb-8 shadow-xl shadow-slate-900/20"
                >
                  ADD TO BAG
                </motion.button>
              )}

              {/* You May Also Like Section */}
              {relatedProducts.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">
                    You May Also Like
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {relatedProducts.map(relatedProduct => (
                      <motion.button
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={relatedProduct.id}
                        onClick={() => onSelectProduct?.(relatedProduct)}
                        className="flex flex-col gap-2 group"
                      >
                        <div className="bg-white aspect-square rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-colors">
                          <img
                            src={(Array.isArray(relatedProduct.imageDatas) && relatedProduct.imageDatas[0]) || relatedProduct.imageData || relatedProduct.imageUrl || 'https://via.placeholder.com/200x200?text=Product'}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-gray-900 line-clamp-1">
                          {formatPrice(relatedProduct.price)}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <DesignerAlert 
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          message="Please select your preferred ring size before adding to the bag."
        />
    </motion.div>
  );
}
