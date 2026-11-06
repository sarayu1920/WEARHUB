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
  fetchSignInMethodsForEmail,
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

const PREVIEW_USERS_KEY = 'wearhub_preview_users';
const ACTIVE_USER_KEY = 'wearhub_active_user';
const LOGGED_OUT_KEY = 'wearhub_logged_out';

const getStoredPreviewUsers = (): UserProfile[] => {
  try {
    const saved = localStorage.getItem(PREVIEW_USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveStoredPreviewUser = (user: UserProfile) => {
  try {
    const current = getStoredPreviewUsers();
    const filtered = current.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    localStorage.setItem(PREVIEW_USERS_KEY, JSON.stringify([user, ...filtered]));
  } catch (err) {
    console.error('Failed to save preview user:', err);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebaseReady = isFirebaseConfigured();

  // Load user session from Firebase if configured, or restore preview session
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
                // Initialize profile if not found
                const newProfile: UserProfile = {
                  uid: user.uid,
                  email: user.email || '',
                  displayName: user.displayName || 'Campus Student',
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
      // In preview/demo mode without live Firebase keys: restore active session if previously signed in
      const savedActive = sessionStorage.getItem(ACTIVE_USER_KEY) || sessionStorage.getItem('wearhub_demo_user');
      const isLoggedOut = sessionStorage.getItem(LOGGED_OUT_KEY);

      if (savedActive && !isLoggedOut) {
        try {
          setCurrentUser(JSON.parse(savedActive));
        } catch {
          setCurrentUser(null);
        }
      } else {
        // Visitors start as logged-out guests and must sign in
        setCurrentUser(null);
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
    const emailNormalized = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    try {
      if (!isFirebaseReady || !auth || !db) {
        // Check for duplicate account in preview accounts
        const allPreviewUsers = [...DEMO_USERS, ...getStoredPreviewUsers()];
        const exists = allPreviewUsers.some((u) => u.email.toLowerCase() === emailNormalized);
        if (exists) {
          const err: any = new Error('An account with this email already exists. Please log in.');
          err.code = 'auth/email-already-in-use';
          throw err;
        }

        // Create new preview user (NEVER store plaintext password)
        const mockUser: UserProfile = {
          uid: 'preview-user-' + Date.now(),
          email: emailNormalized,
          displayName: trimmedName,
          homeUniversity,
          savedListingIds: [],
          createdAt: new Date().toISOString(),
        };

        saveStoredPreviewUser(mockUser);
        sessionStorage.removeItem(LOGGED_OUT_KEY);
        sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        return;
      }

      // Live Firebase registration
      const cred = await createUserWithEmailAndPassword(auth, emailNormalized, password);
      await updateProfile(cred.user, { displayName: trimmedName });

      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || emailNormalized,
        displayName: trimmedName,
        homeUniversity,
        photoURL: cred.user.photoURL || '',
        savedListingIds: [],
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore, rollback auth user if profile creation fails to prevent orphaned auth accounts
      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch (firestoreErr) {
        console.error('Failed to create Firestore profile document. Rolling back auth user:', firestoreErr);
        try {
          await cred.user.delete();
        } catch (cleanupErr) {
          console.warn('Could not delete orphaned auth user:', cleanupErr);
        }
        throw new Error('Database error: Unable to create user profile in Firestore. Please try again.');
      }

      setCurrentUser(newProfile);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Email/Password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const emailNormalized = email.trim().toLowerCase();

    try {
      if (!isFirebaseReady || !auth || !db) {
        // Find user in preview users
        const allPreviewUsers = [...DEMO_USERS, ...getStoredPreviewUsers()];
        const matched = allPreviewUsers.find((u) => u.email.toLowerCase() === emailNormalized);

        if (!matched) {
          const err: any = new Error("You’re not registered yet. Please create an account to continue.");
          err.code = 'auth/user-not-found';
          throw err;
        }

        // Support testing wrong password simulation in Preview Mode
        if (
          password.toLowerCase() === 'wrong' ||
          password.toLowerCase() === 'wrongpassword' ||
          password.toLowerCase() === 'incorrect'
        ) {
          const err: any = new Error('Incorrect email or password. Please try again.');
          err.code = 'auth/wrong-password';
          throw err;
        }

        sessionStorage.removeItem(LOGGED_OUT_KEY);
        sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(matched));
        setCurrentUser(matched);
        return;
      }

      // Live Firebase authentication
      try {
        const cred = await signInWithEmailAndPassword(auth, emailNormalized, password);
        const userDocRef = doc(db, 'users', cred.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setCurrentUser(userDoc.data() as UserProfile);
        } else {
          // Fallback profile if user document doesn't exist
          const fallbackProfile: UserProfile = {
            uid: cred.user.uid,
            email: cred.user.email || emailNormalized,
            displayName: cred.user.displayName || emailNormalized.split('@')[0],
            homeUniversity: 'VIT-AP University',
            savedListingIds: [],
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, fallbackProfile);
          setCurrentUser(fallbackProfile);
        }
      } catch (fbErr: any) {
        const fbCode = fbErr?.code || '';

        // If Firebase specifically identifies user-not-found, pass it through directly
        if (fbCode === 'auth/user-not-found') {
          const unregisteredErr: any = new Error("You’re not registered yet. Please create an account to continue.");
          unregisteredErr.code = 'auth/user-not-found';
          throw unregisteredErr;
        }

        // If Firebase returned generic invalid credential (auth/invalid-credential or auth/invalid-login-credentials),
        // probe sign-in methods to verify if the email is registered
        if (fbCode === 'auth/invalid-credential' || fbCode === 'auth/invalid-login-credentials') {
          try {
            const methods = await fetchSignInMethodsForEmail(auth, emailNormalized);
            if (methods && methods.length === 0) {
              const unregisteredErr: any = new Error("You’re not registered yet. Please create an account to continue.");
              unregisteredErr.code = 'auth/user-not-found';
              throw unregisteredErr;
            } else if (methods && methods.length > 0) {
              const wrongPassErr: any = new Error('Incorrect email or password. Please try again.');
              wrongPassErr.code = 'auth/wrong-password';
              throw wrongPassErr;
            }
          } catch (probeErr: any) {
            if (probeErr?.code === 'auth/user-not-found') {
              const unregisteredErr: any = new Error("You’re not registered yet. Please create an account to continue.");
              unregisteredErr.code = 'auth/user-not-found';
              throw unregisteredErr;
            }
            // If probe error occurs or email enumeration protection is enforced, keep original fbErr
          }
        }

        throw fbErr;
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
        // Clearly report that Google sign-in requires live Firebase configuration
        throw new Error(
          'Google sign-in requires live Firebase configuration. In Preview Mode, Google sign-in is disabled. Please configure Firebase credentials or use the preview test accounts.'
        );
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const cred = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Existing user: preserve existing profile data
        setCurrentUser(userDoc.data() as UserProfile);
      } else {
        // New Google user: initialize profile document
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Campus Student',
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
    sessionStorage.removeItem(ACTIVE_USER_KEY);
    sessionStorage.removeItem('wearhub_demo_user');
    sessionStorage.setItem(LOGGED_OUT_KEY, 'true');
    setCurrentUser(null);
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    const emailNormalized = email.trim().toLowerCase();
    if (isFirebaseReady && auth) {
      await sendPasswordResetEmail(auth, emailNormalized);
    } else {
      // Preview mode simulation
      console.log('Preview Mode: Password reset link simulated for:', emailNormalized);
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
      sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updated));
      saveStoredPreviewUser(updated);
    }
  };

  // Update Profile Data (Never allow modifying immutable uid or email)
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    // Disallow modifying uid or email
    const { uid: _uid, email: _email, ...allowedUpdates } = data;
    const updated = { ...currentUser, ...allowedUpdates };
    setCurrentUser(updated);

    if (isFirebaseReady && db) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), allowedUpdates);
      } catch (err) {
        console.error('Failed to update user profile in Firestore:', err);
      }
    } else {
      sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updated));
      saveStoredPreviewUser(updated);
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
      sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedUser));
      saveStoredPreviewUser(updatedUser);
    }
  };

  // Quick switch for demo testing (strictly disabled in production with Firebase)
  const loginAsDemoUser = (index: number = 0) => {
    if (isFirebaseReady) {
      console.warn('Demo user switcher is strictly disabled when live Firebase is active.');
      return;
    }
    const user = DEMO_USERS[index % DEMO_USERS.length];
    sessionStorage.removeItem(LOGGED_OUT_KEY);
    sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
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
