import React, { createContext, useContext, useState, useEffect } from 'react';
import { Listing, BorrowRequest, FilterOptions } from '../types';
import { SAMPLE_LISTINGS } from '../data/sampleListings';
import { useAuth } from './AuthContext';
import {
  db,
  isFirebaseConfigured,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from '../services/firebase';

interface ListingContextType {
  listings: Listing[];
  loading: boolean;
  createListing: (newListing: Omit<Listing, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerEmail' | 'ownerUniversity'>) => Promise<string>;
  deleteListing: (id: string) => Promise<boolean>;
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

  // Combined listings: Firestore (if any) + Custom local/test listings + Sample listings
  const listings: Listing[] = [
    ...firestoreListings,
    ...userCreatedListings,
    ...SAMPLE_LISTINGS,
  ];

  const getListingById = (id: string): Listing | undefined => {
    return listings.find((item) => item.id === id);
  };

  const createListing = async (
    newListingData: Omit<Listing, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerEmail' | 'ownerUniversity'>
  ): Promise<string> => {
    if (!currentUser) throw new Error('You must be signed in to create a listing');

    const generatedId = 'listing-' + Date.now();
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
      views: 1,
    };

    if (isFirebaseConfigured() && db) {
      try {
        const docRef = await addDoc(collection(db, 'listings'), completeListing);
        completeListing.id = docRef.id;
        setFirestoreListings((prev) => [completeListing, ...prev]);
        return docRef.id;
      } catch (err) {
        console.error('Failed to save listing to Firestore:', err);
      }
    }

    // Always update local reactive state
    setUserCreatedListings((prev) => [completeListing, ...prev]);
    return generatedId;
  };

  const deleteListing = async (id: string): Promise<boolean> => {
    if (!currentUser) return false;

    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'listings', id));
        setFirestoreListings((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Error deleting Firestore listing:', err);
      }
    }

    setUserCreatedListings((prev) => prev.filter((item) => item.id !== id));
    return true;
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
