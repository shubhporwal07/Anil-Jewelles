import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { ref as rtdbRef, get, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

export default function AnnouncementPopup({ userId, onDismiss }) {
  const [announcement, setAnnouncement] = useState(null);
  const [hasSeenThis, setHasSeenThis] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    checkAndShowAnnouncement();
  }, [userId]);

  const checkAndShowAnnouncement = async () => {
    try {
      // Fetch current announcement
      const announcementSnapshot = await get(rtdbRef(realtimeDb, 'announcements/current'));
      
      if (!announcementSnapshot.exists()) {
        setLoading(false);
        return;
      }

      const currentAnnouncement = announcementSnapshot.val();

      // For "everytime" type, always show
      if (currentAnnouncement.type === 'everytime') {
        setAnnouncement(currentAnnouncement);
        setLoading(false);
        return;
      }

      // For "once" type, check if user has already seen this announcement
      if (currentAnnouncement.type === 'once') {
        const seenSnapshot = await get(
          rtdbRef(realtimeDb, `announcements/seen/${userId}`)
        );

        if (seenSnapshot.exists() && seenSnapshot.val() === currentAnnouncement.createdAt) {
          setHasSeenThis(true);
          setLoading(false);
          return;
        }

        // Show the announcement
        setAnnouncement(currentAnnouncement);
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Error checking announcement:', err);
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!userId || !announcement) return;

    try {
      // For "once" type, mark announcement as seen
      if (announcement.type === 'once') {
        await set(
          rtdbRef(realtimeDb, `announcements/seen/${userId}`),
          announcement.createdAt
        );
      }
      // For "everytime" type, don't mark as seen - will show every time
      
      setAnnouncement(null);
      onDismiss?.();
    } catch (err) {
      console.error('Error marking announcement as seen:', err);
    }
  };

  if (loading || !announcement || hasSeenThis) {
    return null;
  }

  return (
    <AnimatePresence>
      {announcement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-gradient-to-b from-white to-stone-100 rounded-3xl shadow-2xl max-w-sm w-full px-8 py-14 text-center border border-amber-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 250 }}
              className="flex justify-center mb-6"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center border border-amber-400/40">
                <Bell className="w-7 h-7 text-amber-500 animate-bounce" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-bold text-slate-900 mb-4 font-serif"
            >
              Notification
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-base leading-relaxed mb-8 font-sans"
            >
              {announcement.message}
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.25 }}
              className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-6"
            />

            {/* Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="text-amber-500 font-semibold text-lg hover:text-amber-600 transition duration-200 tracking-wide"
            >
              OK
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
