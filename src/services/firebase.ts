import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  const { apiKey, projectId, appId } = firebaseConfig;
  return Boolean(
    apiKey &&
    apiKey !== 'your-firebase-api-key' &&
    apiKey !== 'your_api_key_here' &&
    !apiKey.includes('your_api_key') &&
    projectId &&
    projectId !== 'your-project-id' &&
    projectId !== 'your_project_id' &&
    !projectId.includes('your_project_id') &&
    appId &&
    appId !== 'your_app_id' &&
    !appId.includes('your_app_id')
  );
};

export const isFirebaseStorageConfigured = (): boolean => {
  return Boolean(
    isFirebaseConfigured() &&
    storage &&
    firebaseConfig.storageBucket &&
    firebaseConfig.storageBucket !== 'your_project_id.appspot.com' &&
    !firebaseConfig.storageBucket.includes('your_project_id')
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Failed to initialize Firebase with current configuration:', error);
  }
}

export {
  app,
  auth,
  db,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  fetchSignInMethodsForEmail,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
};
