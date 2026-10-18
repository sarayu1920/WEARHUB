import React, { useState } from 'react';
import { ItemRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { X, Gift, Send, CheckCircle2, AlertCircle, Phone, Tag } from 'lucide-react';

interface OfferItemModalProps {
  request: ItemRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OfferItemModal: React.FC<OfferItemModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { respondToRequest } = useRequests();

  const [message, setMessage] = useState('');
  const [offeredItemTitle, setOfferedItemTitle] = useState('');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please sign in to offer an item or respond');
      return;
    }

    if (!message.trim()) {
      setError('Please provide a message with details about your offer');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await respondToRequest(
        request.id,
        message.trim(),
        offeredItemTitle.trim() || undefined,
        undefined,
        contactNumber.trim() || undefined
      );
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    setMessage('');
    setOfferedItemTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#12372A] text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#2D6A4F]/60 text-white">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Offer Item / Respond</h3>
              <p className="text-xs text-emerald-200">
                Help {request.requesterName} find what they need
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#2D6A4F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-neutral-850">Offer Submitted!</h4>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto">
              Your response has been sent to <span className="font-semibold text-neutral-800">{request.requesterName}</span>.
              They can view your offer and reach out directly!
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-[#12372A] text-white text-sm font-semibold hover:bg-[#1E4D2B] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Request Summary */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
              <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Student Request
              </div>
              <h4 className="font-bold text-neutral-800 mt-0.5">{request.title}</h4>
              <p className="text-neutral-500 mt-1">
                Requested by {request.requesterName} &bull; {request.preferredUniversity}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {request.size && request.size !== 'N/A' && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 font-semibold">
                    Size: {request.size}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 font-semibold">
                  {request.category === 'Other' && request.customCategory ? request.customCategory : request.category}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 font-semibold">
                  For: {request.purpose}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 font-semibold">
                  Needed by: {request.dateNeeded}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Offered item title */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Item You Have (Optional Title)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={offeredItemTitle}
                  onChange={(e) => setOfferedItemTitle(e.target.value)}
                  placeholder="e.g. Black Blazer (M) / Authentic Temple bells"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Your Message / Details of Offer *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let them know what you have, condition, terms (free, borrow, sell, or exchange), and when you can meet on campus..."
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              />
            </div>

            {/* Contact Phone / WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Phone / WhatsApp Number (For quick campus meetup)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Offer...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-300" />
                  <span>Submit Offer to Student</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
