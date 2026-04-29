import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowLeft, CheckCircle2, Clock, Truck, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { OrderListSkeleton } from '../components/SkeletonLoader';
import { auth, realtimeDb } from '../config/firebase';
import { ref as rtdbRef, get, query as rtdbQuery, orderByChild, equalTo } from 'firebase/database';

const statusSteps = [
  { key: 'paid', label: 'Order Placed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

function getStatusIndex(status) {
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

function formatPrice(price) {
  return '₹' + (price || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = getStatusIndex(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-shadow"
    >
      {/* Order Header */}
      <div
        className="p-5 sm:p-6 cursor-pointer"
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Package className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                Order ID
              </p>
              <p className="text-sm font-semibold text-slate-900 font-mono">
                {order.razorpayOrderId || order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500">Amount</p>
              <p className="text-base font-bold text-slate-900">{formatPrice(order.amount)}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Date</p>
              <p className="text-sm text-slate-700">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                order.status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-700'
                  : order.status === 'shipped'
                  ? 'bg-blue-50 text-blue-700'
                  : order.status === 'processing'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {order.status === 'paid' ? 'Confirmed' : order.status}
              </span>
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-slate-400 ml-2" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400 ml-2" />
              )}
            </div>
          </div>
        </div>

        {/* Date on mobile */}
        <p className="text-xs text-slate-500 mt-2 sm:hidden">{formatDate(order.createdAt)}</p>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/10 p-5 sm:p-6">
              {/* Status Tracker */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
                  Order Tracking
                </p>
                <div className="flex items-center justify-between relative">
                  {/* Progress line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-slate-900 transition-all duration-500"
                    style={{ width: `calc(${(currentStep / (statusSteps.length - 1)) * 100}% - 40px)` }}
                  />

                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                            isActive
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <p className={`mt-2 text-[10px] sm:text-xs font-medium ${
                          isActive ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Items ({order.items?.length || 0})
                </p>
                <div className="space-y-3">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          Qty: {item.quantity}
                          {item.metalType && ` · ${item.metalType}`}
                          {item.selectedSize && ` · Size ${item.selectedSize}`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">Payment ID</p>
                  <p className="font-mono font-medium text-slate-800 truncate">{order.razorpayPaymentId || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Payment Method</p>
                  <p className="font-medium text-slate-800">Razorpay</p>
                </div>
                {order.giftNote && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-slate-500">Gift Note</p>
                    <p className="font-medium text-slate-800 italic">"{order.giftNote}"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const ordersRef = rtdbRef(realtimeDb, 'orders');
        const q = rtdbQuery(ordersRef, orderByChild('userEmail'), equalTo(user.email));

        const snapshot = await get(q);
        
        let ordersList = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          ordersList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
        }

        ordersList.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        setOrders(ordersList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-slate-900">
            MY ORDERS
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage your jewellery orders
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <OrderListSkeleton count={3} />
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-6">
              <Package className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-light text-slate-900 mb-2">No Orders Yet</h2>
            <p className="text-slate-500 mb-6 max-w-sm">
              When you make a purchase, your order details and tracking information will appear here.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
            >
              Start Shopping
            </button>
          </motion.div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
