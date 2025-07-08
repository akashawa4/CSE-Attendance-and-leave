// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqzZiPX2z3gdwXoSFOEnn1Qjkdx8--y6Q",
  authDomain: "cse-attendance-system-9c4e5.firebaseapp.com",
  projectId: "cse-attendance-system-9c4e5",
  storageBucket: "cse-attendance-system-9c4e5.firebasestorage.app",
  messagingSenderId: "788844291261",
  appId: "1:788844291261:web:e984629a1505859eb003d4",
  databaseURL: "hhttps://cse-attendance-system-9c4e5-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const db = getFirestore(app);