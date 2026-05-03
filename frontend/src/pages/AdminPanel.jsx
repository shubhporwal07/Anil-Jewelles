import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Box,
  Edit,
  Globe,
  IndianRupee,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';
import AdminAddProductModal from '../components/AdminAddProductModal';
import AnnouncementManager from '../components/AnnouncementManager';
import Toast from '../components/Toast';
import { TableSkeleton } from '../components/SkeletonLoader';
import { useProducts } from '../contexts/ProductContext';
import { db, realtimeDb } from '../config/firebase';
import { ref as rtdbRef, get, update, remove } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';

const INR = '\u20B9';

const tabs = [
  { key: 'products', icon: ShoppingBag, label: 'Products', title: 'Products', description: 'Manage your jewelry inventory with ease.' },
  { key: 'orders', icon: Package, label: 'Orders', title: 'Orders', description: 'Track customer orders and fulfillment status.' },
  { key: 'categories', icon: Tag, label: 'Categories', title: 'Categories', description: 'See each category and its product count.' },
  { key: 'customers', icon: Users, label: 'Customers', title: 'Customers', description: 'View registered and ordering customers.' },
  { key: 'feedback', icon: MessageSquare, label: 'Feedback', title: 'Feedback', description: 'Review customer messages and product feedback.' },
  { key: 'subscribers', icon: Mail, label: 'Subscribers', title: 'Subscribers', description: 'Manage newsletter and customer interest lists.' },
  { key: 'announcements', icon: Bell, label: 'Announcements', title: 'Announcements', description: 'Send notifications and announcements to customers.' },
];

