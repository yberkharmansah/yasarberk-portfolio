// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Dosya yüklemeleri için storage da ekleyelim

// Firebase configuration (Kendi bilgilerinizi buraya yapıştırın)
const firebaseConfig = {
 apiKey: "AIzaSyAW3KHw1giX5smLJ0dbWtbrXspQX0S-yrA",
  authDomain: "yasar-berk-harmansah.firebaseapp.com",
  projectId: "yasar-berk-harmansah",
  storageBucket: "yasar-berk-harmansah.firebasestorage.app",
  messagingSenderId: "1096857507778",
  appId: "1:1096857507778:web:d6d1d4b0dc3f1692c3285b",
  measurementId: "G-XLWCDY32HR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };