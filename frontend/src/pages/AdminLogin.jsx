import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';

export default function AdminLogin({ onLoginSuccess }) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const validateForm = () => {
    const newErrors = {};

    if (!adminId.trim()) {
      newErrors.adminId = 'Admin ID is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Hardcoded admin credentials
      if (adminId === 'admin' && password === 'admin9876') {
        // Store admin session
        localStorage.setItem('adminSession', JSON.stringify({
          adminId: 'admin',
          loginTime: new Date().toISOString(),
          isAdmin: true,
        }));

        setToast({
          show: true,
          message: 'Admin login successful!',
          type: 'success',
        });

        // Call the callback after a short delay
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setToast({
          show: true,
          message: 'Invalid Admin ID or Password',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setToast({
        show: true,
        message: 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ANIL JEWELLER&apos;S</h1>
          <p className="text-gray-400">Admin Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin ID
            </label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => {
                setAdminId(e.target.value);
                if (errors.adminId) {
                  setErrors({ ...errors, adminId: '' });
                }
              }}
              placeholder="Enter admin ID"
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                errors.adminId ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
              }`}
            />
            {errors.adminId && (
              <p className="text-red-500 text-sm mt-1">{errors.adminId}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                placeholder="Enter password"
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 pr-10 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-900 border border-blue-700 rounded p-3 text-sm text-blue-200">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Admin ID: <span className="font-mono">admin</span></p>
            <p>Password: <span className="font-mono">admin</span></p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Secure Admin Access
        </p>
      </div>
    </div>
  );
}
