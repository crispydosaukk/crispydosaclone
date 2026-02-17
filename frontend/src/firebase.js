// src/firebase.js
// Firebase configuration has been shifted to the backend for security and centralized management.
// The frontend should now interact with the database via the backend API.

/*
// PREVIOUS FRONTEND CONFIG (MOVED TO BACKEND)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
*/

// Example of how to fetch data from the backend instead:
// fetch('http://localhost:5000/test-db').then(res => res.json()).then(console.log);

export default {};
