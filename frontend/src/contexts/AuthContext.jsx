import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create Auth Context
const AuthContext = createContext(null);

// Demo mode flag - set to true to bypass authentication
const DEMO_MODE = false;

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (DEMO_MODE) {
      // Demo mode: skip real authentication
      setUser({ 
        uid: 'demo-user', 
        email: 'demo@aniljewellers.com',
        displayName: 'Demo Admin'
      });
      setUserRole('admin');
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        
        if (currentUser) {
          setUserRole('user');
          setLoading(false);

          try {
            // Fetch user role from Firestore
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              setUserRole(userDocSnap.data().role || 'user');
            } else {
              // Default role if no user document exists
              setUserRole('user');
            }
          } catch (err) {
            console.error('Error fetching user role:', err);
            setUserRole('user'); // Default role on error
          }
        } else {
          setUserRole(null);
          setLoading(false);
        }
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, db]);

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      localStorage.removeItem('adminSession');
      setUser(null);
      setUserRole(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
