import React from 'react';
import { Listing } from '../types';
import { Trash2, AlertTriangle, Loader2, X, School, Laptop, Cloud } from 'lucide-react';

interface DeleteListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  isLoading: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  listing,
  isOpen,
  isLoading,
  error,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200/90 transition-all animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-listing-dialog-title"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
          aria-label="Cancel deletion"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-2xs">
          <Trash2 className="w-6 h-6" />
        </div>

        {/* Dialog Title */}
        <h3 id="delete-listing-dialog-title" className="text-xl font-extrabold text-neutral-900 mb-2">
          Delete Listing
        </h3>

        {/* Required Confirmation Prompt with item title */}
        <p className="text-sm text-neutral-600 font-medium leading-relaxed mb-4">
          Are you sure you want to delete <span className="font-bold text-neutral-900">"{listing.title}"</span>? This action cannot be undone.
        </p>

        {/* Item Details Preview Box */}
        <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 mb-5 flex items-center space-x-3.5">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
            alt={listing.title}
            className="w-16 h-16 rounded-xl object-cover border border-neutral-200 flex-shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs font-bold text-neutral-900 truncate">
              {listing.title}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
              <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700 font-medium">
                {listing.category === 'Other' && listing.customCategory ? listing.customCategory : listing.category}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                <School className="w-3 h-3 mr-1" />
                {listing.university}
              </span>
            </div>
            <div className="flex items-center space-x-2 pt-0.5">
              {listing.isLocalPrototype ? (
                <span className="inline-flex items-center text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">
                  <Laptop className="w-2.5 h-2.5 mr-1" />
                  Local Prototype
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <Cloud className="w-2.5 h-2.5 mr-1" />
                  Firebase Cloud
                </span>
              )}
              {listing.transactionTypes.includes('Buy') && listing.price !== undefined && (
                <span className="text-[11px] font-bold text-[#12372A]">₹{listing.price}</span>
              )}
              {listing.transactionTypes.includes('Borrow') && (
                <span className="text-[11px] font-bold text-[#12372A]">₹{listing.borrowRate || 100}/day</span>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert (if any) */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Listing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
