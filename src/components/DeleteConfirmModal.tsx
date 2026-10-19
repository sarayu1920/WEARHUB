import React from 'react';
import { ItemRequest } from '../types';
import { Trash2, AlertTriangle, Loader2, X, School, Tag } from 'lucide-react';

interface DeleteConfirmModalProps {
  request: ItemRequest | null;
  isOpen: boolean;
  isLoading: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  request,
  isOpen,
  isLoading,
  error,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200/90 transition-all animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
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
        <h3 id="delete-dialog-title" className="text-xl font-extrabold text-neutral-900 mb-2">
          Delete Request
        </h3>

        {/* Required Confirmation Prompt */}
        <p className="text-sm text-neutral-600 font-medium leading-relaxed mb-4">
          Are you sure you want to delete this request? This action cannot be undone.
        </p>

        {/* Request Details Preview Box */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 mb-5 space-y-2">
          <p className="text-xs font-bold text-neutral-900 line-clamp-2">
            "{request.title}"
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-neutral-200 font-medium text-neutral-700">
              <Tag className="w-3 h-3 mr-1 text-neutral-400" />
              {request.category === 'Other' && request.customCategory
                ? request.customCategory
                : request.category}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
              <School className="w-3 h-3 mr-1" />
              {request.preferredUniversity}
            </span>
          </div>
        </div>

        {/* Error Alert (if any) */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
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
                <span>Delete Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
