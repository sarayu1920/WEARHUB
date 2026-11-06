import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import { useRequests } from '../context/RequestContext';
import { useUniversity } from '../context/UniversityContext';
import { ProductCard } from '../components/ProductCard';
import { RequestCard } from '../components/RequestCard';
import { ViewResponsesModal } from '../components/ViewResponsesModal';
import { OfferItemModal } from '../components/OfferItemModal';
import { DeleteListingModal } from '../components/DeleteListingModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Listing, ItemRequest } from '../types';
import {
  User,
  ShoppingBag,
  Clock,
  HelpCircle,
  Heart,
  Settings,
  LogOut,
  School,
  Mail,
  Phone,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Edit3,
  Check,
  ShieldCheck,
  PlusCircle,
  Laptop,
  Cloud,
  ExternalLink,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const {
    currentUser,
    logout,
    updateProfileData,
    updateHomeUniversity,
    loginAsDemoUser,
    isFirebaseReady,
  } = useAuth();
  const {
    listings,
    deleteListing,
    borrowRequests,
    updateBorrowRequestStatus,
  } = useListings();
  const { requests, deleteRequest } = useRequests();
  const { universities } = useUniversity();

  const [activeTab, setActiveTab] = useState<
    'listings' | 'requests' | 'borrowing' | 'lending' | 'saved' | 'settings'
  >(() => {
    if (location.pathname === '/my-listings') return 'listings';
    if (tabParam && ['listings', 'requests', 'borrowing', 'lending', 'saved', 'settings'].includes(tabParam)) {
      return tabParam as any;
    }
    return 'listings';
  });

  useEffect(() => {
    if (location.pathname === '/my-listings') {
      setActiveTab('listings');
      return;
    }
    const tab = searchParams.get('tab');
    if (tab && ['listings', 'requests', 'borrowing', 'lending', 'saved', 'settings'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams, location.pathname]);

  const handleTabChange = (newTab: 'listings' | 'requests' | 'borrowing' | 'lending' | 'saved' | 'settings') => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.displayName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editUni, setEditUni] = useState(currentUser?.homeUniversity || 'VIT-AP University');
  const [editStudentId, setEditStudentId] = useState(currentUser?.studentId || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Response viewing modal
  const [selectedRequestForResponses, setSelectedRequestForResponses] = useState<ItemRequest | null>(null);

  // Deletion modals state
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [isDeletingListing, setIsDeletingListing] = useState<boolean>(false);
  const [deleteListingError, setDeleteListingError] = useState<string | null>(null);

  const [requestToDelete, setRequestToDelete] = useState<ItemRequest | null>(null);
  const [isDeletingRequest, setIsDeletingRequest] = useState<boolean>(false);
  const [deleteRequestError, setDeleteRequestError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Sign in to Access Dashboard</h2>
        <p className="text-xs text-neutral-500">
          View your wardrobe listings, borrowing requests, and campus activity.
        </p>
        <Link
          to="/auth"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Filter user's specific data by authenticated UID strictly
  const myListings = listings.filter((l) => l.ownerId === currentUser.uid);
  const myRequests = requests.filter((r) => r.requesterId === currentUser.uid);
  const mySentBorrowRequests = borrowRequests.filter((b) => b.requesterId === currentUser.uid);
  const myReceivedBorrowRequests = borrowRequests.filter((b) => b.ownerId === currentUser.uid);
  const itemsIAmLending = listings.filter(
    (l) => l.ownerId === currentUser.uid && l.transactionTypes.includes('Borrow')
  );
  const savedItems = listings.filter((l) => currentUser.savedListingIds?.includes(l.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileData({
      displayName: editName.trim(),
      bio: editBio.trim(),
      phone: editPhone.trim(),
      studentId: editStudentId.trim(),
    });
    if (editUni !== currentUser.homeUniversity) {
      await updateHomeUniversity(editUni);
    }
    setIsEditing(false);
    setStatusMessage('Profile updated successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleConfirmDeleteListing = async () => {
    if (!listingToDelete) return;
    setIsDeletingListing(true);
    setDeleteListingError(null);
    try {
      const result = await deleteListing(listingToDelete.id);
      setListingToDelete(null);
      setStatusMessage(result.message);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setDeleteListingError(err.message || 'Failed to delete listing.');
    } finally {
      setIsDeletingListing(false);
    }
  };

  const handleConfirmDeleteRequest = async () => {
    if (!requestToDelete) return;
    setIsDeletingRequest(true);
    setDeleteRequestError(null);
    try {
      const result = await deleteRequest(requestToDelete.id);
      setRequestToDelete(null);
      setStatusMessage(result.message);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setDeleteRequestError(err.message || 'Failed to delete request.');
    } finally {
      setIsDeletingRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-600/30 shadow-md"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#12372A] text-white flex items-center justify-center text-2xl font-extrabold shadow-md">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                  {currentUser.displayName}
                </h1>
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Campus Student
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-500">
                <span className="flex items-center text-[#2D6A4F] font-semibold">
                  <School className="w-3.5 h-3.5 mr-1" />
                  {currentUser.homeUniversity}
                </span>
                <span className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                  {currentUser.email}
                </span>
                {currentUser.studentId && (
                  <span className="font-mono text-neutral-600">
                    Roll: {currentUser.studentId}
                  </span>
                )}
              </div>

              {currentUser.bio && (
                <p className="text-xs text-neutral-600 pt-1 max-w-xl italic">
                  "{currentUser.bio}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setEditName(currentUser.displayName);
                setEditBio(currentUser.bio || '');
                setEditPhone(currentUser.phone || '');
                setEditUni(currentUser.homeUniversity);
                setEditStudentId(currentUser.studentId || '');
                setIsEditing(!isEditing);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-colors"
            >
              <Edit3 className="w-4 h-4 text-neutral-500" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Demo Switcher Quick Pill (Strictly disabled in live Firebase mode) */}
        {!isFirebaseReady && (
          <div className="mt-6 pt-4 border-t border-neutral-150 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Preview Mode Test Accounts:</span>
              <button
                onClick={() => loginAsDemoUser(0)}
                className="text-[11px] underline text-[#12372A] font-semibold hover:text-[#2D6A4F]"
              >
                Switch to Arjun (VIT-AP)
              </button>
              <span>&bull;</span>
              <button
                onClick={() => loginAsDemoUser(1)}
                className="text-[11px] underline text-[#12372A] font-semibold hover:text-[#2D6A4F]"
              >
                Switch to Priya (SRM AP)
              </button>
            </div>
            {statusMessage && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                {statusMessage}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Form (Expanded if editing) */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-sm space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-150">
            <h3 className="font-bold text-sm text-neutral-900">Edit Profile & Campus Details</h3>
            <span className="text-xs text-neutral-400">Save changes below</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Home University</label>
              <select
                value={editUni}
                onChange={(e) => setEditUni(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-1 focus:ring-[#2D6A4F]"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Contact Phone / WhatsApp</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">College Roll / Reg No.</label>
              <input
                type="text"
                value={editStudentId}
                onChange={(e) => setEditStudentId(e.target.value)}
                placeholder="e.g. 22BCE1045"
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Short Bio</label>
            <textarea
              rows={2}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="e.g. Final year CSE | Member of college dance crew | Happy to lend suits & festive wear"
              className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-1 focus:ring-[#2D6A4F]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#12372A] text-white hover:bg-[#1E4D2B]"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-neutral-200 pb-2">
        {[
          { id: 'listings', label: 'My Listings', count: myListings.length },
          { id: 'requests', label: 'My Requests', count: myRequests.length },
          { id: 'borrowing', label: 'Borrowing Requests', count: mySentBorrowRequests.length + myReceivedBorrowRequests.length },
          { id: 'lending', label: 'Items I Am Lending', count: itemsIAmLending.length },
          { id: 'saved', label: 'Saved Items', count: savedItems.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#12372A] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-[#2D6A4F] text-emerald-200' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {/* My Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Your Wardrobe Listings</h2>
                <p className="text-xs text-neutral-500">
                  Manage your campus items available for sale, borrow, exchange, or donation.
                </p>
              </div>
              <Link
                to="/create-listing"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#1E4D2B] transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Add Item</span>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
                <ShoppingBag className="w-10 h-10 mx-auto text-neutral-300" />
                <h3 className="text-sm font-bold text-neutral-800">You haven't listed any items yet</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Earn student pocket money by lending blazers, kurtas, or dresses, or sell clothes and gear you no longer need.
                </p>
                <Link
                  to="/create-listing"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#1E4D2B] transition-colors"
                >
                  List an Item Now
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Item Image with Badges */}
                    <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Storage Source Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        {item.isLocalPrototype ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-700/90 text-white backdrop-blur-md shadow-xs">
                            <Laptop className="w-2.5 h-2.5 mr-1" />
                            Local Prototype
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-800/80 text-white backdrop-blur-md shadow-xs">
                            <Cloud className="w-2.5 h-2.5 mr-1 text-emerald-300" />
                            Firebase Cloud
                          </span>
                        )}
                      </div>

                      {/* Transaction Badges (Offer Types) */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%] z-10">
                        {item.transactionTypes.map((type) => (
                          <span
                            key={type}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs ${
                              type === 'Borrow'
                                ? 'bg-[#12372A]'
                                : type === 'Buy'
                                ? 'bg-[#2D6A4F]'
                                : type === 'Exchange'
                                ? 'bg-amber-600'
                                : 'bg-emerald-600'
                            }`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      {/* Condition & Size Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] pointer-events-none">
                        <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur-xs font-bold text-neutral-800 shadow-2xs">
                          {item.size && item.size !== 'N/A' ? `Size: ${item.size}` : item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-neutral-900/75 backdrop-blur-xs text-white font-medium">
                          {item.condition}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-xs text-[#2D6A4F] font-semibold truncate">
                          <School className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{item.university}</span>
                          {item.campusSpot && (
                            <span className="text-neutral-400 text-[11px] ml-1 truncate">({item.campusSpot})</span>
                          )}
                        </div>

                        <Link to={`/item/${item.id}`} className="block">
                          <h3 className="text-sm font-bold text-neutral-900 hover:text-[#2D6A4F] transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
                          {item.transactionTypes.includes('Buy') && item.price !== undefined && (
                            <span className="text-sm font-extrabold text-[#12372A]">
                              ₹{item.price}
                            </span>
                          )}
                          {item.transactionTypes.includes('Borrow') && (
                            <span className="text-xs font-bold text-[#2D6A4F]">
                              ₹{item.borrowRate || 100}/day
                            </span>
                          )}
                          {item.transactionTypes.includes('Donate') && (
                            <span className="text-xs font-bold text-emerald-600">
                              Free Donation
                            </span>
                          )}
                          {item.transactionTypes.includes('Exchange') && (
                            <span className="text-xs font-semibold text-amber-700">
                              Available to Swap
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Management Action Buttons */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/item/${item.id}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setListingToDelete(item);
                            setDeleteListingError(null);
                          }}
                          className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                          aria-label={`Delete listing ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Your Active Requests</h2>
              <Link
                to="/post-request"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#1E4D2B]"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Post a Request</span>
              </Link>
            </div>

            {myRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
                <HelpCircle className="w-10 h-10 mx-auto text-neutral-300" />
                <h3 className="text-sm font-bold text-neutral-800">No active item requests</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Need an outfit, book, calculator, jewellery, or event gear? Post a request to notify campus students.
                </p>
                <Link
                  to="/post-request"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
                >
                  Post a Request
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onOffer={() => {}}
                    onViewResponses={(r) => setSelectedRequestForResponses(r)}
                    onDelete={() => {
                      setRequestToDelete(req);
                      setDeleteRequestError(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Borrowing Requests */}
        {activeTab === 'borrowing' && (
          <div className="space-y-6">
            {/* Incoming Requests on My Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider text-emerald-900">
                Borrow Requests Received for My Clothes ({myReceivedBorrowRequests.length})
              </h3>
              {myReceivedBorrowRequests.length === 0 ? (
                <p className="text-xs text-neutral-400 bg-white p-4 rounded-2xl border border-neutral-200">
                  No incoming borrow requests on your items at this time.
                </p>
              ) : (
                <div className="space-y-3">
                  {myReceivedBorrowRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-white border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={req.listingImage}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">{req.listingTitle}</h4>
                          <p className="text-[11px] text-neutral-500">
                            Requested by: <strong>{req.requesterName}</strong> ({req.requesterUniversity})
                          </p>
                          <p className="text-[11px] text-emerald-800 font-semibold">
                            Dates: {req.startDate} to {req.endDate} &bull; Total: ₹{req.calculatedCost} (+₹{req.securityDeposit} deposit)
                          </p>
                          <p className="text-[11px] text-neutral-600 italic mt-0.5">"{req.message}"</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateBorrowRequestStatus(req.id, 'accepted')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => updateBorrowRequestStatus(req.id, 'declined')}
                              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold flex items-center space-x-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              req.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            Status: {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests Sent by Me */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider text-emerald-900">
                Borrow Requests Sent by You ({mySentBorrowRequests.length})
              </h3>
              {mySentBorrowRequests.length === 0 ? (
                <p className="text-xs text-neutral-400 bg-white p-4 rounded-2xl border border-neutral-200">
                  You haven't requested to borrow any items yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {mySentBorrowRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-white border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={req.listingImage}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">{req.listingTitle}</h4>
                          <p className="text-[11px] text-neutral-500">
                            Requested for {req.startDate} to {req.endDate} &bull; Occasion: {req.occasion}
                          </p>
                          <p className="text-[11px] text-emerald-800 font-semibold">
                            Est. Fee: ₹{req.calculatedCost} &bull; Refundable deposit: ₹{req.securityDeposit}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'declined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status === 'pending' ? 'Pending Owner Approval' : req.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items I Am Lending */}
        {activeTab === 'lending' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">Items Available for Peer Borrowing</h2>
            {itemsIAmLending.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
                <Clock className="w-10 h-10 mx-auto text-neutral-300" />
                <h3 className="text-sm font-bold text-neutral-800">You haven't listed any items to lend</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Lend out your formal wear or ethnic suits when not in use.
                </p>
                <Link
                  to="/create-listing?mode=Borrow"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
                >
                  List an Item to Lend
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {itemsIAmLending.map((item) => (
                  <ProductCard key={item.id} listing={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Items */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">Your Bookmarked Wardrobe</h2>
            {savedItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
                <Heart className="w-10 h-10 mx-auto text-neutral-300" />
                <h3 className="text-sm font-bold text-neutral-800">No saved items yet</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click the heart icon on any product card in the marketplace to bookmark it for later.
                </p>
                <Link
                  to="/browse"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map((item) => (
                  <ProductCard key={item.id} listing={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responses Modal */}
      <ViewResponsesModal
        request={selectedRequestForResponses}
        isOpen={Boolean(selectedRequestForResponses)}
        onClose={() => setSelectedRequestForResponses(null)}
      />

      {/* Delete Listing Confirmation Modal */}
      <DeleteListingModal
        listing={listingToDelete}
        isOpen={Boolean(listingToDelete)}
        isLoading={isDeletingListing}
        error={deleteListingError}
        onConfirm={handleConfirmDeleteListing}
        onCancel={() => {
          if (!isDeletingListing) {
            setListingToDelete(null);
            setDeleteListingError(null);
          }
        }}
      />

      {/* Delete Request Confirmation Modal */}
      <DeleteConfirmModal
        request={requestToDelete}
        isOpen={Boolean(requestToDelete)}
        isLoading={isDeletingRequest}
        error={deleteRequestError}
        onConfirm={handleConfirmDeleteRequest}
        onCancel={() => {
          if (!isDeletingRequest) {
            setRequestToDelete(null);
            setDeleteRequestError(null);
          }
        }}
      />
    </div>
  );
};
