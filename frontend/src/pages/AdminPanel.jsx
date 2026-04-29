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
    if (!isGlobalSearch && activeTab !== 'products') return products;
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.metalType || '').toLowerCase().includes(q) ||
      String(p.price || '').includes(q)
    );
  }, [products, q, isGlobalSearch, activeTab]);

  const filteredOrders = useMemo(() => {
    if (!q) return orders;
    if (!isGlobalSearch && activeTab !== 'orders') return orders;
    return orders.filter(o =>
      (o.userName || '').toLowerCase().includes(q) ||
      (o.userEmail || '').toLowerCase().includes(q) ||
      (o.razorpayOrderId || o.id || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q) ||
      String(o.amount || '').includes(q)
    );
  }, [orders, q, isGlobalSearch, activeTab]);

  const filteredFeedback = useMemo(() => {
    if (!q) return feedback;
    if (!isGlobalSearch && activeTab !== 'feedback') return feedback;
    return feedback.filter(f =>
      (f.userName || '').toLowerCase().includes(q) ||
      (f.userEmail || '').toLowerCase().includes(q) ||
      (f.message || '').toLowerCase().includes(q)
    );
  }, [feedback, q, isGlobalSearch, activeTab]);

  const filteredSubscribers = useMemo(() => {
    if (!q) return subscribers;
    if (!isGlobalSearch && activeTab !== 'subscribers') return subscribers;
    return subscribers.filter(s =>
      (s.email || '').toLowerCase().includes(q)
    );
  }, [subscribers, q, isGlobalSearch, activeTab]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-row justify-between items-center">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">ANIL JEWELLER&apos;S Admin</h1>
            <p className="text-[11px] sm:text-sm text-gray-600 mt-0.5">Manage your jewelry inventory</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-200 text-xs sm:text-sm shrink-0 ml-3"
          >
            <LogOut size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Logout</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-1 sm:gap-4 border-b border-gray-200 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { key: 'products', icon: ShoppingBag, label: 'Products' },
            { key: 'orders', icon: Package, label: 'Orders' },
            { key: 'feedback', icon: MessageSquare, label: 'Feedback' },
            { key: 'subscribers', icon: Mail, label: 'Subscribers' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap px-2 sm:px-1 shrink-0 ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6 flex flex-row items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isGlobalSearch ? 'Search all sections...' : `Search ${activeTab}...`}
              className="w-full pl-9 pr-8 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              isGlobalSearch
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
            title={isGlobalSearch ? 'Searching all sections' : 'Searching current tab only'}
          >
            <Globe size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Global</span>
          </button>
        </div>

        {activeTab === 'products' && (
          <>
            {/* Add Product Button */}
        <div className="mb-4 sm:mb-6">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setShowAddProduct(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-200 text-xs sm:text-sm"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
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
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                        {q ? 'No products match your search.' : 'No products found. Add your first product!'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                          <div className="max-w-[200px] sm:max-w-xs truncate" title={product.name}>{product.name}</div>
                          {/* Mobile sub-info: category & price */}
                          <div className="sm:hidden flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                            <span>{product.category}</span>
                            <span className="text-gray-300">•</span>
                            <span className="font-semibold text-gray-700">₹{product.price.toLocaleString('en-IN')}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                          {product.category}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 font-semibold hidden md:table-cell">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 hidden lg:table-cell">
                          {product.imageData ? (
                            <img src={product.imageData} alt={product.name} className="h-10 w-10 rounded object-cover" />
                          ) : product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-[10px]">No img</div>
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
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-800 transition p-1"
                              title="Edit product"
                            >
                              <Edit size={15} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="text-red-600 hover:text-red-800 transition p-1"
                              title="Delete product"
                            >
                              <Trash2 size={15} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-8">
            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Total Products</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Inventory Value</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                ₹{products.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-6 col-span-2 sm:col-span-1">
              <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Average Price</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
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
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden md:table-cell">Order ID</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Customer</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">Date</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-3 sm:px-4 md:px-6 py-6 text-center text-xs sm:text-sm text-gray-500">
                            {q ? 'No orders match your search.' : 'No orders found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-mono text-xs text-gray-600 hidden md:table-cell">
                              <span className="truncate block max-w-[140px]">{order.razorpayOrderId || order.id}</span>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">{order.userName || 'Guest'}</div>
                              <div className="text-[11px] sm:text-xs text-gray-500 truncate max-w-[140px] sm:max-w-none">{order.userEmail}</div>
                              {/* Mobile-only date */}
                              <div className="sm:hidden text-[10px] text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`text-[10px] sm:text-xs font-semibold uppercase rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 border-none outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none ${
                                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                  order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                                  order.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <option value="paid">Placed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-8">
                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Total Orders</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{orders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Total Revenue</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    ₹{orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-3 sm:p-6 col-span-2 sm:col-span-1">
                  <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Avg Order Value</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
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
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Username</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Feedback</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredFeedback.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-3 sm:px-4 md:px-6 py-6 text-center text-xs sm:text-sm text-gray-500">
                            {q ? 'No feedback matches your search.' : 'No feedback found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredFeedback.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50 align-top">
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">{item.userName || 'Guest'}</div>
                              {item.userEmail && (
                                <div className="text-[11px] sm:text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{item.userEmail}</div>
                              )}
                              {/* Mobile date */}
                              <div className="sm:hidden text-[10px] text-gray-400 mt-0.5">
                                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                              <p className="max-w-[180px] sm:max-w-2xl whitespace-pre-wrap leading-relaxed line-clamp-3 sm:line-clamp-none">{item.message}</p>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                              {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-8">
                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Total Feedback</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{feedback.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Latest Feedback</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {feedback[0]?.submittedAt ? new Date(feedback[0].submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'None'}
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
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Subscribed On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSubscribers.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="px-3 sm:px-4 md:px-6 py-6 text-center text-xs sm:text-sm text-gray-500">
                            {q ? 'No subscribers match your search.' : 'No subscribers yet.'}
                          </td>
                        </tr>
                      ) : (
                        filteredSubscribers.map(sub => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                              <div className="flex items-center gap-2 min-w-0">
                                <Mail size={14} className="text-gray-400 flex-shrink-0 hidden sm:block" />
                                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{sub.email}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                              {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-8">
                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Total Subscribers</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{subscribers.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                  <p className="text-gray-600 text-[11px] sm:text-sm font-medium">Latest Subscription</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {subscribers[0]?.subscribedAt ? new Date(subscribers[0].subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'None'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Cross-section results when Global search is active */}
        {q && isGlobalSearch && (showCrossProducts || showCrossOrders || showCrossFeedback || showCrossSubscribers) && (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} />
              Results from other sections
            </h3>

            {showCrossProducts && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-blue-100">
                <button
                  onClick={() => setActiveTab('products')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <ShoppingBag size={16} />
                    Products ({filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''})
                  </span>
                  <span className="text-xs text-blue-600 font-medium">View all →</span>
                </button>
                <div className="divide-y">
                  {filteredProducts.slice(0, 3).map(p => (
                    <div key={p.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                      <span className="text-gray-900 font-medium truncate max-w-xs">{p.name}</span>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{p.category}</span>
                        <span className="font-semibold text-gray-900">₹{p.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length > 3 && (
                    <div className="px-4 py-2 text-xs text-gray-400 text-center">
                      +{filteredProducts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {showCrossOrders && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-blue-100">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <Package size={16} />
                    Orders ({filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''})
                  </span>
                  <span className="text-xs text-blue-600 font-medium">View all →</span>
                </button>
                <div className="divide-y">
                  {filteredOrders.slice(0, 3).map(o => (
                    <div key={o.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                      <span className="text-gray-900 font-medium">{o.userName || 'Guest'}</span>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="uppercase">{o.status}</span>
                        <span className="font-semibold text-gray-900">₹{(o.amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                  {filteredOrders.length > 3 && (
                    <div className="px-4 py-2 text-xs text-gray-400 text-center">
                      +{filteredOrders.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {showCrossFeedback && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-blue-100">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <MessageSquare size={16} />
                    Feedback ({filteredFeedback.length} result{filteredFeedback.length !== 1 ? 's' : ''})
                  </span>
                  <span className="text-xs text-blue-600 font-medium">View all →</span>
                </button>
                <div className="divide-y">
                  {filteredFeedback.slice(0, 3).map(f => (
                    <div key={f.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                      <span className="text-gray-900 font-medium">{f.userName || 'Guest'}</span>
                      <span className="text-xs text-gray-500 truncate max-w-xs ml-4">{f.message}</span>
                    </div>
                  ))}
                  {filteredFeedback.length > 3 && (
                    <div className="px-4 py-2 text-xs text-gray-400 text-center">
                      +{filteredFeedback.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {showCrossSubscribers && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-blue-100">
                <button
                  onClick={() => setActiveTab('subscribers')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <Mail size={16} />
                    Subscribers ({filteredSubscribers.length} result{filteredSubscribers.length !== 1 ? 's' : ''})
                  </span>
                  <span className="text-xs text-blue-600 font-medium">View all →</span>
                </button>
                <div className="divide-y">
                  {filteredSubscribers.slice(0, 3).map(s => (
                    <div key={s.id} className="px-4 py-2.5 text-sm text-gray-900 font-medium">
                      {s.email}
                    </div>
                  ))}
                  {filteredSubscribers.length > 3 && (
                    <div className="px-4 py-2 text-xs text-gray-400 text-center">
                      +{filteredSubscribers.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
