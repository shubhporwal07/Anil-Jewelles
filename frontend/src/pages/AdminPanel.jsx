import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Plus, Trash2, Edit, Package, ShoppingBag, MessageSquare, Mail, Search, Globe } from 'lucide-react';
import AdminAddProductModal from '../components/AdminAddProductModal';
import Toast from '../components/Toast';
import { TableSkeleton } from '../components/SkeletonLoader';
import { useProducts } from '../contexts/ProductContext';
import { realtimeDb } from '../config/firebase';
import { ref as rtdbRef, get, update, remove } from 'firebase/database';

export default function AdminPanel({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'feedback' | 'subscribers'
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { products, loading: productsLoading, error, deleteProduct, editProduct: updateProduct } = useProducts();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearch, setIsGlobalSearch] = useState(true);

  useEffect(() => {
    if (error) showToast('Error loading products: ' + error, 'error');
  }, [error]);

  useEffect(() => {
    const fetchAllOrders = async () => {
      setOrdersLoading(true);
      try {
        const snapshot = await get(rtdbRef(realtimeDb, 'orders'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const ordersList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          ordersList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setOrders(ordersList);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        showToast('Failed to fetch orders', 'error');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      setFeedbackLoading(true);
      try {
        const snapshot = await get(rtdbRef(realtimeDb, 'feedback'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const feedbackList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          feedbackList.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
          setFeedback(feedbackList);
        } else {
          setFeedback([]);
        }
      } catch (err) {
        console.error('Failed to fetch feedback:', err);
        showToast('Failed to fetch feedback', 'error');
      } finally {
        setFeedbackLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  useEffect(() => {
    const fetchSubscribers = async () => {
      setSubscribersLoading(true);
      try {
        const snapshot = await get(rtdbRef(realtimeDb, 'subscribers'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const subscribersList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          subscribersList.sort((a, b) => new Date(b.subscribedAt || 0).getTime() - new Date(a.subscribedAt || 0).getTime());
          setSubscribers(subscribersList);
        } else {
          setSubscribers([]);
        }
      } catch (err) {
        console.error('Failed to fetch subscribers:', err);
        showToast('Failed to fetch subscribers', 'error');
      } finally {
        setSubscribersLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await update(rtdbRef(realtimeDb, `orders/${orderId}`), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast('Order status updated', 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        showToast('Product deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product: ' + error.message, 'error');
      }
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await remove(rtdbRef(realtimeDb, `feedback/${feedbackId}`));
      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
      showToast('Feedback deleted', 'success');
    } catch (err) {
      console.error('Error deleting feedback:', err);
      showToast('Failed to delete feedback', 'error');
    }
  };

  const handleToggleStock = async (product) => {
    const newStockStatus = product.inStock === undefined ? false : !product.inStock;
    try {
      await updateProduct(product.id, { ...product, inStock: newStockStatus });
      showToast(`Product marked as ${newStockStatus ? 'In Stock' : 'Sold Out'}`, 'success');
    } catch (err) {
      console.error('Error toggling stock:', err);
      showToast('Failed to update stock status', 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleCloseModal = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    localStorage.removeItem('adminSession');
    onLogout();
  };

  // --- Search filter helpers ---
  const q = searchQuery.toLowerCase().trim();

  const filteredProducts = useMemo(() => {
    if (!q) return products;
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.metalType || '').toLowerCase().includes(q) ||
      String(p.price || '').includes(q)
    );
  }, [products, q]);

  const filteredOrders = useMemo(() => {
    if (!q) return orders;
    return orders.filter(o =>
      (o.userName || '').toLowerCase().includes(q) ||
      (o.userEmail || '').toLowerCase().includes(q) ||
      (o.razorpayOrderId || o.id || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q) ||
      String(o.amount || '').includes(q)
    );
  }, [orders, q]);

  const filteredFeedback = useMemo(() => {
    if (!q) return feedback;
    return feedback.filter(f =>
      (f.userName || '').toLowerCase().includes(q) ||
      (f.userEmail || '').toLowerCase().includes(q) ||
      (f.message || '').toLowerCase().includes(q)
    );
  }, [feedback, q]);

  const filteredSubscribers = useMemo(() => {
    if (!q) return subscribers;
    return subscribers.filter(s =>
      (s.email || '').toLowerCase().includes(q)
    );
  }, [subscribers, q]);

  // When global search is on and there's a query, determine which cross-sections have results
  const showCrossProducts = isGlobalSearch && q && activeTab !== 'products' && filteredProducts.length > 0;
  const showCrossOrders = isGlobalSearch && q && activeTab !== 'orders' && filteredOrders.length > 0;
  const showCrossFeedback = isGlobalSearch && q && activeTab !== 'feedback' && filteredFeedback.length > 0;
  const showCrossSubscribers = isGlobalSearch && q && activeTab !== 'subscribers' && filteredSubscribers.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen bg-gray-100"
    >
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">ANIL JEWELLER&apos;S Admin</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your jewelry inventory</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-200 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5" />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingBag size={18} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package size={18} />
            Customer Orders
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare size={18} />
            Feedback
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'subscribers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mail size={18} />
            Subscribers
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isGlobalSearch ? 'Search across all sections...' : `Search ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsGlobalSearch(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all whitespace-nowrap ${
              isGlobalSearch
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
            title={isGlobalSearch ? 'Searching all sections' : 'Searching current tab only'}
          >
            <Globe size={16} />
            Global
          </button>
        </div>

        {activeTab === 'products' && (
          <>
            {/* Add Product Button */}
        <div className="mb-6 sm:mb-8">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setShowAddProduct(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-200 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            Add New Product
          </motion.button>
        </div>

        {/* Loading State */}
        {productsLoading && (
          <TableSkeleton rows={6} columns={5} />
        )}

        {/* Products Table - Responsive */}
        {!productsLoading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">
                      Category
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden md:table-cell">
                      Price
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden lg:table-cell">
                      Image
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">
                      In Stock
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                        No products found. Add your first product!
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                          <div className="max-w-xs truncate" title={product.name}>{product.name}</div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                          {product.category}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 font-semibold hidden md:table-cell">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 hidden lg:table-cell">
                          {product.imageData ? (
                            <img
                              src={product.imageData}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-[10px]">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-center hidden sm:table-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={product.inStock !== false}
                            onClick={() => handleToggleStock(product)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                              product.inStock !== false ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                            title={product.inStock !== false ? 'In Stock — click to mark as Sold Out' : 'Sold Out — click to mark as In Stock'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                product.inStock !== false ? 'translate-x-[18px]' : 'translate-x-[3px]'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-sm space-x-2 flex">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 transition p-1"
                            title="Edit product"
                          >
                            <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="text-red-600 hover:text-red-800 transition p-1"
                            title="Delete product"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics */}
        {!productsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 sm:mt-8">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Products</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Inventory Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                ₹{products.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Average Price</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                ₹{Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / (products.length || 1)).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'orders' && (
          <>
            {ordersLoading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Order ID</th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Customer</th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                        <th className="px-4 md:px-6 py-3 text-right font-semibold text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 md:px-6 py-6 text-center text-gray-500">
                            No orders found.
                          </td>
                        </tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 md:px-6 py-4 font-mono text-xs text-gray-600">
                              {order.razorpayOrderId || order.id}
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <div className="font-medium text-gray-900">{order.userName || 'Guest'}</div>
                              <div className="text-xs text-gray-500">{order.userEmail}</div>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`text-xs font-semibold uppercase rounded-full px-2 py-1 border-none outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none ${
                                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                  order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                                  order.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <option value="paid">Order Placed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-right font-semibold text-gray-900">
                              ₹{order.amount ? order.amount.toLocaleString('en-IN') : 0}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {!ordersLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm font-medium">Average Order Value</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{orders.length ? Math.round(orders.reduce((sum, o) => sum + (o.amount || 0), 0) / orders.length).toLocaleString('en-IN') : 0}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'feedback' && (
          <>
            {feedbackLoading ? (
              <TableSkeleton rows={5} columns={3} />
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Username</th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Feedback</th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {feedback.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-4 md:px-6 py-6 text-center text-gray-500">
                            No feedback found.
                          </td>
                        </tr>
                      ) : (
                        feedback.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50 align-top">
                            <td className="px-4 md:px-6 py-4">
                              <div className="font-medium text-gray-900">{item.userName || 'Guest'}</div>
                              {item.userEmail && (
                                <div className="text-xs text-gray-500">{item.userEmail}</div>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4 text-gray-700">
                              <p className="max-w-2xl whitespace-pre-wrap leading-relaxed">{item.message}</p>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-gray-600 whitespace-nowrap">
                              {item.submittedAt
                                ? new Date(item.submittedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : 'Unknown'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!feedbackLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Feedback</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{feedback.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm font-medium">Latest Feedback</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {feedback[0]?.submittedAt
                      ? new Date(feedback[0].submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'None'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'subscribers' && (
          <>
            {subscribersLoading ? (
              <TableSkeleton rows={5} columns={2} />
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Email</th>
                        <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Subscribed On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {subscribers.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="px-4 md:px-6 py-6 text-center text-gray-500">
                            No subscribers yet.
                          </td>
                        </tr>
                      ) : (
                        subscribers.map(sub => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="px-4 md:px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-gray-900">{sub.email}</span>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-gray-600">
                              {sub.subscribedAt
                                ? new Date(sub.subscribedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : 'Unknown'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!subscribersLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{subscribers.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm font-medium">Latest Subscription</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {subscribers[0]?.subscribedAt
                      ? new Date(subscribers[0].subscribedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'None'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      <AdminAddProductModal
        isOpen={showAddProduct}
        onClose={handleCloseModal}
        editProduct={editingProduct}
      />
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="bg-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-gray-800"
            >
              Logging out...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
