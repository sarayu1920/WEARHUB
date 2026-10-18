import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  auth,
  db,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, homeUniversity: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateHomeUniversity: (university: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleSaveListing: (listingId: string) => Promise<void>;
  // Demo mode switcher for exploring without live credentials
  loginAsDemoUser: (demoIndex?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Realistic demo users for test environments
export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'demo-student-1',
    email: 'arjun.verma@vitap.ac.in',
    displayName: 'Arjun Verma',
    homeUniversity: 'VIT-AP University',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'B.Tech CSE @ VIT-AP | Fashion enthusiast | Always open to lending suits and festival wear',
    studentId: '22BCE1045',
    phone: '+91 98765 43210',
    savedListingIds: ['sample-2', 'sample-5'],
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'demo-student-2',
    email: 'priya.s@srmap.edu.in',
    displayName: 'Priya Sundaram',
    homeUniversity: 'SRM University AP',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'SRM-AP Final Year | Dance team coordinator | Big fan of circular sustainable clothing!',
    studentId: 'AP211100102',
    phone: '+91 98450 12345',
    savedListingIds: ['sample-1', 'sample-3'],
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebaseReady = isFirebaseConfigured();

  // Load user session from Firebase if configured, or check demo user state
  useEffect(() => {
    if (isFirebaseReady && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            if (db) {
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);

              if (userDoc.exists()) {
                setCurrentUser(userDoc.data() as UserProfile);
              } else {
                // Initialize profile if new
                const newProfile: UserProfile = {
                  uid: user.uid,
                  email: user.email || '',
                  displayName: user.displayName || 'Student',
                  photoURL: user.photoURL || '',
                  homeUniversity: 'VIT-AP University',
                  savedListingIds: [],
                  createdAt: new Date().toISOString(),
                };
                await setDoc(userDocRef, newProfile);
                setCurrentUser(newProfile);
              }
            }
          } catch (err) {
            console.error('Error fetching Firestore user profile:', err);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // In demo/test mode without Firebase keys
      const savedDemo = sessionStorage.getItem('wearhub_demo_user');
      if (savedDemo) {
        try {
          setCurrentUser(JSON.parse(savedDemo));
        } catch {
          setCurrentUser(null);
        }
      } else {
        // By default, start as guest or demo user
        setCurrentUser(DEMO_USERS[0]);
      }
      setLoading(false);
    }
  }, [isFirebaseReady]);

  // Sign up with Email/Password
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    homeUniversity: string
  ) => {
    setLoading(true);
    try {
      if (!isFirebaseReady || !auth || !db) {
        // Demo mode fallback
        const mockUser: UserProfile = {
          uid: 'user-' + Date.now(),
          email,
          displayName: fullName,
          homeUniversity,
          savedListingIds: [],
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(mockUser);
        sessionStorage.setItem('wearhub_demo_user', JSON.stringify(mockUser));
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });

      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: fullName,
        homeUniversity,
        photoURL: cred.user.photoURL || '',
        savedListingIds: [],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setCurrentUser(newProfile);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Email/Password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!isFirebaseReady || !auth || !db) {
        // Check if demo user
        const mockUser: UserProfile = {
          uid: 'user-' + Date.now(),
          email,
          displayName: email.split('@')[0],
          homeUniversity: 'VIT-AP University',
          savedListingIds: [],
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(mockUser);
        sessionStorage.setItem('wearhub_demo_user', JSON.stringify(mockUser));
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDoc.exists()) {
        setCurrentUser(userDoc.data() as UserProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (!isFirebaseReady || !auth || !db) {
        const mockUser: UserProfile = {
          ...DEMO_USERS[0],
          displayName: 'Google Campus User',
        };
        setCurrentUser(mockUser);
        sessionStorage.setItem('wearhub_demo_user', JSON.stringify(mockUser));
        return;
      }

      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setCurrentUser(userDoc.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Student',
          photoURL: cred.user.photoURL || '',
          homeUniversity: 'VIT-AP University',
          savedListingIds: [],
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setCurrentUser(newProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseReady && auth) {
      await signOut(auth);
    }
    sessionStorage.removeItem('wearhub_demo_user');
    setCurrentUser(null);
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    if (isFirebaseReady && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log('Demo mode password reset simulated for:', email);
    }
  };

  // Update Home University
  const updateHomeUniversity = async (university: string) => {
    if (!currentUser) return;

    const updated = { ...currentUser, homeUniversity: university };
    setCurrentUser(updated);

    if (isFirebaseReady && db) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), { homeUniversity: university });
      } catch (err) {
        console.error('Failed to update home university in Firestore:', err);
      }
    } else {
      sessionStorage.setItem('wearhub_demo_user', JSON.stringify(updated));
    }
  };

  // Update Profile Data
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);

    if (isFirebaseReady && db) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), data);
      } catch (err) {
        console.error('Failed to update user profile in Firestore:', err);
      }
    } else {
      sessionStorage.setItem('wearhub_demo_user', JSON.stringify(updated));
    }
  };

  // Toggle Save Listing
  const toggleSaveListing = async (listingId: string) => {
    if (!currentUser) return;

    const saved = currentUser.savedListingIds || [];
    const isSaved = saved.includes(listingId);
    const updatedSaved = isSaved ? saved.filter((id) => id !== listingId) : [...saved, listingId];

    const updatedUser = { ...currentUser, savedListingIds: updatedSaved };
    setCurrentUser(updatedUser);

    if (isFirebaseReady && db) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          savedListingIds: updatedSaved,
        });
      } catch (err) {
        console.error('Failed to update saved listings in Firestore:', err);
      }
    } else {
      sessionStorage.setItem('wearhub_demo_user', JSON.stringify(updatedUser));
    }
  };

  // Quick switch for demo testing
  const loginAsDemoUser = (index: number = 0) => {
    const user = DEMO_USERS[index % DEMO_USERS.length];
    setCurrentUser(user);
    sessionStorage.setItem('wearhub_demo_user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirebaseReady,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        resetPassword,
        updateHomeUniversity,
        updateProfileData,
        toggleSaveListing,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
