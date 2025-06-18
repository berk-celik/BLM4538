import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKkpw7cAZ4zlxyEN2LLSQ9RpSy2XkzV68",
  authDomain: "deneme-7daa0.firebaseapp.com",
  projectId: "deneme-7daa0",
  storageBucket: "deneme-7daa0.firebasestorage.app",
  messagingSenderId: "51840872513",
  appId: "1:51840872513:android:2a8b7291328ae9f40f16c0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 