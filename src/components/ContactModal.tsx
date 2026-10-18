import React, { useState } from 'react';
import { Listing, TransactionType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessageContext';
import { useNavigate } from 'react-router-dom';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle, ShoppingBag, Repeat, Gift } from 'lucide-react';

interface ContactModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  listing,
  isOpen,
  onClose,
  defaultType = 'Buy',
}) => {
  const { currentUser } = useAuth();
  const { startConversationWithSeller } = useMessages();
  const navigate = useNavigate();

  const getInitialMessage = (type: TransactionType, item: Listing) => {
    switch (type) {
      case 'Buy':
        return `Hi ${item.ownerName}! I'm interested in buying your "${item.title}" for ₹${item.price || ''}. Is this still available for meetup on campus?`;
      case 'Exchange':
        return `Hi ${item.ownerName}! I saw your "${item.title}" and would love to propose a clothing swap/exchange. Let me know what styles or sizes you are looking for!`;
      case 'Donate':
        return `Hi ${item.ownerName}! Thank you so much for offering "${item.title}" for donation. I would be so grateful to give this a great home for campus use!`;
      default:
        return `Hi ${item.ownerName}! Is your "${item.title}" still available on campus?`;
    }
  };

  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType>(defaultType);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update initial message when modal opens or type changes
  React.useEffect(() => {
    if (listing) {
      setSelectedType(defaultType);
      setMessage(getInitialMessage(defaultType, listing));
    }
  }, [listing, defaultType, isOpen]);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please sign in to contact the student owner');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await startConversationWithSeller(listing, message.trim());
      onClose();
      navigate('/messages');
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#12372A] text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#2D6A4F]/60 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Contact Student Owner</h3>
              <p className="text-xs text-emerald-200">
                Peer-to-peer campus message with {listing.ownerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#2D6A4F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Preview */}
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 truncate">{listing.title}</h4>
              <p className="text-[11px] text-neutral-500">
                Owner: {listing.ownerName} &bull; {listing.university}
              </p>
              {listing.campusSpot && (
                <p className="text-[10px] text-emerald-700">Meetup spot: {listing.campusSpot}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Purpose of Inquiry
            </label>
            <div className="flex flex-wrap gap-2">
              {listing.transactionTypes.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setSelectedType(t);
                    setMessage(getInitialMessage(t, listing));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedType === t
                      ? 'bg-[#12372A] text-white border-[#12372A]'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#2D6A4F]'
                  }`}
                >
                  {t === 'Buy' && <ShoppingBag className="w-3 h-3 inline mr-1" />}
                  {t === 'Exchange' && <Repeat className="w-3 h-3 inline mr-1" />}
                  {t === 'Donate' && <Gift className="w-3 h-3 inline mr-1" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Your Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              placeholder="Ask about sizing, condition, or suggest a campus meeting spot..."
            />
          </div>

          <p className="text-[11px] text-neutral-500">
            Messages are delivered to the owner's WEARHUB inbox. You can continue the conversation under the <strong>Messages</strong> tab.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-emerald-300" />
                <span>Send Message & Open Chat</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
