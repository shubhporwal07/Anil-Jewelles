import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';

export default function AdminAddProductModal({ isOpen, onClose, editProduct = null }) {
  const [loading, setLoading] = useState(false);
  const { addProduct, editProduct: updateProduct } = useProducts();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Rings',
    metalType: 'Gold',
    diamondWeight: '',
    karat: '18kt',
    imageUrl: '',
    imageDbPath: '',
    inStock: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        description: editProduct.description || '',
        price: editProduct.price || '',
        category: editProduct.category || 'Rings',
        metalType: editProduct.metalType || 'Gold',
        diamondWeight: editProduct.diamondWeight || '',
        karat: editProduct.karat || editProduct.certification || '18kt',
        imageUrl: editProduct.imageUrl || editProduct.imageData || '',
        imageDbPath: editProduct.imageDbPath || '',
        inStock: editProduct.inStock !== undefined ? editProduct.inStock : true,
      });
      setImagePreview(editProduct.imageUrl || editProduct.imageData);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Rings',
        metalType: 'Gold',
        diamondWeight: '',
        karat: '18kt',
        imageUrl: '',
        imageDbPath: '',
        inStock: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setError('');
    setSuccess('');
  }, [editProduct, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!imageFile && !editProduct && !formData.imageUrl) {
      setError('Product image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple rapid submissions
    if (loading) {
      return;
    }

    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        diamondWeight: formData.diamondWeight ? parseFloat(formData.diamondWeight) : 0,
      };

      if (editProduct) {
        await updateProduct(editProduct.id, productData, imageFile);
        setSuccess('Product updated successfully!');
      } else {
        await addProduct(productData, imageFile);
        setSuccess('Product added successfully!');
      }

      // Close modal after success
      setTimeout(() => {
        setLoading(false);
        onClose();
        setSuccess('');
      }, 800);
    } catch (err) {
      setError(`Failed to save product: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {editProduct ? 'Edit Product' : 'Add New Jewellery'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm">
              {success}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., THE ASTRAEA SOLITAIRE DIAMOND RING"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs sm:text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Product description..."
              rows="3"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs sm:text-sm"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs sm:text-sm"
            />
          </div>

          {/* Category and Metal Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs sm:text-sm"
              >
                <option>Rings</option>
                <option>EarRings</option>
                <option>Necklace</option>
                <option>Engagement</option>
                <option>Men's</option>
                <option>Coins</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Metal Type *
              </label>
              <select
                name="metalType"
                value={formData.metalType}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs sm:text-sm"
              >
                <option>Gold</option>
                <option>Silver</option>
              </select>
            </div>
          </div>

          {/* Diamond Weight and Certification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Diamond Weight (ct)
              </label>
              <input
                type="number"
                name="diamondWeight"
                value={formData.diamondWeight}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Karat *
              </label>
              <select
                name="karat"
                value={formData.karat}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs sm:text-sm"
              >
                <option>18kt</option>
                <option>20kt</option>
                <option>22kt</option>
                <option>24kt</option>
              </select>
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">In Stock</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Toggle off to mark product as sold out</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.inStock}
              onClick={() => setFormData(prev => ({ ...prev, inStock: !prev.inStock }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${
                formData.inStock ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  formData.inStock ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Product Image {!editProduct && '*'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
              {imagePreview ? (
                <div className="space-y-3 sm:space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="w-full py-2 px-3 sm:px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-xs sm:text-sm"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 sm:gap-3">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 sm:px-4 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-3 sm:px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs sm:text-sm"
            >
              {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
