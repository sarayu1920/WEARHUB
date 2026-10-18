import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { useUniversity } from '../context/UniversityContext';
import { RequestCard } from '../components/RequestCard';
import { OfferItemModal } from '../components/OfferItemModal';
import { ViewResponsesModal } from '../components/ViewResponsesModal';
import { UniversityModal } from '../components/UniversityModal';
import { ItemRequest } from '../types';
import {
  HelpCircle,
  PlusCircle,
  Search,
  School,
  ChevronDown,
} from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { requests } = useRequests();
  const { activeBrowseFilter } = useUniversity();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOfferRequest, setSelectedOfferRequest] = useState<ItemRequest | null>(null);
  const [selectedViewResponseRequest, setSelectedViewResponseRequest] = useState<ItemRequest | null>(null);
  const [isUniModalOpen, setIsUniModalOpen] = useState(false);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    // University
    if (activeBrowseFilter !== 'ALL') {
      if (r.preferredUniversity.toLowerCase() !== activeBrowseFilter.toLowerCase()) {
        return false;
      }
    }

    // Category
    if (selectedCategory !== 'All') {
      if (r.category !== selectedCategory && r.customCategory !== selectedCategory) {
        return false;
      }
    }

    // Search
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            <span>Campus: <strong>{activeBrowseFilter === 'ALL' ? 'All Campuses' : activeBrowseFilter}</strong></span>
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student requests by item, book, costume, occasion, or name..."
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

      {/* Request Grid */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/90 p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-850">No Requests Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            No active requests matching your filters. Post your own request or switch campuses!
          </p>
          <Link
            to="/post-request"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
          >
            Post a Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onOffer={(r) => setSelectedOfferRequest(r)}
              onViewResponses={(r) => setSelectedViewResponseRequest(r)}
            />
          ))}
        </div>
      )}

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