const sidebarItems = [
  { key: 'products', icon: Box, label: 'Products' },
  { key: 'orders', icon: ShoppingBag, label: 'Orders' },
  { key: 'categories', icon: Tag, label: 'Categories' },
  { key: 'customers', icon: Users, label: 'Customers' },
  { key: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { key: 'subscribers', icon: Mail, label: 'Subscribers' },
  { key: 'announcements', icon: Bell, label: 'Announcements' },
];

function formatMoney(value) {
  return `${INR}${(value || 0).toLocaleString('en-IN')}`;
}

function StatCard({ icon: Icon, label, value, hint, tone = 'blue' }) {
  const tones = {
    blue: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-orange-50 text-orange-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-[0_12px_35px_rgba(20,16,10,0.07)] sm:p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
          <Icon size={21} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-stone-500">{label}</p>
          <p className="mt-1 truncate text-xl font-bold text-slate-950 sm:text-2xl">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-stone-500">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

function DataShell({ children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export default function AdminPanel({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { products, loading: productsLoading, error, deleteProduct, editProduct: updateProduct } = useProducts();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedbackDeleteTarget, setFeedbackDeleteTarget] = useState(null);
  const productPageSize = 10;

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

  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      let timeoutId;
      try {
        const timeout = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Customer account records timed out')), 3500);
        });
        const snapshot = await Promise.race([
          getDocs(collection(db, 'users')),
          timeout,
        ]);
        const customerList = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.displayName || data.name || data.userName || 'Customer',
            email: data.email || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || '',
            source: 'Account',
          };
        }).filter(customer => customer.email);
        setCustomers(customerList);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        setCustomersLoading(false);
      }
    };
    fetchCustomers();
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
    setDeleteTarget({ id, name });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      showToast('Product deleted successfully!', 'success');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Error deleting product: ' + err.message, 'error');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const item = feedback.find(f => f.id === feedbackId);
    setFeedbackDeleteTarget(item || { id: feedbackId });
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackDeleteTarget) return;
    try {
      await remove(rtdbRef(realtimeDb, `feedback/${feedbackDeleteTarget.id}`));
      setFeedback(prev => prev.filter(f => f.id !== feedbackDeleteTarget.id));
      showToast('Feedback deleted', 'success');
      setFeedbackDeleteTarget(null);
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

  const q = searchQuery.toLowerCase().trim();

  const filteredProducts = useMemo(() => {
    if (!q) return products;
    const matchingCategory = products.some(p => (p.category || '').toLowerCase() === q);
    return products.filter(p =>
      (matchingCategory && (p.category || '').toLowerCase() === q) ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.metalType || '').toLowerCase().includes(q) ||
      String(p.price || '').includes(q)
    );
  }, [products, q]);

  useEffect(() => {
    setProductPage(1);
  }, [q, products.length]);

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

  const categoryStats = useMemo(() => {
    const map = new Map();
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      const current = map.get(category) || { name: category, count: 0, totalValue: 0 };
      current.count += 1;
      current.totalValue += product.price || 0;
      map.set(category, current);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products]);

  const filteredCategories = useMemo(() => {
    if (!q) return categoryStats;
    return categoryStats.filter(category => category.name.toLowerCase().includes(q));
  }, [categoryStats, q]);

  const mergedCustomers = useMemo(() => {
    const map = new Map();
    customers.forEach(customer => {
      if (!customer.email) return;
      map.set(customer.email.toLowerCase(), customer);
    });
    orders.forEach(order => {
      if (!order.userEmail) return;
      const key = order.userEmail.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: order.userName || 'Customer',
          email: order.userEmail,
          createdAt: order.createdAt || '',
          source: 'Order',
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [customers, orders]);

  const filteredCustomers = useMemo(() => {
    if (!q) return mergedCustomers;
    return mergedCustomers.filter(customer =>
      (customer.name || '').toLowerCase().includes(q) ||
      (customer.email || '').toLowerCase().includes(q)
    );
  }, [mergedCustomers, q]);

  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const stockCount = products.filter(p => p.inStock !== false).length;
  const categoryCount = new Set(products.map(p => p.category).filter(Boolean)).size;
  const orderRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const activeMeta = tabs.find(tab => tab.key === activeTab) || tabs[0];
  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / productPageSize));
  const safeProductPage = Math.min(productPage, productPageCount);
  const productStartIndex = (safeProductPage - 1) * productPageSize;
  const paginatedProducts = filteredProducts.slice(productStartIndex, productStartIndex + productPageSize);

  const showCrossProducts = q && activeTab !== 'products' && filteredProducts.length > 0;
  const showCrossOrders = q && activeTab !== 'orders' && filteredOrders.length > 0;
  const showCrossCategories = q && activeTab !== 'categories' && filteredCategories.length > 0;
  const showCrossCustomers = q && activeTab !== 'customers' && filteredCustomers.length > 0;
  const showCrossFeedback = q && activeTab !== 'feedback' && filteredFeedback.length > 0;
  const showCrossSubscribers = q && activeTab !== 'subscribers' && filteredSubscribers.length > 0;

  const openAddProduct = () => {
    setEditingProduct(null);
    setShowAddProduct(true);
  };

  const renderStats = () => {
    if (activeTab === 'products') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard icon={Package} label="Total Products" value={products.length} hint="+3 this week" tone="blue" />
          <StatCard icon={ShoppingBag} label="In Stock" value={stockCount} hint={`${products.length ? Math.round((stockCount / products.length) * 100) : 0}% availability`} tone="emerald" />
          <StatCard icon={IndianRupee} label="Total Value" value={formatMoney(totalValue)} hint="Inventory value" tone="rose" />
        </div>
      );
    }

    if (activeTab === 'orders') {
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Package} label="Total Orders" value={orders.length} hint="All captured orders" tone="blue" />
          <StatCard icon={IndianRupee} label="Total Revenue" value={formatMoney(orderRevenue)} hint="Gross order value" tone="emerald" />
          <StatCard icon={Tag} label="Avg Order Value" value={formatMoney(orders.length ? Math.round(orderRevenue / orders.length) : 0)} hint="Revenue per order" tone="amber" />
        </div>
      );
    }

    if (activeTab === 'feedback') {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard icon={MessageSquare} label="Total Feedback" value={feedback.length} hint="Customer responses" tone="blue" />
          <StatCard
            icon={Bell}
            label="Latest Feedback"
            value={feedback[0]?.submittedAt ? new Date(feedback[0].submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'None'}
            hint="Most recent entry"
            tone="amber"
          />
        </div>
      );
    }

    if (activeTab === 'categories') {
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Tag} label="Categories" value={categoryStats.length} hint="Product groups" tone="blue" />
          <StatCard icon={Package} label="Products Listed" value={products.length} hint="Across all categories" tone="emerald" />
          <StatCard icon={IndianRupee} label="Total Value" value={formatMoney(totalValue)} hint="Inventory value" tone="rose" />
        </div>
      );
    }

    if (activeTab === 'customers') {
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label="Customers" value={mergedCustomers.length} hint="Accounts and buyers" tone="blue" />
          <StatCard icon={Mail} label="Account Records" value={customers.length} hint="From Firestore users" tone="emerald" />
          <StatCard icon={ShoppingBag} label="Order Customers" value={orders.filter(order => order.userEmail).length} hint="Captured from orders" tone="amber" />
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={Mail} label="Total Subscribers" value={subscribers.length} hint="Newsletter audience" tone="blue" />
        <StatCard
          icon={Bell}
          label="Latest Subscription"
          value={subscribers[0]?.subscribedAt ? new Date(subscribers[0].subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'None'}
          hint="Most recent signup"
          tone="emerald"
        />
      </div>
    );
  };

  const renderProducts = () => (
    <>
      {productsLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-sm text-stone-500 shadow-sm">
              {q ? 'No products match your search.' : 'No products found. Add your first product!'}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
              {paginatedProducts.map(product => (
                <article
                  key={product.id}
                  onClick={() => handleEditProduct(product)}
                  className={`cursor-pointer overflow-hidden rounded-lg border shadow-[0_14px_35px_rgba(20,16,10,0.08)] transition-all hover:shadow-[0_24px_45px_rgba(20,16,10,0.12)] ${
                    product.inStock !== false
                      ? 'border-stone-200 bg-white'
                      : 'border-stone-300 bg-stone-100 opacity-85 grayscale'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_18%_12%,#fff7e8,transparent_34%),linear-gradient(135deg,#f7ead8,#fffaf2_48%,#ead5b9)]">
                    {product.imageData || product.imageUrl ? (
                      <img
                        src={product.imageData || product.imageUrl}
                        alt={product.name}
                        className={`h-full w-full object-cover ${product.inStock === false ? 'opacity-55' : ''}`}
                      />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center text-amber-600 ${product.inStock === false ? 'opacity-40' : ''}`}>
                        <Diamond size={54} strokeWidth={1.5} />
                      </div>
                    )}
                    {product.inStock === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-950/20">
                        <span className="-rotate-12 rounded-md border-2 border-white/90 bg-stone-950/70 px-5 py-2 text-lg font-black uppercase tracking-[0.18em] text-white shadow-lg">
                          Sold Out
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleStock(product)}
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${
                        product.inStock !== false
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                      title={product.inStock !== false ? 'In Stock - click to mark as Sold Out' : 'Sold Out - click to mark as In Stock'}
                    >
                      {product.inStock !== false ? 'In Stock' : 'Sold Out'}
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className={`line-clamp-3 min-h-[42px] text-sm font-bold leading-snug ${product.inStock !== false ? 'text-slate-950' : 'text-stone-500'}`}>{product.name}</h3>
                    <p className="mt-1 text-xs text-stone-500">{product.category}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className={`text-sm font-bold ${product.inStock !== false ? 'text-amber-700' : 'text-stone-500'}`}>{formatMoney(product.price)}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditProduct(product)} className="rounded-md border border-amber-100 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100" title="Edit product">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id, product.name)} className="rounded-md border border-red-100 bg-red-50 p-2 text-red-500 hover:bg-red-100" title="Delete product">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredProducts.length ? productStartIndex + 1 : 0} to {Math.min(productStartIndex + productPageSize, filteredProducts.length)} of {filteredProducts.length} products
            </span>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setProductPage(1)}
                disabled={safeProductPage === 1}
                className="h-8 min-w-8 rounded-md border border-stone-200 bg-white px-2 text-xs font-semibold text-stone-500 hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                &lt;&lt;
              </button>
              <button
                type="button"
                onClick={() => setProductPage(page => Math.max(1, page - 1))}
                disabled={safeProductPage === 1}
                className="h-8 min-w-8 rounded-md border border-stone-200 bg-white px-2 text-xs font-semibold text-stone-500 hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(productPageCount, 5) }, (_, index) => {
                const page = productPageCount <= 5
                  ? index + 1
                  : Math.min(Math.max(safeProductPage - 2, 1), productPageCount - 4) + index;
                return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setProductPage(page)}
                  className={`h-8 min-w-8 rounded-md border px-2 text-xs font-semibold ${
                    page === safeProductPage
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-stone-200 bg-white text-stone-500 hover:border-amber-300 hover:text-amber-700'
                  }`}
                >
                  {page}
                </button>
                );
              })}
              <button
                type="button"
                onClick={() => setProductPage(page => Math.min(productPageCount, page + 1))}
                disabled={safeProductPage === productPageCount}
                className="h-8 min-w-8 rounded-md border border-stone-200 bg-white px-2 text-xs font-semibold text-stone-500 hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                &gt;
              </button>
              <button
                type="button"
                onClick={() => setProductPage(productPageCount)}
                disabled={safeProductPage === productPageCount}
                className="h-8 min-w-8 rounded-md border border-stone-200 bg-white px-2 text-xs font-semibold text-stone-500 hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                &gt;&gt;
              </button>
              <button type="button" className="ml-2 h-8 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600">
                {productPageSize} / page
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderOrders = () => (
    <>
      {ordersLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <DataShell>
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Order ID</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Customer</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Date</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Status</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-700">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-sm text-slate-500">
                    {q ? 'No orders match your search.' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      <span className="block max-w-[150px] truncate">{order.razorpayOrderId || order.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{order.userName || 'Guest'}</div>
                      <div className="max-w-[220px] truncate text-xs text-slate-500">{order.userEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`cursor-pointer appearance-none rounded-full px-3 py-1 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 ${
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
                    <td className="px-5 py-4 text-right font-bold text-slate-950">{formatMoney(order.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataShell>
      )}
    </>
  );

  const renderFeedback = () => (
    <>
      {feedbackLoading ? (
        <TableSkeleton rows={5} columns={3} />
      ) : (
        <DataShell>
          <table className="w-full min-w-[660px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Username</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Feedback</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Date</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFeedback.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-sm text-slate-500">
                    {q ? 'No feedback matches your search.' : 'No feedback found.'}
                  </td>
                </tr>
              ) : (
                filteredFeedback.map(item => (
                  <tr key={item.id} className="align-top hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{item.userName || 'Guest'}</div>
                      {item.userEmail && <div className="max-w-[180px] truncate text-xs text-slate-500">{item.userEmail}</div>}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <p className="max-w-2xl whitespace-pre-wrap leading-relaxed">{item.message}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDeleteFeedback(item.id)} className="rounded-md border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Delete feedback">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataShell>
      )}
    </>
  );

  const renderCategories = () => (
    <DataShell>
      <table className="w-full min-w-[520px] text-sm">
        <thead className="border-b border-stone-200 bg-stone-50/80">
          <tr>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Category</th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Products Added</th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-stone-700">Inventory Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {filteredCategories.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-5 py-8 text-center text-sm text-stone-500">
                {q ? 'No categories match your search.' : 'No categories found.'}
              </td>
            </tr>
          ) : (
            filteredCategories.map(category => (
              <tr key={category.name} className="hover:bg-stone-50/80">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <Tag size={18} />
                    </span>
                    <span className="font-bold text-slate-950">{category.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-stone-700">
                  {category.count} product{category.count !== 1 ? 's' : ''}
                </td>
                <td className="px-5 py-4 text-right font-bold text-amber-700">{formatMoney(category.totalValue)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </DataShell>
  );

  const renderCustomers = () => (
    <>
      {ordersLoading && filteredCustomers.length === 0 ? (
        <TableSkeleton rows={5} columns={3} />
      ) : (
        <DataShell>
          <table className="w-full min-w-[620px] text-sm">
            <thead className="border-b border-stone-200 bg-stone-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Username</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Gmail / Email</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Source</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-stone-700">Joined / First Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-sm text-stone-500">
                    {q ? 'No customers match your search.' : 'No customers found yet.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id || customer.email} className="hover:bg-stone-50/80">
                    <td className="px-5 py-4 font-bold text-slate-950">{customer.name || 'Customer'}</td>
                    <td className="px-5 py-4 font-medium text-stone-700">{customer.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{customer.source}</span>
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {customersLoading && (
            <div className="border-t border-stone-100 px-5 py-3 text-xs font-medium text-stone-500">
              Syncing account records in the background...
            </div>
          )}
        </DataShell>
      )}
    </>
  );

  const renderSubscribers = () => (
    <>
      {subscribersLoading ? (
        <TableSkeleton rows={5} columns={2} />
      ) : (
        <DataShell>
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Email</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Subscribed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-5 py-8 text-center text-sm text-slate-500">
                    {q ? 'No subscribers match your search.' : 'No subscribers yet.'}
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <Mail size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate font-semibold text-slate-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataShell>
      )}
    </>
  );

  const renderActiveTable = () => {
    if (activeTab === 'products') return renderProducts();
    if (activeTab === 'orders') return renderOrders();
    if (activeTab === 'categories') return renderCategories();
    if (activeTab === 'customers') return renderCustomers();
    if (activeTab === 'feedback') return renderFeedback();
    if (activeTab === 'announcements') return <AnnouncementManager />;
    return renderSubscribers();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen bg-[#fbf7f0] text-slate-950"
    >
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="min-h-screen lg:pl-72">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-amber-500/10 bg-[#071322] px-6 py-7 text-white shadow-2xl lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <img src="/images/logo.png" alt="Anil Jeweller's logo" className="h-12 w-12 rounded-lg object-contain" />
            <div>
              <p className="font-serif text-lg font-bold leading-tight text-white">ANIL JEWELLER&apos;S</p>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-400">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => tabs.some(tab => tab.key === key) && setActiveTab(key)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold ${
                  activeTab === key
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.08)]'
                    : 'border-transparent text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-amber-300 hover:bg-white/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="min-w-0">
          <div className="sticky top-0 z-20 bg-white/90 px-4 pb-3 pt-3 backdrop-blur sm:px-6 lg:hidden">
              <div className="flex items-center gap-2 pt-3">
                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-hide">
                {tabs.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                      activeTab === key
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-white text-slate-600 ring-1 ring-stone-200'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-amber-300 shadow-sm"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-6 lg:px-10 lg:py-4">
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-slate-950">{activeMeta.title}</h1>
              <p className="mt-1 text-sm text-stone-500">{activeMeta.description}</p>
            </div>
            {renderStats()}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  className="h-12 w-full rounded-lg border border-stone-200 bg-white pl-12 pr-10 text-sm shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 hover:text-slate-700"
                    title="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>
              {activeTab === 'products' && (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openAddProduct}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white shadow-sm shadow-slate-950/20 hover:bg-slate-800"
                >
                  <Plus size={18} />
                  Add New Product
                </motion.button>
              )}
            </div>

            {renderActiveTable()}

            {q && (showCrossProducts || showCrossOrders || showCrossCategories || showCrossCustomers || showCrossFeedback || showCrossSubscribers) && (
              <div className="space-y-4 pt-2">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Globe size={14} />
                  Results from other sections
                </h3>

                {showCrossProducts && (
                  <CrossResults title="Products" icon={ShoppingBag} count={filteredProducts.length} onClick={() => setActiveTab('products')}>
                    {filteredProducts.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                        <span className="truncate font-semibold text-slate-900">{p.name}</span>
                        <span className="shrink-0 text-xs font-bold text-slate-700">{formatMoney(p.price)}</span>
                      </div>
                    ))}
                  </CrossResults>
                )}

                {showCrossOrders && (
                  <CrossResults title="Orders" icon={Package} count={filteredOrders.length} onClick={() => setActiveTab('orders')}>
                    {filteredOrders.slice(0, 3).map(o => (
                      <div key={o.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                        <span className="truncate font-semibold text-slate-900">{o.userName || 'Guest'}</span>
                        <span className="shrink-0 text-xs font-bold uppercase text-slate-600">{o.status}</span>
                      </div>
                    ))}
                  </CrossResults>
                )}

                {showCrossCategories && (
                  <CrossResults title="Categories" icon={Tag} count={filteredCategories.length} onClick={() => setActiveTab('categories')}>
                    {filteredCategories.slice(0, 3).map(category => (
                      <div key={category.name} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                        <span className="truncate font-semibold text-slate-900">{category.name}</span>
                        <span className="shrink-0 text-xs font-bold text-slate-600">{category.count} products</span>
                      </div>
                    ))}
                  </CrossResults>
                )}

                {showCrossCustomers && (
                  <CrossResults title="Customers" icon={Users} count={filteredCustomers.length} onClick={() => setActiveTab('customers')}>
                    {filteredCustomers.slice(0, 3).map(customer => (
                      <div key={customer.id || customer.email} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                        <span className="truncate font-semibold text-slate-900">{customer.name || 'Customer'}</span>
                        <span className="truncate text-xs text-slate-500">{customer.email}</span>
                      </div>
                    ))}
                  </CrossResults>
                )}

                {showCrossFeedback && (
                  <CrossResults title="Feedback" icon={MessageSquare} count={filteredFeedback.length} onClick={() => setActiveTab('feedback')}>
                    {filteredFeedback.slice(0, 3).map(f => (
                      <div key={f.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-900">{f.userName || 'Guest'}</span>
                        <span className="truncate text-xs text-slate-500">{f.message}</span>
                      </div>
                    ))}
                  </CrossResults>
                )}

                {showCrossSubscribers && (
                  <CrossResults title="Subscribers" icon={Mail} count={filteredSubscribers.length} onClick={() => setActiveTab('subscribers')}>
                    {filteredSubscribers.slice(0, 3).map(s => (
                      <div key={s.id} className="px-4 py-3 text-sm font-semibold text-slate-900">{s.email}</div>
                    ))}
                  </CrossResults>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <AdminAddProductModal
        isOpen={showAddProduct}
        onClose={handleCloseModal}
        editProduct={editingProduct}
        onSaved={(type) => {
          showToast(type === 'updated' ? 'Product updated successfully!' : 'Product added successfully!', 'success');
        }}
      />

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-2xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Trash2 size={26} />
              </div>
              <div className="mt-4 text-center">
                <h2 className="font-sans text-xl font-bold text-slate-950">Delete product?</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Are you sure you want to delete <span className="font-bold text-slate-900">&quot;{deleteTarget.name}&quot;</span>? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-red-600/20 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedbackDeleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-2xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Trash2 size={26} />
              </div>
              <div className="mt-4 text-center">
                <h2 className="font-sans text-xl font-bold text-slate-950">Delete feedback?</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Are you sure you want to delete this feedback
                  {feedbackDeleteTarget.userName ? (
                    <> from <span className="font-bold text-slate-900">{feedbackDeleteTarget.userName}</span></>
                  ) : null}
                  ? This action cannot be undone.
                </p>
                {feedbackDeleteTarget.message && (
                  <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs italic text-stone-500">
                    “{feedbackDeleteTarget.message}”
                  </p>
                )}
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setFeedbackDeleteTarget(null)}
                  className="flex-1 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFeedback}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-red-600/20 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          >
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg"
            >
              Logging out...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CrossResults({ title, icon: Icon, count, onClick, children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
      <button onClick={onClick} className="flex w-full items-center justify-between bg-blue-50 px-4 py-3 text-left hover:bg-blue-100">
        <span className="flex items-center gap-2 text-sm font-bold text-blue-700">
          <Icon size={16} />
          {title} ({count} result{count !== 1 ? 's' : ''})
        </span>
        <span className="text-xs font-bold text-blue-600">View all -&gt;</span>
      </button>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}
