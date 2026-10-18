export type TransactionType = 'Buy' | 'Borrow' | 'Exchange' | 'Donate';

export type ItemCategory =
  | 'Clothing & Outfits'
  | 'Jewellery & Bracelets'
  | 'Bags & Accessories'
  | 'Shoes & Footwear'
  | 'Books & Stationery'
  | 'Event & Performance Items'
  | 'Other';

// Backward compatibility alias for existing modules
export type ClothingCategory = ItemCategory | string;

export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size' | 'Standard' | 'N/A';

export type ItemCondition = 'Brand New with Tags' | 'Like New' | 'Gently Used' | 'Well Loved';

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  popular?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  homeUniversity: string;
  phone?: string;
  bio?: string;
  studentId?: string;
  savedListingIds: string[];
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ItemCategory | string;
  customCategory?: string;
  subcategory?: string;
  size?: ClothingSize | string;
  condition: ItemCondition;
  transactionTypes: TransactionType[];
  price?: number; // Selling price in INR
  borrowRate?: number; // e.g., ₹50/day or ₹150/event
  borrowDurationLimit?: string; // e.g. "Up to 3 days"
  securityDeposit?: number; // refundable deposit
  images: string[];
  university: string;
  campusSpot?: string; // e.g. "Library Quad / Mens Hostel Block B"
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerUniversity: string;
  ownerAvatar?: string;
  status: 'available' | 'reserved' | 'completed';
  createdAt: string;
  isSample?: boolean;
  views?: number;
}

export type RequestPurpose =
  | 'College Dance / Cultural'
  | 'College Fest / Party'
  | 'Formal Presentation / Interview'
  | 'Everyday Campus Use'
  | 'Hackathon / Tech Event'
  | 'Academic & Exam Prep'
  | 'Sports / Athleisure'
  | 'Other Special Occasion';

export interface ItemRequest {
  id: string;
  title: string;
  category: ItemCategory | string;
  customCategory?: string;
  size?: ClothingSize | string;
  purpose: RequestPurpose | string;
  dateNeeded: string;
  preferredType: 'Buy' | 'Borrow' | 'Exchange' | 'Any Suitable Option';
  preferredUniversity: string;
  description: string;
  budgetOrTerms?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterUniversity: string;
  requesterAvatar?: string;
  status: 'open' | 'fulfilled';
  createdAt: string;
  responsesCount: number;
  isSample?: boolean;
}

export interface RequestResponse {
  id: string;
  requestId: string;
  responderId: string;
  responderName: string;
  responderUniversity: string;
  responderAvatar?: string;
  message: string;
  offeredItemTitle?: string;
  offeredListingId?: string;
  offeredPriceOrTerms?: string;
  contactNumber?: string;
  createdAt: string;
}

export interface BorrowRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  ownerId: string;
  requesterId: string;
  requesterName: string;
  requesterUniversity: string;
  startDate: string;
  endDate: string;
  occasion: string;
  message: string;
  calculatedCost: number;
  securityDeposit: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  listingId?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    [uid: string]: {
      name: string;
      university: string;
      avatar?: string;
    };
  };
  lastMessage: string;
  lastTimestamp: string;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
}

export interface FilterOptions {
  searchQuery: string;
  university: string;
  category: string;
  size: string;
  condition: string;
  transactionType: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}
