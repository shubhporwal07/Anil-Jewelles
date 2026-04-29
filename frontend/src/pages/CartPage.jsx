import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, ArrowLeft, CheckCircle, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useProducts } from '../contexts/ProductContext';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { auth, realtimeDb } from '../config/firebase';
import { ref as rtdbRef, push, set } from 'firebase/database';

const getBackendUrl = () => {
  const raw = (import.meta.env.VITE_BACKEND_URL || '').trim();
  if (!raw) return '';
  // Only add protocol if none is present; use http for localhost, https otherwise
  let url = raw;
  if (!/^https?:\/\//i.test(url)) {
    url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
  }
  return url.replace(/\/+$/, '');
};

const BACKEND_URL = getBackendUrl();
const API_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart } = useProducts();
  const [giftNote, setGiftNote] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'address' | 'payment'
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [addressErrors, setAddressErrors] = useState({});

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  // Save order to Realtime Database
  const saveOrderToDatabase = async (paymentData) => {
    try {
      const ordersRef = rtdbRef(realtimeDb, 'orders');
      const newOrderRef = push(ordersRef);

      const orderDoc = {
        // User info
        userId: auth.currentUser?.uid || 'guest',
        userEmail: auth.currentUser?.email || '',
        userName: auth.currentUser?.displayName || '',

        // Order items
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          metalType: item.metalType || '',
          selectedSize: item.selectedSize || null,
          imageUrl: item.imageUrl || item.imageData || '',
        })),

        // Payment info
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        amount: subtotal,
        currency: 'INR',
        status: 'paid',

        // Extra
        giftNote: giftNote || '',
        shippingAddress: shippingAddress,
        createdAt: new Date().toISOString(),
      };

      await set(newOrderRef, orderDoc);
      console.log('✅ Order saved to Realtime DB:', newOrderRef.key);
      return newOrderRef.key;
    } catch (error) {
      console.error('Failed to save order to Database:', error);
      alert(`Payment was successful, but saving to database failed: ${error.message}. Check Firebase rules.`);
      // Don't block the success flow — payment was already successful
      return null;
    }
  };

  const validateAddress = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) errors.phone = 'Enter a valid 10-digit phone number';
    if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToAddress = () => {
    setCheckoutStep('address');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = () => {
    if (!validateAddress()) return;
    handleCheckout();
  };

  const handleCheckout = async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);

    try {
      if (!API_URL) {
        throw new Error('Backend URL is missing. Set VITE_BACKEND_URL to your deployed backend URL.');
      }

      // 1. Create Razorpay order via Express backend
      const orderRes = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal,
          cartItems: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const { orderId, amount, currency, key } = orderData;

      // 2. Open Razorpay payment popup
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "ANIL JEWELLER'S",
        description: 'Jewellery Purchase',
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify payment via Express backend
            const verifyRes = await fetch(`${API_URL}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 4. Save order to Realtime Database
              await saveOrderToDatabase(response);

              setPaidOrderId(verifyData.paymentId);
              setPaymentSuccess(true);
              if (clearCart) clearCart();
              showToast('Payment successful! Thank you for your order.', 'success');
            } else {
              showToast('Payment verification failed. Please contact support.', 'error');
            }
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            showToast('Payment verification failed. Please contact support.', 'error');
          }
          setPaymentLoading(false);
        },
        prefill: {
          name: shippingAddress.fullName || '',
          email: auth.currentUser?.email || '',
          contact: shippingAddress.phone || '',
        },
        theme: {
          color: '#0a1e3f',
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            showToast('Payment was cancelled.', 'info');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentLoading(false);
        showToast(`Payment failed: ${response.error.description}`, 'error');
      });
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      const backendHint = BACKEND_URL ? ` Cannot reach backend: ${BACKEND_URL}.` : '';
      showToast(
        (error.message || 'Failed to initiate payment. Please try again.') + backendHint,
        'error'
      );
      setPaymentLoading(false);
    }
  };

  const formatPrice = (price) => {
    return '₹' + (price || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const estimatedShipping = subtotal > 0 ? 0 : 0; // Free shipping
  const estimatedTax = subtotal * 0.18; // 18% tax
  const total = subtotal + estimatedShipping + estimatedTax;

  // Payment success view
  if (paymentSuccess) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-16 sm:py-24 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center bg-white rounded-2xl p-8 sm:p-12 shadow-lg max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-2">Thank you for your order.</p>
            {paidOrderId && (
              <p className="text-sm text-gray-500 mb-8">Payment ID: {paidOrderId}</p>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
        <Footer />
      </motion.div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="min-h-screen bg-gray-50"
      >
        <Navbar />
        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 sm:mb-8 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>

          <div className="flex items-center justify-center py-12 sm:py-24">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-light text-gray-900 mb-2">Your Shopping Cart is Empty</p>
              <p className="text-gray-600 mb-8">Add some beautiful jewellery to get started</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 sm:px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm sm:text-base"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </motion.div>
        <Footer />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gray-50"
    >
      <Navbar />

      <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Continue Shopping
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-gray-900">YOUR SHOPPING CART</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
              <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  key={`${item.id}-${index}`}
                  className="border-b border-gray-200 pb-8 mb-8 last:border-b-0 last:pb-0 last:mb-0"
                >
                  {/* Product Item */}
                  <div className="flex gap-3 sm:gap-4 md:gap-6 flex-col sm:flex-row">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 aspect-square">
                      <img
                        src={item.imageData || item.imageUrl || 'https://via.placeholder.com/150x150?text=Product'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3">
                        {item.metalType && <span>Metal: {item.metalType}</span>}
                        {item.selectedSize && <span className="ml-4">Size: {item.selectedSize}' (added option)</span>}
                      </p>

                      {/* Product Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-gray-900 transition text-sm"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 sm:w-12 text-center border-l border-r border-gray-300 py-1 sm:py-2 focus:outline-none text-sm"
                            min="1"
                          />
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-gray-900 transition text-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="sm:ml-auto">
                          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}

                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeFromCart(item.id)}
                      className="mt-2 text-red-600 hover:text-red-700 transition"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>

              {/* Gift Note Section */}
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-3">
                  Add a gift note to your order (optional)
                </label>
                <textarea
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Write your gift message here..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white rounded-lg p-4 sm:p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-light tracking-wide text-gray-900 mb-6">Order Summary</h2>

              {/* Summary Items */}
              <div className="space-y-3 sm:space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-gray-900">Complimentary Insured</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-gray-900">Calculated at checkout</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatPrice(subtotal)}</p>

                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: paymentLoading ? 1 : 1.01 }}
                whileTap={{ scale: paymentLoading ? 1 : 0.99 }}
                onClick={handleProceedToAddress}
                disabled={paymentLoading}
                className="w-full py-2 px-4 sm:py-3 sm:px-6 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition mb-4 sm:mb-6 text-sm sm:text-base md:text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    PROCESSING...
                  </span>
                ) : (
                  'PROCEED TO CHECKOUT'
                )}
              </motion.button>

              {/* Continue Shopping */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-900 hover:underline transition font-medium text-sm sm:text-base"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </div>
    </div>
      </motion.div>

      {/* Address Step */}
      <AnimatePresence>
        {checkoutStep === 'address' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setCheckoutStep('cart')}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-900 rounded-full p-2">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                    <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="px-6 py-5 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${addressErrors.fullName ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {addressErrors.fullName && <p className="text-xs text-red-500 mt-1">{addressErrors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${addressErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {addressErrors.phone && <p className="text-xs text-red-500 mt-1">{addressErrors.phone}</p>}
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="House no., Street, Area"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${addressErrors.addressLine1 ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {addressErrors.addressLine1 && <p className="text-xs text-red-500 mt-1">{addressErrors.addressLine1}</p>}
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 <span className="text-gray-400">(Optional)</span></label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                    placeholder="Landmark, Apartment, etc."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${addressErrors.city ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {addressErrors.city && <p className="text-xs text-red-500 mt-1">{addressErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${addressErrors.state ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {addressErrors.state && <p className="text-xs text-red-500 mt-1">{addressErrors.state}</p>}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${addressErrors.pincode ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {addressErrors.pincode && <p className="text-xs text-red-500 mt-1">{addressErrors.pincode}</p>}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition text-sm"
                >
                  Back to Cart
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleProceedToPayment}
                  disabled={paymentLoading}
                  className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </motion.div>
  );
}
