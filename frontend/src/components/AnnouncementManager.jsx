import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Clock, RotateCw } from 'lucide-react';
import { ref as rtdbRef, set, get, remove } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import ConfirmDialog from './ConfirmDialog';

export default function AnnouncementManager() {
  const [message, setMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState('once');
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCurrentAnnouncement();
  }, []);

  const fetchCurrentAnnouncement = async () => {
    try {
      const snapshot = await get(rtdbRef(realtimeDb, 'announcements/current'));
      if (snapshot.exists()) {
        setCurrentAnnouncement(snapshot.val());
        setMessage(snapshot.val().message || '');
        setAnnouncementType(snapshot.val().type || 'once');
      }
    } catch (err) {
      console.error('Error fetching announcement:', err);
    }
  };

  const handlePublish = async () => {
    if (!message.trim()) {
      showToast('Please enter an announcement message', 'error');
      return;
    }

    setLoading(true);
    try {
      const announcementData = {
        message: message.trim(),
        type: announcementType,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
      };

      await set(rtdbRef(realtimeDb, 'announcements/current'), announcementData);
      
      // Clear seen announcements for "once" type to show it again
      if (announcementType === 'once') {
        await remove(rtdbRef(realtimeDb, 'announcements/seen'));
      }
      
      setCurrentAnnouncement(announcementData);
      setMessage('');
      setAnnouncementType('once');
      showToast('Announcement published successfully!', 'success');
    } catch (err) {
      console.error('Error publishing announcement:', err);
      showToast('Failed to publish announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    setLoading(true);
    try {
      await remove(rtdbRef(realtimeDb, 'announcements/current'));
      await remove(rtdbRef(realtimeDb, 'announcements/seen'));
      setCurrentAnnouncement(null);
      setMessage('');
      showToast('Announcement deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting announcement:', err);
      showToast('Failed to delete announcement', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Announcement</h3>
          
          <div className="space-y-4">
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Announcement Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your announcement message here... (e.g., 'New collection launched! Check out our latest designs.')"
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{message.length} characters</p>
            </div>

            {/* Announcement Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Show Type *
              </label>
              <div className="space-y-2">
                <motion.label
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-slate-900 transition"
                >
                  <input
                    type="radio"
                    name="type"
                    value="once"
                    checked={announcementType === 'once'}
                    onChange={(e) => setAnnouncementType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <Clock className="w-4 h-4 ml-3 text-gray-600" />
                  <div className="ml-2">
                    <span className="text-sm font-medium text-gray-700">Show Once</span>
                    <p className="text-xs text-gray-500">Users see it only once on first login</p>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-slate-900 transition"
                >
                  <input
                    type="radio"
                    name="type"
                    value="everytime"
                    checked={announcementType === 'everytime'}
                    onChange={(e) => setAnnouncementType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <RotateCw className="w-4 h-4 ml-3 text-gray-600" />
                  <div className="ml-2">
                    <span className="text-sm font-medium text-gray-700">Show Every Time</span>
                    <p className="text-xs text-gray-500">Users see it every time they login/visit</p>
                  </div>
                </motion.label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Publishing...' : 'Publish Announcement'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Current Announcement */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Announcement</h3>
          
          {currentAnnouncement ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 leading-relaxed">
                  {currentAnnouncement.message}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">
                    {currentAnnouncement.type === 'once' ? 'Show Once' : 'Show Every Time'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(currentAnnouncement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                <X className="w-4 h-4" />
                Delete Announcement
              </motion.button>
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No announcement currently published</p>
              <p className="text-xs text-gray-400 mt-2">Create one to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={loading}
        onConfirm={handleDeleteAnnouncement}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
