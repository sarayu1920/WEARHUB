import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import { useUniversity } from '../context/UniversityContext';
import { ItemCategory, ClothingSize, ItemCondition, TransactionType } from '../types';
import {
  PlusCircle,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Clock,
  Repeat,
  Gift,
  MapPin,
  ShieldAlert,
} from 'lucide-react';

const CATEGORIES: ItemCategory[] = [
  'Clothing & Outfits',
  'Jewellery & Bracelets',
  'Bags & Accessories',
  'Shoes & Footwear',
  'Books & Stationery',
  'Event & Performance Items',
  'Other',
];

const SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Standard', 'N/A'];

const CONDITIONS: ItemCondition[] = [
  'Brand New with Tags',
  'Like New',
  'Gently Used',
  'Well Loved',
];

// Sample image presets for fast testing
const SAMPLE_IMAGE_PRESETS = [
  {
    name: 'Formal Blazer',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Ethnic Kurta',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Temple Jewellery',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'College Textbooks',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Denim Jacket',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Leather Bag',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  },
];

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { createListing } = useListings();
  const { universities } = useUniversity();

  const initialMode = (searchParams.get('mode') as TransactionType) || 'Sell';

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Clothing & Outfits');
  const [customCategory, setCustomCategory] = useState('');
  const [size, setSize] = useState<ClothingSize>('M');
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>(
    initialMode === 'Borrow' ? ['Borrow'] : ['Buy']
  );
  const [price, setPrice] = useState<number>(650);
  const [borrowRate, setBorrowRate] = useState<number>(100);
  const [borrowDurationLimit, setBorrowDurationLimit] = useState<string>('1 - 3 days');
  const [securityDeposit, setSecurityDeposit] = useState<number>(300);
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_IMAGE_PRESETS[0].url);
  const [university, setUniversity] = useState<string>(
    currentUser?.homeUniversity || 'VIT-AP University'
  );
  const [campusSpot, setCampusSpot] = useState<string>('Central Library / Canteen Quad');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle transaction types
  const toggleType = (type: TransactionType) => {
    if (transactionTypes.includes(type)) {
      if (transactionTypes.length === 1) return; // Keep at least one
      setTransactionTypes(transactionTypes.filter((t) => t !== type));
    } else {
      setTransactionTypes([...transactionTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be signed in to create a listing');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please provide an item title and description');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setError('Please specify a custom category or item type for "Other"');
      return;
    }

    if (transactionTypes.includes('Buy') && (!price || price <= 0)) {
      setError('Please specify a valid selling price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newId = await createListing({
        title: title.trim(),
        description: description.trim(),
        category,
        customCategory: category === 'Other' ? customCategory.trim() : undefined,
        size: size || 'Free Size',
        condition,
        transactionTypes,
        price: transactionTypes.includes('Buy') ? Number(price) : undefined,
        borrowRate: transactionTypes.includes('Borrow') ? Number(borrowRate) : undefined,
        borrowDurationLimit: transactionTypes.includes('Borrow') ? borrowDurationLimit : undefined,
        securityDeposit: transactionTypes.includes('Borrow') ? Number(securityDeposit) : undefined,
        images: [imageUrl.trim() || SAMPLE_IMAGE_PRESETS[0].url],
        university,
        campusSpot: campusSpot.trim() || undefined,
        status: 'available',
      });

      navigate(`/item/${newId}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to publish listing');
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Sign in to List Items</h2>
        <p className="text-xs text-neutral-500">
          To maintain campus safety and peer accountability, students must sign in before selling or lending items.
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Circular Campus Sharing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
          List an Item for Campus
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Share clothing, books, jewellery, accessories, event gear, or footwear with fellow students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Navy Blue Placement Blazer, Casio fx-991EX Calculator, Temple Jewellery Choker..."
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>

          {/* Transaction Types */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              How would you like to offer this item? (Select all that apply) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'Buy', label: 'Sell Item', icon: ShoppingBag },
                { type: 'Borrow', label: 'Lend Item', icon: Clock },
                { type: 'Exchange', label: 'Exchange / Swap', icon: Repeat },
                { type: 'Donate', label: 'Free Donate', icon: Gift },
              ].map(({ type, label, icon: Icon }) => {
                const isSelected = transactionTypes.includes(type as TransactionType);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleType(type as TransactionType)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-[#12372A] text-white border-[#12372A] shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-emerald-300' : 'text-neutral-500'}`} />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing depending on types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            {transactionTypes.includes('Buy') && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Selling Price (₹ INR) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            )}

            {transactionTypes.includes('Borrow') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Borrow Daily Rate (₹ / day)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={borrowRate}
                    onChange={(e) => setBorrowRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Refundable Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Borrow Duration Limit
                  </label>
                  <select
                    value={borrowDurationLimit}
                    onChange={(e) => setBorrowDurationLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none"
                  >
                    <option value="1 - 2 days (Single Event)">1 - 2 days (Single Event)</option>
                    <option value="1 - 4 days">1 - 4 days</option>
                    <option value="Up to 1 week">Up to 1 week</option>
                    <option value="Flexible upon agreement">Flexible upon agreement</option>
                  </select>
                </div>
              </>
            )}

            {!transactionTypes.includes('Buy') && !transactionTypes.includes('Borrow') && (
              <div className="sm:col-span-2 text-xs text-neutral-500 py-1">
                {transactionTypes.includes('Donate')
                  ? 'This item will be offered completely free for campus donation.'
                  : 'This item will be listed for campus exchange / swap.'}
              </div>
            )}
          </div>

          {/* Item Category, Size, Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Size / Dimension *</label>
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

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom category input if Other */}
          {category === 'Other' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 animate-fadeIn">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                Specify Custom Item Category / Type *
              </label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Lab Kit, Electronics, Sports Equipment..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* University & Campus Spot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                University / Campus *
              </label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Preferred Campus Meetup Spot
              </label>
              <input
                type="text"
                value={campusSpot}
                onChange={(e) => setCampusSpot(e.target.value)}
                placeholder="e.g. Central Library foyer / Mens Hostel 2"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Image selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">
              Item Photos (Image URL or Choose Preset) *
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste public photo URL (Unsplash, Imgur, Cloudinary...)"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
            />

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-neutral-500 block mb-1.5">
                Or quick-select sample item image preset:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IMAGE_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => setImageUrl(preset.url)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      imageUrl === preset.url
                        ? 'bg-[#12372A] text-white border-[#12372A]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, specifications, when it was used (e.g. semester, festival, placement), and pickup instructions..."
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Publishing to Campus...</span>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 text-emerald-300" />
                <span>Publish Listing to WEARHUB</span>
              </>
            )}
          </button>
        </form>

        {/* Live Preview Column */}
        <div className="space-y-4 sticky top-24">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Live Marketplace Preview
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-md">
            <div className="aspect-[4/5] bg-neutral-100 relative overflow-hidden">
              <img
                src={imageUrl || SAMPLE_IMAGE_PRESETS[0].url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-1">
                {transactionTypes.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#12372A] text-white"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-white/90 text-neutral-800">
                  Size: {size}
                </span>
                <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-900/80 text-white">
                  {condition}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="text-[11px] font-semibold text-[#2D6A4F] flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{university}</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 truncate">
                {title || 'Your Item Title Here'}
              </h3>
              <p className="text-[11px] text-neutral-500 truncate">
                {category === 'Other' && customCategory ? customCategory : category} &bull; {campusSpot}
              </p>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#12372A]">
                {transactionTypes.includes('Buy') ? (
                  <span>₹{price}</span>
                ) : transactionTypes.includes('Borrow') ? (
                  <span>₹{borrowRate} / day</span>
                ) : (
                  <span>{transactionTypes.join(' & ')}</span>
                )}
                <span className="text-[10px] text-neutral-400 font-normal">By {currentUser.displayName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
