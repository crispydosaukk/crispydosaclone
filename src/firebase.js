// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
    apiKey: "AIzaSyCNq8r4yt3w9mc8sv1SG-5REVTUV5EQguw",
    authDomain: "crisppydosaclone.firebaseapp.com",
    projectId: "crisppydosaclone",
    storageBucket: "crisppydosaclone.firebasestorage.app",
    messagingSenderId: "493939013573",
    appId: "1:493939013573:web:71b1ff3e4f22c80b6bbdac",
    measurementId: "G-2LNYHC8CKF"
};

// Initialize Firebase
console.log("Firebase: Initializing app with Project ID:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);

// Initialize Firestore (for database)
const db = getFirestore(app);

// Initialize Firebase Auth (for authentication)
const auth = getAuth(app);

// Initialize Firebase Storage (for file storage)
const storage = getStorage(app); // Initialize storage

console.log("Firebase: SDKs initialized.");

export { db, auth, storage }; // Export storage along with db and auth
export default app;
