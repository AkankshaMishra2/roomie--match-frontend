// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB0tW9q1mOLcG6T38esce4Dn-SxStSQV8s",
  authDomain: "roomie-match-01.firebaseapp.com",
  projectId: "roomie-match-01",
  storageBucket: "roomie-match-01.firebasestorage.app",
  messagingSenderId: "926512031667",
  appId: "1:926512031667:web:d7bd0e1a3025ce9eb7cdc6",
  measurementId: "G-4K5Z9CJWBE",
  databaseURL: "https://roomie-match-01.firebaseio.com" // Added databaseURL
};

// Initialize Firebase only if no apps exist (prevents multiple initializations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);

// For local development with emulators (uncomment if using Firebase emulators)
// if (process.env.NODE_ENV === 'development') {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectDatabaseEmulator(database, 'localhost', 9000);
// }

export default app;