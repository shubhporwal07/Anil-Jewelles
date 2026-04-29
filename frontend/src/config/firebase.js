import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD_qxGvqB_lJmmN3UPgn-GbMAog3BC-MB4",
  authDomain: "anil-jewellers-b1562.firebaseapp.com",
  databaseURL: "https://anil-jewellers-b1562-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anil-jewellers-b1562",
  storageBucket: "anil-jewellers-b1562.firebasestorage.app",
  messagingSenderId: "510325615866",
  appId: "1:510325615866:web:1eec476fd6d151e98d6d43",
  measurementId: "G-V966X2CQG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;
