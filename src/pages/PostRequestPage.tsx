import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { useUniversity } from '../context/UniversityContext';
import { ItemCategory, ClothingSize, RequestPurpose } from '../types';
import {
  HelpCircle,
  Calendar,
  Send,
  AlertCircle,
  Sparkles,
  School,
  Tag,
  ShieldAlert,
} from 'lucide-react';

const ITEM_CATEGORIES: ItemCategory[] = [
  'Clothing & Outfits',
  'Jewellery & Bracelets',
  'Bags & Accessories',
  'Shoes & Footwear',
  'Books & Stationery',
  'Event & Performance Items',
  'Other',
];

const SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Standard', 'N/A'];

const PURPOSES: RequestPurpose[] = [
  'College Dance / Cultural',
  'College Fest / Party',
  'Formal Presentation / Interview',
  'Everyday Campus Use',
  'Hackathon / Tech Event',
  'Academic & Exam Prep',
  'Sports / Athleisure',
  'Other Special Occasion',
];

export const PostRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createRequest } = useRequests();
  const { universities } = useUniversity();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Clothing & Outfits');
  const [customCategory, setCustomCategory] = useState('');
  const [size, setSize] = useState<ClothingSize>('Free Size');
  const [purpose, setPurpose] = useState<RequestPurpose>('College Fest / Party');
  const [dateNeeded, setDateNeeded] = useState(defaultDate);
  const [preferredType, setPreferredType] = useState<
    'Buy' | 'Borrow' | 'Exchange' | 'Any Suitable Option'
  >('Borrow');
  const [preferredUniversity, setPreferredUniversity] = useState(
    currentUser?.homeUniversity || 'VIT-AP University'
  );
  const [description, setDescription] = useState('');
  const [budgetOrTerms, setBudgetOrTerms] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Sign in to Post a Request</h2>
        <p className="text-xs text-neutral-500">
          Sign in so students across campus can message you with item offers and borrowing options.
        </p>
        <Link
          to="/auth"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide the item needed and details');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setError('Please specify a custom category or item type for "Other"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createRequest({
        title: title.trim(),
        category,
        customCategory: category === 'Other' ? customCategory.trim() : undefined,
        size: size || 'N/A',
        purpose,
        dateNeeded,
        preferredType,
        preferredUniversity,
        description: description.trim(),
        budgetOrTerms: budgetOrTerms.trim() || undefined,
        status: 'open',
      });

      navigate('/requests');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Your Campus Community</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
          Post a Request
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Need an outfit, textbook, jewellery, calculator, costume, or event gear? Broadcast your request to fellow students!
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-6"
      >
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Item Needed */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Item Needed *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Charcoal Placement Blazer, B.Tech Math Textbook, Silver Jhumkas, Dandiya Sticks..."
            className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>

        {/* Item Category & Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Item Category *</label>
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value as ItemCategory;
                setCategory(newCat);
                if (newCat === 'Books & Stationery' || newCat === 'Jewellery & Bracelets' || newCat === 'Event & Performance Items') {
                  setSize('Free Size');
                }
              }}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
            >
              {ITEM_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Size / Dimension (If applicable)</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as ClothingSize)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Category Input if "Other" is chosen */}
        {category === 'Other' && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 animate-fadeIn">
            <label className="block text-xs font-bold text-amber-900 mb-1">
              Specify Item Category / Custom Type *
            </label>
            <input
              type="text"
              required
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. Lab Equipment, Electronics, Sports Kit, Musical Instrument..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-amber-700 mt-1">
              Specify the type of item so other students can immediately recognize what you need.
            </p>
          </div>
        )}

        {/* Purpose & Date Needed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Purpose / Occasion *
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as RequestPurpose)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Date Needed By *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={dateNeeded}
                onChange={(e) => setDateNeeded(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Preferred Transaction Mode */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
            Preferred Option *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Borrow', 'Buy', 'Exchange', 'Any Suitable Option'].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setPreferredType(type as any)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  preferredType === type
                    ? 'bg-[#12372A] text-white border-[#12372A]'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* University & Budget/Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Preferred Campus / University *
            </label>
            <select
              value={preferredUniversity}
              onChange={(e) => setPreferredUniversity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
            >
              {universities.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Estimated Budget or Terms (Optional)
            </label>
            <input
              type="text"
              value={budgetOrTerms}
              onChange={(e) => setBudgetOrTerms(e.target.value)}
              placeholder="e.g. Willing to pay ₹100 borrow fee or negotiate buy price"
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Item Description & Additional Details *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain specifics (edition for books, color or style for accessories, event timings, condition desired, and campus meetup preferences)..."
            className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <span>Publishing Request...</span>
          ) : (
            <>
              <Send className="w-4 h-4 text-emerald-300" />
              <span>Broadcast Request to Campus</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
