import React, { createContext, useContext, useState, useEffect } from 'react';
import { ItemRequest, RequestResponse } from '../types';
import { SAMPLE_REQUESTS } from '../data/sampleRequests';
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

interface RequestContextType {
  requests: ItemRequest[];
  loading: boolean;
  createRequest: (
    newRequest: Omit<ItemRequest, 'id' | 'createdAt' | 'requesterId' | 'requesterName' | 'requesterEmail' | 'requesterUniversity' | 'responsesCount'>
  ) => Promise<string>;
  deleteRequest: (id: string) => Promise<boolean>;
  respondToRequest: (
    requestId: string,
    message: string,
    offeredItemTitle?: string,
    offeredListingId?: string,
    contactNumber?: string
  ) => Promise<RequestResponse>;
  getRequestResponses: (requestId: string) => RequestResponse[];
  getRequestById: (id: string) => ItemRequest | undefined;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userCreatedRequests, setUserCreatedRequests] = useState<ItemRequest[]>(() => {
    const saved = localStorage.getItem('wearhub_custom_requests');
    return saved ? JSON.parse(saved) : [];
  });
  const [firestoreRequests, setFirestoreRequests] = useState<ItemRequest[]>([]);
  const [responses, setResponses] = useState<RequestResponse[]>(() => {
    const saved = localStorage.getItem('wearhub_request_responses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Realistic initial response to req-1
    return [
      {
        id: 'resp-1',
        requestId: 'req-1',
        responderId: 'demo-student-2',
        responderName: 'Priya Sundaram',
        responderUniversity: 'SRM University AP',
        responderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        message: 'Hey Meera! I have a set of traditional 50-bell brass ghungroos from my Bharatanatyam training. You are welcome to borrow them for Friday night!',
        offeredItemTitle: 'Brass Ankle Ghungroos (Padded)',
        contactNumber: '+91 98450 12345',
        createdAt: '2026-10-16T15:20:00Z',
      },
    ];
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('wearhub_custom_requests', JSON.stringify(userCreatedRequests));
  }, [userCreatedRequests]);

  useEffect(() => {
    localStorage.setItem('wearhub_request_responses', JSON.stringify(responses));
  }, [responses]);

  // Fetch from Firestore if configured
  useEffect(() => {
    if (isFirebaseConfigured() && db) {
      const fetchRequests = async () => {
        setLoading(true);
        try {
          if (!db) return;
          const querySnapshot = await getDocs(collection(db, 'requests'));
          const fetched: ItemRequest[] = [];
          querySnapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() } as ItemRequest);
          });
          setFirestoreRequests(fetched);
        } catch (err) {
          console.error('Error fetching Firestore requests:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();
    }
  }, []);

  const requests: ItemRequest[] = [
    ...firestoreRequests,
    ...userCreatedRequests,
    ...SAMPLE_REQUESTS,
  ];

  const getRequestById = (id: string): ItemRequest | undefined => {
    return requests.find((r) => r.id === id);
  };

  const createRequest = async (
    newRequestData: Omit<ItemRequest, 'id' | 'createdAt' | 'requesterId' | 'requesterName' | 'requesterEmail' | 'requesterUniversity' | 'responsesCount'>
  ): Promise<string> => {
    if (!currentUser) throw new Error('You must be signed in to post a request');

    const generatedId = 'req-' + Date.now();
    const completeRequest: ItemRequest = {
      ...newRequestData,
      id: generatedId,
      requesterId: currentUser.uid,
      requesterName: currentUser.displayName,
      requesterEmail: currentUser.email,
      requesterUniversity: currentUser.homeUniversity,
      requesterAvatar: currentUser.photoURL,
      status: 'open',
      responsesCount: 0,
      createdAt: new Date().toISOString(),
      isSample: false,
    };

    if (isFirebaseConfigured() && db) {
      try {
        const docRef = await addDoc(collection(db, 'requests'), completeRequest);
        completeRequest.id = docRef.id;
        setFirestoreRequests((prev) => [completeRequest, ...prev]);
        return docRef.id;
      } catch (err) {
        console.error('Failed to post request to Firestore:', err);
      }
    }

    setUserCreatedRequests((prev) => [completeRequest, ...prev]);
    return generatedId;
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    if (!currentUser) return false;

    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'requests', id));
        setFirestoreRequests((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error('Error deleting request from Firestore:', err);
      }
    }

    setUserCreatedRequests((prev) => prev.filter((r) => r.id !== id));
    return true;
  };

  const respondToRequest = async (
    requestId: string,
    message: string,
    offeredItemTitle?: string,
    offeredListingId?: string,
    contactNumber?: string
  ): Promise<RequestResponse> => {
    if (!currentUser) throw new Error('Must be signed in to respond to a request');

    const newResponse: RequestResponse = {
      id: 'resp-' + Date.now(),
      requestId,
      responderId: currentUser.uid,
      responderName: currentUser.displayName,
      responderUniversity: currentUser.homeUniversity,
      responderAvatar: currentUser.photoURL,
      message,
      offeredItemTitle,
      offeredListingId,
      contactNumber,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, 'requests', requestId, 'responses'), newResponse);
      } catch (err) {
        console.error('Failed to post response in Firestore:', err);
      }
    }

    setResponses((prev) => [newResponse, ...prev]);

    // Update response count on target request
    setUserCreatedRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, responsesCount: (r.responsesCount || 0) + 1 } : r))
    );
    setFirestoreRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, responsesCount: (r.responsesCount || 0) + 1 } : r))
    );

    return newResponse;
  };

  const getRequestResponses = (requestId: string): RequestResponse[] => {
    return responses.filter((r) => r.requestId === requestId);
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        loading,
        createRequest,
        deleteRequest,
        respondToRequest,
        getRequestResponses,
        getRequestById,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
