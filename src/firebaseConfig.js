// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// ⚠️ แทนที่ค่าเหล่านี้ด้วย Config จาก Firebase Console ของเจ้า
const firebaseConfig = {
  apiKey: "AIzaSyCYl0F37MOb-j00zZO7mk4On_0CMjwd_LM",
  authDomain: "tiewson.firebaseapp.com",
  projectId: "tiewson",
  storageBucket: "tiewson.firebasestorage.app",
  messagingSenderId: "596847215552",
  appId: "1:596847215552:web:78c5d81e4d1ba93d393e25",
  measurementId: "G-D19WL29YP6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;