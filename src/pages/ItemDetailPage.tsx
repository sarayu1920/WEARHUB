import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';
import { useAuth } from '../context/AuthContext';
import { BorrowModal } from '../components/BorrowModal';
import { ContactModal } from '../components/ContactModal';
import { ProductCard } from '../components/ProductCard';
import { TransactionType } from '../types';
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  ShoppingBag,
  Repeat,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowLeft,
  School,
  AlertCircle,
  Leaf,
  MessageSquare,
} from 'lucide-react';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getListingById, listings } = useListings();
  const { currentUser, toggleSaveListing } = useAuth();

  const listing = getListingById(id || '');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState<TransactionType>('Buy');
  const [copiedShare, setCopiedShare] = useState(false);

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Item Not Found</h2>
        <p className="text-xs text-neutral-500">
          This listing may have been completed, reserved, or removed by the student owner.
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isSaved = currentUser?.savedListingIds?.includes(listing.id);
  const isOwner = currentUser?.uid === listing.ownerId;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const handleOpenContact = (type: TransactionType) => {
    setContactType(type);
    setIsContactModalOpen(true);
  };

  // Related items from same category or university
  const relatedItems = listings
    .filter((l) => l.id !== listing.id && (l.category === listing.category || l.university === listing.university))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to items</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-neutral-250 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>{copiedShare ? 'Link Copied!' : 'Share Item'}</span>
          </button>
          <button
            onClick={() => toggleSaveListing(listing.id)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isSaved
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-neutral-700 border-neutral-250 hover:bg-neutral-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-rose-600' : 'text-neutral-500'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Item Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Photo Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-md">
            <img
              src={listing.images[activeImageIndex] || listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Condition badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900/80 text-white backdrop-blur-md">
                {listing.condition}
              </span>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {listing.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-[#12372A] scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="space-y-6">
          {/* Header & University */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wider mb-2">
              <School className="w-4 h-4" />
              <span>{listing.university}</span>
              {listing.campusSpot && (
                <>
                  <span className="text-neutral-300">&bull;</span>
                  <span className="text-neutral-500 lowercase font-medium">{listing.campusSpot}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
              {listing.title}
            </h1>

            {/* Tags / Subcategory */}
            <div className="flex flex-wrap gap-2 mt-3">
              {listing.size && listing.size !== 'N/A' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#12372A] text-white">
                  Size: {listing.size}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-800">
                {listing.category === 'Other' && listing.customCategory ? listing.customCategory : listing.category}
              </span>
              {listing.isSample && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100/70 text-emerald-800 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Verified Campus Listing
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Transaction Cards */}
          <div className="p-5 rounded-3xl bg-neutral-50 border border-neutral-200/90 space-y-4">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Available Options
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Borrow Option Card */}
              {listing.transactionTypes.includes('Borrow') && (
                <div className="p-4 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#12372A] flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        Borrow for Events
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {listing.borrowDurationLimit || '1-4 days'}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-[#12372A] mt-2">
                      ₹{listing.borrowRate || 100}
                      <span className="text-xs font-normal text-neutral-500"> / day</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Refundable deposit: ₹{listing.securityDeposit || 300} at pickup.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsBorrowModalOpen(true)}
                    className="mt-4 w-full py-2.5 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Select Dates & Borrow
                  </button>
                </div>
              )}

              {/* Buy Option Card */}
              {listing.transactionTypes.includes('Buy') && (
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800 flex items-center">
                        <ShoppingBag className="w-3.5 h-3.5 mr-1 text-neutral-600" />
                        Buy & Keep
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-500">
                        Campus handoff
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-neutral-900 mt-2">
                      ₹{listing.price?.toLocaleString('en-IN') || 0}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Pay seller in-person upon inspecting item.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenContact('Buy')}
                    className="mt-4 w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Express Purchase Interest
                  </button>
                </div>
              )}

              {/* Exchange Option Card */}
              {listing.transactionTypes.includes('Exchange') && (
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-800 flex items-center">
                      <Repeat className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Clothing Swap / Exchange
                    </span>
                    <p className="text-xs text-neutral-600 mt-2">
                      The owner is open to exchanging this item for other college wear.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenContact('Exchange')}
                    className="mt-4 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Propose Swap
                  </button>
                </div>
              )}

              {/* Donate Option Card */}
              {listing.transactionTypes.includes('Donate') && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center">
                      <Gift className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Free Donation
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-2">Free</div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Giving away to any student who can use it!
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenContact('Donate')}
                    className="mt-4 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Request Donated Item
                  </button>
                </div>
              )}
            </div>

            {/* General Inquiry Button */}
            <button
              onClick={() => handleOpenContact('Borrow')}
              className="w-full py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-white transition-colors flex items-center justify-center space-x-1.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-800" />
              <span>Ask Owner a Question / Inquire</span>
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-neutral-900">About this Item</h3>
            <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-neutral-200/80">
              {listing.description}
            </p>
          </div>

          {/* Student Owner Card */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {listing.ownerAvatar ? (
                <img
                  src={listing.ownerAvatar}
                  alt={listing.ownerName}
                  className="w-11 h-11 rounded-full object-cover border border-emerald-700/30"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#12372A] text-white flex items-center justify-center text-sm font-bold">
                  {listing.ownerName[0]}
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-neutral-900">{listing.ownerName}</h4>
                <p className="text-[11px] text-neutral-500">{listing.ownerUniversity}</p>
                <div className="text-[10px] text-emerald-800 font-semibold flex items-center mt-0.5">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified Student Profile
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenContact('Buy')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#12372A] text-xs font-bold transition-colors"
            >
              Message
            </button>
          </div>

          {/* Campus Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-[#F3F9F5] border border-emerald-150 text-[11px] text-neutral-600 flex items-start space-x-2.5">
            <Leaf className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Direct Peer-to-Peer Campus Exchange:</strong> No online transaction fees. Meet on campus in public view (library quad, student activity center, dining hall) to verify condition and try on fitting.
            </p>
          </div>
        </div>
      </div>

      {/* Related items */}
      {relatedItems.length > 0 && (
        <section className="pt-8 border-t border-neutral-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900">Similar Campus Items</h3>
            <Link to="/browse" className="text-xs font-bold text-[#12372A] hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedItems.map((item) => (
              <ProductCard
                key={item.id}
                listing={item}
                onQuickBorrow={() => {
                  // Navigate to item or open borrow modal
                  navigate(`/item/${item.id}`);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        listing={listing}
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
      />

      {/* Contact / Inquiry Modal */}
      <ContactModal
        listing={listing}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        defaultType={contactType}
      />
    </div>
  );
};
