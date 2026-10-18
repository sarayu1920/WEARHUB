import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Message, Listing } from '../types';
import { useAuth } from './AuthContext';
import {
  db,
  isFirebaseConfigured,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from '../services/firebase';

interface MessageContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeMessages: Message[];
  setActiveConversationId: (conversationId: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  startConversationWithSeller: (listing: Listing, initialMessage: string) => Promise<string>;
  unreadCount: number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('wearhub_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Realistic initial sample conversation for demo
    return [
      {
        id: 'conv-sample-1',
        participantIds: ['demo-student-1', 'sample-user-2'],
        participants: {
          'demo-student-1': {
            name: 'Arjun Verma',
            university: 'VIT-AP University',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
          'sample-user-2': {
            name: 'Priya Sundaram',
            university: 'SRM University AP',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
          },
        },
        lastMessage: 'Sure, I can meet by the student activity center after 4 PM!',
        lastTimestamp: '2026-10-17T16:45:00Z',
        listingId: 'sample-2',
        listingTitle: 'Emerald Green Silk Kurta & Dhoti Set with Golden Zari',
        listingImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
      },
    ];
  });

  const [allMessages, setAllMessages] = useState<{ [convId: string]: Message[] }>(() => {
    const saved = localStorage.getItem('wearhub_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {
      'conv-sample-1': [
        {
          id: 'msg-1',
          conversationId: 'conv-sample-1',
          senderId: 'demo-student-1',
          senderName: 'Arjun Verma',
          text: 'Hi Priya! Is the Emerald Green Silk Kurta still available to borrow for the cultural festival this Thursday?',
          timestamp: '2026-10-17T15:20:00Z',
          listingId: 'sample-2',
        },
        {
          id: 'msg-2',
          conversationId: 'conv-sample-1',
          senderId: 'sample-user-2',
          senderName: 'Priya Sundaram',
          text: 'Hi Arjun! Yes, it is in pristine condition. What dates do you need it for?',
          timestamp: '2026-10-17T15:45:00Z',
        },
        {
          id: 'msg-3',
          conversationId: 'conv-sample-1',
          senderId: 'demo-student-1',
          senderName: 'Arjun Verma',
          text: 'From Thursday afternoon until Saturday morning. Where on campus would be convenient to meet?',
          timestamp: '2026-10-17T16:10:00Z',
        },
        {
          id: 'msg-4',
          conversationId: 'conv-sample-1',
          senderId: 'sample-user-2',
          senderName: 'Priya Sundaram',
          text: 'Sure, I can meet by the student activity center after 4 PM!',
          timestamp: '2026-10-17T16:45:00Z',
        },
      ],
    };
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return conversations.length > 0 ? conversations[0].id : null;
  });

  // Sync to storage
  useEffect(() => {
    localStorage.setItem('wearhub_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('wearhub_messages', JSON.stringify(allMessages));
  }, [allMessages]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const activeMessages = (activeConversationId && allMessages[activeConversationId]) || [];

  const sendMessage = async (text: string) => {
    if (!currentUser || !activeConversationId || !text.trim()) return;

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId: activeConversationId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setAllMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: text.trim(),
              lastTimestamp: new Date().toISOString(),
            }
          : c
      )
    );

    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, 'conversations', activeConversationId, 'messages'), newMsg);
      } catch (err) {
        console.error('Error saving message to Firestore:', err);
      }
    }
  };

  const startConversationWithSeller = async (
    listing: Listing,
    initialMessage: string
  ): Promise<string> => {
    if (!currentUser) throw new Error('You must be signed in to message a seller');

    // Check if conversation already exists for this user and listing
    const existing = conversations.find(
      (c) =>
        c.listingId === listing.id &&
        c.participantIds.includes(currentUser.uid) &&
        c.participantIds.includes(listing.ownerId)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      if (initialMessage.trim()) {
        await sendMessage(initialMessage);
      }
      return existing.id;
    }

    const newConvId = 'conv-' + Date.now();
    const newConv: Conversation = {
      id: newConvId,
      participantIds: [currentUser.uid, listing.ownerId],
      participants: {
        [currentUser.uid]: {
          name: currentUser.displayName,
          university: currentUser.homeUniversity,
          avatar: currentUser.photoURL,
        },
        [listing.ownerId]: {
          name: listing.ownerName,
          university: listing.ownerUniversity,
          avatar: listing.ownerAvatar,
        },
      },
      lastMessage: initialMessage,
      lastTimestamp: new Date().toISOString(),
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0] || '',
    };

    const firstMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId: newConvId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text: initialMessage,
      timestamp: new Date().toISOString(),
      listingId: listing.id,
    };

    setConversations((prev) => [newConv, ...prev]);
    setAllMessages((prev) => ({
      ...prev,
      [newConvId]: [firstMsg],
    }));
    setActiveConversationId(newConvId);

    if (isFirebaseConfigured() && db) {
      try {
        await addDoc(collection(db, 'conversations'), newConv);
      } catch (err) {
        console.error('Failed to create Firestore conversation:', err);
      }
    }

    return newConvId;
  };

  const unreadCount = conversations.length > 0 ? 1 : 0;

  return (
    <MessageContext.Provider
      value={{
        conversations,
        activeConversation,
        activeMessages,
        setActiveConversationId,
        sendMessage,
        startConversationWithSeller,
        unreadCount,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
