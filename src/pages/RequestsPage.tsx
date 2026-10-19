import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { useUniversity } from '../context/UniversityContext';
import { useAuth } from '../context/AuthContext';
import { RequestCard } from '../components/RequestCard';
import { OfferItemModal } from '../components/OfferItemModal';
import { ViewResponsesModal } from '../components/ViewResponsesModal';
import { UniversityModal } from '../components/UniversityModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ItemRequest } from '../types';
import {
  HelpCircle,
  PlusCircle,
  Search,
  School,
  ChevronDown,
  Users,
  User,
  CheckCircle2,
  X,
  Sparkles,
  LogIn,
  RotateCcw,
} from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { requests, deleteRequest } = useRequests();
  const { activeBrowseFilter } = useUniversity();
  const { currentUser, isFirebaseReady, loginAsDemoUser } = useAuth();

  // Tab mode: 'all' = public feed, 'my-requests' = authenticated user's requests only
  const [activeTab, setActiveTab] = useState<'all' | 'my-requests'>('all');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOfferRequest, setSelectedOfferRequest] = useState<ItemRequest | null>(null);
  const [selectedViewResponseRequest, setSelectedViewResponseRequest] = useState<ItemRequest | null>(null);
  const [isUniModalOpen, setIsUniModalOpen] = useState(false);

  // Deletion modal & feedback state
  const [requestToDelete, setRequestToDelete] = useState<ItemRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Overall counts for tabs
  const allRequestsTotalCount = requests.length;
  const myRequestsTotalCount = requests.filter(
    (r) => currentUser && r.requesterId === currentUser.uid
  ).length;

  // Filter requests based on active tab, campus, category, and search
  const filteredRequests = requests.filter((r) => {
    // Tab Ownership Filter: strictly enforce authenticated UID
    if (activeTab === 'my-requests') {
      if (!currentUser || r.requesterId !== currentUser.uid) {
        return false;
      }
    }

    // University filter (applies to public feed; in My Requests, user can also view all their requests or campus matches)
    if (activeTab === 'all' && activeBrowseFilter !== 'ALL') {
      if (r.preferredUniversity.toLowerCase() !== activeBrowseFilter.toLowerCase()) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All') {
      if (r.category !== selectedCategory && r.customCategory !== selectedCategory) {
        return false;
      }
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchRequester = r.requesterName.toLowerCase().includes(q);
      const matchCustom = r.customCategory ? r.customCategory.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchDesc && !matchRequester && !matchCustom) return false;
    }

    return true;
  });

  // Handle request deletion confirmation
  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteRequest(requestToDelete.id);
      setRequestToDelete(null);
      setStatusNotification({
        message: result.message,
        type: 'success',
      });
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setStatusNotification(null);
      }, 4000);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Campus Community Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            Student Community Requests
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Students looking for outfits, books, stationery, jewellery, accessories, and campus essentials
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsUniModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold hover:border-emerald-700 shadow-2xs transition-all"
          >
            <School className="w-4 h-4 text-emerald-700" />
            <span>
              Campus: <strong>{activeBrowseFilter === 'ALL' ? 'All Campuses' : activeBrowseFilter}</strong>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <Link
            to="/post-request"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Post a Request</span>
          </Link>
        </div>
      </div>

      {/* Success / Error Notification Toast */}
      {statusNotification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold transition-all animate-fadeIn ${
            statusNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{statusNotification.message}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-neutral-500 hover:text-neutral-800"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode Switch Tabs: All Requests vs My Requests */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-neutral-100 p-1.5 rounded-2xl w-fit border border-neutral-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#12372A]" />
            <span>All Requests</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-[#12372A] text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {allRequestsTotalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-requests')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-requests'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>My Requests</span>
            {currentUser && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'my-requests'
                    ? 'bg-[#12372A] text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {myRequestsTotalCount}
              </span>
            )}
          </button>
        </div>

        {/* Demo Switcher for Preview Mode to quickly verify ID separation */}
        {!isFirebaseReady && currentUser && (
          <div className="flex items-center space-x-2 text-[11px] text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Logged in as: <strong>{currentUser.displayName}</strong></span>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => loginAsDemoUser(currentUser.uid === 'demo-student-1' ? 1 : 0)}
              className="text-[#12372A] font-bold underline hover:text-[#2D6A4F]"
            >
              Switch to {currentUser.uid === 'demo-student-1' ? 'Priya (SRM AP)' : 'Arjun (VIT-AP)'}
            </button>
          </div>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'my-requests'
                ? 'Search your own requests...'
                : 'Search student requests by item, book, costume, occasion, or name...'
            }
            className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none font-medium text-neutral-800"
        >
          <option value="All">All Categories</option>
          <option value="Clothing & Outfits">Clothing & Outfits</option>
          <option value="Jewellery & Bracelets">Jewellery & Bracelets</option>
          <option value="Bags & Accessories">Bags & Accessories</option>
          <option value="Shoes & Footwear">Shoes & Footwear</option>
          <option value="Books & Stationery">Books & Stationery</option>
          <option value="Event & Performance Items">Event & Performance Items</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'my-requests' && !currentUser ? (
        /* Sign-in prompt if guest attempts to view My Requests */
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/90 p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 shadow-2xs">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Sign in to Access My Requests</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Please log in with your university account to manage your item requests, view responses, or delete requests.
          </p>
          <div className="pt-2">
            <Link
              to="/auth"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4 text-emerald-300" />
              <span>Sign In / Create Account</span>
            </Link>
          </div>
        </div>
      ) : activeTab === 'my-requests' && myRequestsTotalCount === 0 ? (
        /* Friendly empty state specifically for My Requests */
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/90 p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#12372A] shadow-2xs">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">You haven't posted any requests yet</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Need an outfit for college fest, a course book, scientific calculator, lab shoes, or jewellery?
            Post a request and campus students will reach out with offers!
          </p>
          <div className="pt-2">
            <Link
              to="/post-request"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Post Your First Request</span>
            </Link>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        /* Empty search/filter result state */
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/90 p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No Matching Requests Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            {activeTab === 'my-requests'
              ? 'None of your posted requests match the active search query or category filter.'
              : 'No active campus requests matching your search filters. Try clearing your filters or switch campuses!'}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        /* Request Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onOffer={(r) => setSelectedOfferRequest(r)}
              onViewResponses={(r) => setSelectedViewResponseRequest(r)}
              onDelete={(r) => {
                setDeleteError(null);
                setRequestToDelete(r);
              }}
            />
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <DeleteConfirmModal
        request={requestToDelete}
        isOpen={Boolean(requestToDelete)}
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setRequestToDelete(null);
            setDeleteError(null);
          }
        }}
      />

      {/* Offer Modal */}
      <OfferItemModal
        request={selectedOfferRequest}
        isOpen={Boolean(selectedOfferRequest)}
        onClose={() => setSelectedOfferRequest(null)}
      />

      {/* View Responses Modal */}
      <ViewResponsesModal
        request={selectedViewResponseRequest}
        isOpen={Boolean(selectedViewResponseRequest)}
        onClose={() => setSelectedViewResponseRequest(null)}
      />

      {/* University Modal */}
      <UniversityModal
        isOpen={isUniModalOpen}
        onClose={() => setIsUniModalOpen(false)}
      />
    </div>
  );
};
