import React, { createContext, useContext, useState, useEffect } from 'react';
import { Listing, BorrowRequest, FilterOptions, DeleteListingResult } from '../types';
import { SAMPLE_LISTINGS } from '../data/sampleListings';
import { useAuth } from './AuthContext';
import {
  auth,
  db,
  isFirebaseConfigured,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from '../services/firebase';

import {
  savePhotoToIndexedDB,
  getPhotoFromIndexedDB,
  deletePhotoFromIndexedDB,
  getCategoryFallbackImage,
} from '../utils/imageStorage';

interface ListingContextType {
  listings: Listing[];
  loading: boolean;
  createListing: (newListing: Omit<Listing, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerEmail' | 'ownerUniversity'>) => Promise<string>;
  deleteListing: (id: string) => Promise<DeleteListingResult>;
  getListingById: (id: string) => Listing | undefined;
  createBorrowRequest: (
    listing: Listing,
    startDate: string,
    endDate: string,
    occasion: string,
    message: string
  ) => Promise<BorrowRequest>;
  borrowRequests: BorrowRequest[];
  updateBorrowRequestStatus: (requestId: string, status: BorrowRequest['status']) => void;
  filterListings: (options: Partial<FilterOptions>, customList?: Listing[]) => Listing[];
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const ListingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userCreatedListings, setUserCreatedListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('wearhub_custom_listings');
    return saved ? JSON.parse(saved) : [];
  });
  const [deletedListingIds, setDeletedListingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('wearhub_deleted_listing_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>(() => {
    const saved = localStorage.getItem('wearhub_borrow_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Realistic initial sample borrow request
    return [
      {
        id: 'borrow-sample-1',
        listingId: 'sample-1',
        listingTitle: 'Royal Navy Blue Slim-Fit Blazer & Trousers Set',
        listingImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
        ownerId: 'sample-user-1',
        requesterId: 'demo-student-2',
        requesterName: 'Priya Sundaram',
        requesterUniversity: 'SRM University AP',
        startDate: '2026-10-22',
        endDate: '2026-10-24',
        occasion: 'Placement Group Discussion & Technical Interview',
        message: 'Hi Arjun! Would love to borrow your navy blazer for my upcoming interview on campus. Will take great care of it and return it dry cleaned!',
        calculatedCost: 300,
        securityDeposit: 500,
        status: 'pending',
        createdAt: '2026-10-17T11:00:00Z',
      },
    ];
  });

  const [firestoreListings, setFirestoreListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync custom listings to storage
  useEffect(() => {
    localStorage.setItem('wearhub_custom_listings', JSON.stringify(userCreatedListings));
  }, [userCreatedListings]);

  // Sync deleted listing IDs to storage
  useEffect(() => {
    localStorage.setItem('wearhub_deleted_listing_ids', JSON.stringify(deletedListingIds));
  }, [deletedListingIds]);

  // Rehydrate photos from IndexedDB if needed
  useEffect(() => {
    let isMounted = true;
    const rehydratePhotos = async () => {
      try {
        const updated = await Promise.all(
          userCreatedListings.map(async (item) => {
            if (item.isLocalPrototype) {
              const cached = await getPhotoFromIndexedDB(item.id);
              if (cached && cached !== item.images[0]) {
                return { ...item, images: [cached] };
              }
            }
            return item;
          })
        );
        if (isMounted) {
          const hasChanges = updated.some(
            (item, idx) => item.images[0] !== userCreatedListings[idx]?.images[0]
          );
          if (hasChanges) {
            setUserCreatedListings(updated);
          }
        }
      } catch (err) {
        console.warn('Error rehydrating local photos from IndexedDB:', err);
      }
    };
    rehydratePhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync borrow requests
  useEffect(() => {
    localStorage.setItem('wearhub_borrow_requests', JSON.stringify(borrowRequests));
  }, [borrowRequests]);

  // Fetch Firestore listings if Firebase is ready
  useEffect(() => {
    if (isFirebaseConfigured() && db) {
      const fetchListings = async () => {
        setLoading(true);
        try {
          if (!db) return;
          const querySnapshot = await getDocs(collection(db, 'listings'));
          const fetched: Listing[] = [];
          querySnapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() } as Listing);
          });
          setFirestoreListings(fetched);
        } catch (err) {
          console.error('Error fetching Firestore listings:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchListings();
    }
  }, []);

  // Combined listings:
  // User created local prototype listings take precedence on this device so the user's
  // uploaded photo is displayed. Firestore listings that aren't already in userCreatedListings are appended.
  // Deleted listings are excluded.
  const listings: Listing[] = [
    ...userCreatedListings,
    ...firestoreListings.filter((fl) => !userCreatedListings.some((ul) => ul.id === fl.id)),
    ...SAMPLE_LISTINGS,
  ].filter((item) => !deletedListingIds.includes(item.id));

  const getListingById = (id: string): Listing | undefined => {
    return listings.find((item) => item.id === id);
  };

  const createListing = async (
    newListingData: Omit<Listing, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerEmail' | 'ownerUniversity'>
  ): Promise<string> => {
    if (!currentUser) throw new Error('You must be signed in to create a listing');

    const generatedId = 'listing-' + Date.now();
    const isLocalPhoto =
      !newListingData.images[0] ||
      newListingData.images[0].startsWith('data:') ||
      newListingData.images[0].startsWith('blob:');

    const isLocalPrototype = newListingData.isLocalPrototype ?? isLocalPhoto;

    const completeListing: Listing = {
      ...newListingData,
      id: generatedId,
      ownerId: currentUser.uid,
      ownerName: currentUser.displayName,
      ownerEmail: currentUser.email,
      ownerUniversity: currentUser.homeUniversity,
      ownerAvatar: currentUser.photoURL,
      status: 'available',
      createdAt: new Date().toISOString(),
      isSample: false,
      isLocalPrototype,
      views: 1,
    };

    if (isFirebaseConfigured() && db) {
      try {
        // Safe Firestore copy: NEVER write temporary blob URLs to Firestore
        let firestoreImages = [...completeListing.images];
        if (isLocalPhoto) {
          // Use a clean hosted category fallback image in Firestore so other users don't see broken images
          firestoreImages = [getCategoryFallbackImage(completeListing.category)];
        }

        const firestorePayload: Listing = {
          ...completeListing,
          images: firestoreImages,
          isLocalPrototype,
        };

        const docRef = await addDoc(collection(db, 'listings'), firestorePayload);
        completeListing.id = docRef.id;

        // Persist local photo to IndexedDB with confirmed doc ID
        if (isLocalPhoto && completeListing.images[0]) {
          await savePhotoToIndexedDB(docRef.id, completeListing.images[0]);
        }

        const firestoreRecord: Listing = {
          ...firestorePayload,
          id: docRef.id,
        };

        setFirestoreListings((prev) => [firestoreRecord, ...prev]);
        setUserCreatedListings((prev) => [completeListing, ...prev]);
        return docRef.id;
      } catch (err) {
        console.error('Failed to save listing to Firestore:', err);
      }
    }

    // Persist local photo to IndexedDB
    if (isLocalPhoto && completeListing.images[0]) {
      await savePhotoToIndexedDB(generatedId, completeListing.images[0]);
    }

    // Always update local reactive state
    setUserCreatedListings((prev) => [completeListing, ...prev]);
    return generatedId;
  };

  const deleteListing = async (id: string): Promise<DeleteListingResult> => {
    if (!currentUser) {
      throw new Error('You must be signed in to delete a listing.');
    }

    const targetListing = listings.find((item) => item.id === id);
    if (!targetListing) {
      throw new Error('Listing not found or has already been removed.');
    }

    // Strict ownership verification: authenticated UID must match ownerId
    if (targetListing.ownerId !== currentUser.uid) {
      throw new Error('Unauthorized: You can only delete listings created by your own account.');
    }

    let isPermanent = false;

    // Distinguish between Cloud Firestore listings and Local-Only Prototype listings
    const isSampleListing =
      Boolean(targetListing.isSample) ||
      targetListing.id.startsWith('sample-') ||
      targetListing.id.startsWith('listing-sample-');
    const isLocalGeneratedId = targetListing.id.startsWith('listing-');
    const isInFirestoreCollection = firestoreListings.some((fl) => fl.id === id);

    // It is a Cloud Firestore listing ONLY if it was loaded from Firestore or does NOT have a client-generated local-only ID
    const isCloudListing =
      isFirebaseConfigured() &&
      Boolean(db) &&
      !isSampleListing &&
      (isInFirestoreCollection || !isLocalGeneratedId);

    // If it is a Cloud Firestore listing, verify auth and delete from Firestore
    if (isCloudListing && db) {
      const currentAuthUser = auth?.currentUser;

      // Ensure user has an active Firebase Auth session matching the listing owner
      if (!currentAuthUser) {
        throw new Error(
          'Authentication required: You must be signed in with your Firebase account to delete cloud listings from the database.'
        );
      }

      if (currentAuthUser.uid !== targetListing.ownerId) {
        throw new Error(
          'Permission denied: Your authenticated Firebase account does not match the owner ID of this listing.'
        );
      }

      try {
        await deleteDoc(doc(db, 'listings', id));
        setFirestoreListings((prev) => prev.filter((item) => item.id !== id));
        isPermanent = true;
      } catch (err: any) {
        console.error('Error deleting listing from Firestore:', err);
        const errCode = err?.code || '';
        const errMsg = err?.message || '';
        const isPermissionDenied =
          errCode === 'permission-denied' ||
          errMsg.toLowerCase().includes('permission') ||
          errMsg.toLowerCase().includes('missing or insufficient permissions');

        if (isPermissionDenied) {
          throw new Error(
            'Permission denied by Cloud Firestore: Your published database rules in Firebase Console do not permit deleting this listing. Please ensure your published security rules in Firebase Console allow the listing owner to delete (e.g. match /listings/{listingId} { allow delete: if request.auth != null && resource.data.ownerId == request.auth.uid; }).'
          );
        }

        if (errCode === 'not-found' || errMsg.toLowerCase().includes('not found')) {
          console.warn('Listing was not found in Firestore; continuing local cleanup.');
        } else {
          throw new Error(err.message || 'Failed to delete listing from Firestore.');
        }
      }
    }

    // Clean up local IndexedDB photo ONLY if image is not shared by another listing
    const targetPhoto = targetListing.images && targetListing.images[0];
    const isImageShared = Boolean(
      targetPhoto &&
      userCreatedListings.some(
        (other) => other.id !== id && other.images && other.images.includes(targetPhoto)
      )
    );

    if (!isImageShared) {
      await deletePhotoFromIndexedDB(id);
    }

    // Remove from local userCreatedListings and mark ID as deleted
    setUserCreatedListings((prev) => prev.filter((item) => item.id !== id));
    setFirestoreListings((prev) => prev.filter((item) => item.id !== id));
    setDeletedListingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

    return {
      success: true,
      isPermanent,
      message: isPermanent
        ? `"${targetListing.title}" was permanently deleted from the database.`
        : `"${targetListing.title}" (Local Prototype) was removed successfully.`,
    };
  };

  const createBorrowRequest = async (
    listing: Listing,
    startDate: string,
    endDate: string,
    occasion: string,
    message: string
  ): Promise<BorrowRequest> => {
    if (!currentUser) throw new Error('Must be signed in to send borrow request');

    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyRate = listing.borrowRate || 100;
    const calculatedCost = dailyRate * days;

    const request: BorrowRequest = {
      id: 'borrow-' + Date.now(),
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0] || '',
      ownerId: listing.ownerId,
      requesterId: currentUser.uid,
      requesterName: currentUser.displayName,
      requesterUniversity: currentUser.homeUniversity,
      startDate,
      endDate,
      occasion,
      message,
      calculatedCost,
      securityDeposit: listing.securityDeposit || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, 'borrowRequests'), request);
      } catch (err) {
        console.error('Error saving borrow request to Firestore:', err);
      }
    }

    setBorrowRequests((prev) => [request, ...prev]);
    return request;
  };

  const updateBorrowRequestStatus = (requestId: string, status: BorrowRequest['status']) => {
    setBorrowRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status } : req))
    );
  };

  const filterListings = (options: Partial<FilterOptions>, customList?: Listing[]): Listing[] => {
    const listToFilter = customList || listings;

    return listToFilter.filter((item) => {
      // Search query
      if (options.searchQuery && options.searchQuery.trim()) {
        const q = options.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q) || (item.customCategory ? item.customCategory.toLowerCase().includes(q) : false);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }

      // University filter
      if (options.university && options.university !== 'ALL') {
        if (item.university.toLowerCase() !== options.university.toLowerCase()) {
          return false;
        }
      }

      // Category filter
      if (options.category && options.category !== 'All') {
        if (item.category !== options.category && item.customCategory !== options.category) return false;
      }

      // Size filter
      if (options.size && options.size !== 'All') {
        if (item.size && item.size !== 'N/A' && item.size !== 'Free Size' && item.size !== 'Standard') {
          if (item.size !== options.size) return false;
        }
      }

      // Condition filter
      if (options.condition && options.condition !== 'All') {
        if (item.condition !== options.condition) return false;
      }

      // Transaction Type filter (Buy, Borrow, Exchange, Donate)
      if (options.transactionType && options.transactionType !== 'All') {
        if (!item.transactionTypes.includes(options.transactionType as any)) {
          return false;
        }
      }

      // Price filter
      if (options.minPrice !== undefined && item.price !== undefined) {
        if (item.price < options.minPrice) return false;
      }
      if (options.maxPrice !== undefined && item.price !== undefined) {
        if (item.price > options.maxPrice) return false;
      }

      return true;
    }).sort((a, b) => {
      if (options.sortBy === 'price-asc') {
        return (a.price || a.borrowRate || 0) - (b.price || b.borrowRate || 0);
      }
      if (options.sortBy === 'price-desc') {
        return (b.price || b.borrowRate || 0) - (a.price || a.borrowRate || 0);
      }
      if (options.sortBy === 'popular') {
        return (b.views || 0) - (a.views || 0);
      }
      // Default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  return (
    <ListingContext.Provider
      value={{
        listings,
        loading,
        createListing,
        deleteListing,
        getListingById,
        createBorrowRequest,
        borrowRequests,
        updateBorrowRequestStatus,
        filterListings,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
};
