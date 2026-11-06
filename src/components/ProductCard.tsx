import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { Heart, MapPin, Repeat, Gift, Clock, Sparkles, Laptop, Cloud } from 'lucide-react';

interface ProductCardProps {
  listing: Listing;
  onQuickBorrow?: (listing: Listing) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing, onQuickBorrow }) => {
  const navigate = useNavigate();
  const { currentUser, toggleSaveListing } = useAuth();
  const isSaved = currentUser?.savedListingIds?.includes(listing.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    toggleSaveListing(listing.id);
  };

  // Badge helpers
  const hasBuy = listing.transactionTypes.includes('Buy');
  const hasBorrow = listing.transactionTypes.includes('Borrow');
  const hasExchange = listing.transactionTypes.includes('Exchange');
  const hasDonate = listing.transactionTypes.includes('Donate');

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-neutral-200/80 hover:border-emerald-700/30 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300">
      {/* Image Container */}
      <Link to={`/item/${listing.id}`} className="relative block aspect-[4/5] overflow-hidden bg-neutral-100">
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button & Storage Status Indicator */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
          {listing.isLocalPrototype ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-700/90 text-white backdrop-blur-md shadow-xs">
              <Laptop className="w-2.5 h-2.5 mr-1" />
              Local Prototype
            </span>
          ) : !listing.isSample ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-800/80 text-white backdrop-blur-md shadow-xs">
              <Cloud className="w-2.5 h-2.5 mr-1 text-emerald-300" />
              Firebase
            </span>
          ) : null}

          <button
            onClick={handleFavoriteClick}
            aria-label={isSaved ? 'Remove from saved' : 'Save item'}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 hover:bg-white text-neutral-600 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Transaction Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
          {hasBorrow && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#12372A] text-white shadow-xs">
              <Clock className="w-3 h-3 mr-1" />
              Borrow
            </span>
          )}
          {hasBuy && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#2D6A4F] text-white shadow-xs">
              Buy
            </span>
          )}
          {hasExchange && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-600 text-white shadow-xs">
              <Repeat className="w-3 h-3 mr-1" />
              Exchange
            </span>
          )}
          {hasDonate && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow-xs">
              <Gift className="w-3 h-3 mr-1" />
              Free Donate
            </span>
          )}
        </div>

        {/* Condition pill & size badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {listing.size && listing.size !== 'N/A' ? (
            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-white/90 text-neutral-800 shadow-xs backdrop-blur-sm">
              Size: {listing.size}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-white/90 text-neutral-800 shadow-xs backdrop-blur-sm">
              {listing.category === 'Other' && listing.customCategory ? listing.customCategory : listing.category}
            </span>
          )}
          <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-900/70 text-white backdrop-blur-sm truncate max-w-[140px]">
            {listing.condition}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* University Badge */}
        <div className="flex items-center text-xs text-[#2D6A4F] font-semibold mb-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-[#2D6A4F]" />
          <span className="truncate">{listing.university}</span>
        </div>

        {/* Title */}
        <Link to={`/item/${listing.id}`}>
          <h3 className="font-semibold text-neutral-850 text-sm line-clamp-1 group-hover:text-[#12372A] transition-colors" title={listing.title}>
            {listing.title}
          </h3>
        </Link>

        {/* Category & Campus spot */}
        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
          {listing.category === 'Other' && listing.customCategory ? listing.customCategory : listing.category} {listing.campusSpot ? `• ${listing.campusSpot}` : ''}
        </p>

        {/* Price / Borrow Info */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-baseline justify-between">
          <div>
            {hasBuy && listing.price !== undefined && (
              <div className="text-base font-bold text-neutral-900">
                ₹{listing.price.toLocaleString('en-IN')}
                {hasBorrow && (
                  <span className="text-[11px] font-normal text-neutral-500 ml-1">
                    (or borrow)
                  </span>
                )}
              </div>
            )}

            {!hasBuy && hasBorrow && (
              <div className="text-base font-bold text-[#12372A]">
                ₹{listing.borrowRate || 100}
                <span className="text-xs font-normal text-neutral-500"> / day</span>
              </div>
            )}

            {!hasBuy && !hasBorrow && hasDonate && (
              <div className="text-sm font-bold text-emerald-700">
                Free to good home
              </div>
            )}

            {!hasBuy && !hasBorrow && !hasDonate && hasExchange && (
              <div className="text-xs font-bold text-amber-700">
                Open to swap
              </div>
            )}
          </div>

          {/* Quick Borrow / View Action */}
          {hasBorrow ? (
            <button
              onClick={() => onQuickBorrow ? onQuickBorrow(listing) : null}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#12372A] hover:bg-[#12372A] hover:text-white transition-colors"
            >
              Borrow
            </button>
          ) : (
            <Link
              to={`/item/${listing.id}`}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Details
            </Link>
          )}
        </div>

        {/* Local prototype vs Cloud tag indicator */}
        {listing.isLocalPrototype ? (
          <div className="mt-2 pt-1 border-t border-dashed border-violet-200 flex items-center justify-between text-[10px] text-violet-700">
            <span className="flex items-center font-semibold">
              <Laptop className="w-2.5 h-2.5 mr-1 text-violet-600" />
              Local Prototype Listing
            </span>
            <span className="text-violet-500">Saved in browser</span>
          </div>
        ) : listing.isSample ? (
          <div className="mt-2 pt-1 border-t border-dashed border-neutral-150 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="flex items-center">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-600" />
              Verified Campus Item
            </span>
            <span>By {listing.ownerName}</span>
          </div>
        ) : (
          <div className="mt-2 pt-1 border-t border-dashed border-emerald-100 flex items-center justify-between text-[10px] text-emerald-700">
            <span className="flex items-center font-medium">
              <Cloud className="w-2.5 h-2.5 mr-1 text-emerald-600" />
              Shared via Firebase
            </span>
            <span className="text-neutral-400">By {listing.ownerName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
