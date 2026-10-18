import React, { useState } from 'react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import { X, Calendar, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BorrowModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { createBorrowRequest } = useListings();

  // Tomorrow as default start
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 3);
  const defaultEndStr = defaultEnd.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [occasion, setOccasion] = useState('College Dance / Cultural Fest');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  // Calculate days & cost
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const dailyRate = listing.borrowRate || 100;
  const totalBorrowFee = dailyRate * days;
  const deposit = listing.securityDeposit || 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please sign in to send a borrow request');
      return;
    }

    if (end < start) {
      setError('Return date must be on or after start date');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createBorrowRequest(
        listing,
        startDate,
        endDate,
        occasion,
        message || `Hi ${listing.ownerName}, I would love to borrow this for ${occasion}.`
      );
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit borrow request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#12372A] text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#2D6A4F]/60 text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Request to Borrow</h3>
              <p className="text-xs text-emerald-200">Arrange campus pickup & return</p>
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
            <h4 className="text-xl font-bold text-neutral-850">Borrow Request Sent!</h4>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto">
              Your request for <span className="font-semibold text-neutral-800">"{listing.title}"</span> has been dispatched to{' '}
              <span className="font-semibold">{listing.ownerName}</span> ({listing.university}).
            </p>
            <div className="p-4 rounded-xl bg-emerald-50 text-xs text-emerald-800 text-left border border-emerald-200/60 space-y-1.5">
              <div className="font-bold flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-700" />
                What happens next?
              </div>
              <p>
                The owner can review your request and accept via Messages. Coordinate the campus handoff at a public spot (library, student center, canteen).
              </p>
            </div>
            <div className="pt-2 flex justify-center space-x-3">
              <Link
                to="/profile"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-sm font-semibold hover:bg-[#1E4D2B] transition-colors"
              >
                View in My Requests
              </Link>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Listing snippet */}
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-800 truncate">{listing.title}</h4>
                <p className="text-xs text-neutral-500">
                  Lender: {listing.ownerName} &bull; {listing.university}
                </p>
                <div className="text-xs font-semibold text-[#12372A] mt-0.5">
                  ₹{listing.borrowRate || 100} / day &bull; Deposit: ₹{deposit}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Occasion / College Event
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              >
                <option value="College Dance / Cultural Fest">College Dance / Cultural Fest</option>
                <option value="Campus Placement / Interview">Campus Placement / Interview</option>
                <option value="College Farewell / Prom Night">College Farewell / Prom Night</option>
                <option value="Traditional / Ethnic Day">Traditional / Ethnic Day</option>
                <option value="Hackathon / Presentation">Hackathon / Presentation</option>
                <option value="Everyday Campus Need">Everyday Campus Need</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Note to owner */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Note to Owner (Pickup preference, care confirmation)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Can meet near the central library. Will handle with care and return cleanly!"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              />
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-600">
                <span>Borrowing duration:</span>
                <span className="font-semibold text-neutral-800">{days} day(s)</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated fee (₹{dailyRate} &times; {days}d):</span>
                <span className="font-semibold text-neutral-800">₹{totalBorrowFee}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Refundable security deposit:</span>
                <span className="font-semibold text-neutral-800">₹{deposit}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-bold text-[#12372A]">
                <span>Total Due at Handoff:</span>
                <span>₹{totalBorrowFee + deposit}</span>
              </div>
            </div>

            {/* Peer to Peer Safety Notice */}
            <div className="flex items-start space-x-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold text-neutral-700">Direct Campus Arrangement:</span> No upfront online payment. Fees and refundable deposits are exchanged directly during campus pickup.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Sending Request...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Send Borrow Request</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
