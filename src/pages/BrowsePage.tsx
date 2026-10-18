import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListings } from '../context/ListingContext';
import { useUniversity } from '../context/UniversityContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { BorrowModal } from '../components/BorrowModal';
import { UniversityModal } from '../components/UniversityModal';
import { Listing, ItemCategory, ClothingSize, ItemCondition, TransactionType } from '../types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  School,
  ChevronDown,
  RotateCcw,
  ArrowUpDown,
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

const TRANSACTION_TYPES: TransactionType[] = ['Buy', 'Borrow', 'Exchange', 'Donate'];

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterListings } = useListings();
  const { universities, activeBrowseFilter, setActiveBrowseFilter } = useUniversity();
  const { currentUser } = useAuth();

  // URL query params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialType = searchParams.get('type') || 'All';
  const initialSort = (searchParams.get('sort') as any) || 'newest';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>(initialType);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>(initialSort);
  const [maxPrice, setMaxPrice] = useState<number>(3000);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isUniModalOpen, setIsUniModalOpen] = useState(false);
  const [selectedBorrowListing, setSelectedBorrowListing] = useState<Listing | null>(null);

  // Sync state with URL params if they change
  useEffect(() => {
    if (searchParams.get('search')) setSearchQuery(searchParams.get('search')!);
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category')!);
    if (searchParams.get('type')) setSelectedTransactionType(searchParams.get('type')!);
  }, [searchParams]);

  // Determine effective university
  const effectiveUni =
    activeBrowseFilter === 'ALL'
      ? 'ALL'
      : activeBrowseFilter === 'MY_UNI'
      ? currentUser?.homeUniversity || 'ALL'
      : activeBrowseFilter;

  // Run filter
  const filteredItems = filterListings({
    searchQuery,
    university: effectiveUni,
    category: selectedCategory,
    size: selectedSize,
    condition: selectedCondition,
    transactionType: selectedTransactionType,
    maxPrice,
    sortBy,
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSize('All');
    setSelectedCondition('All');
    setSelectedTransactionType('All');
    setMaxPrice(3000);
    setSortBy('newest');
    setActiveBrowseFilter('ALL');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'All' ||
    selectedSize !== 'All' ||
    selectedCondition !== 'All' ||
    selectedTransactionType !== 'All' ||
    activeBrowseFilter !== 'ALL' ||
    maxPrice < 3000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Marketplace Wardrobe
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Explore {filteredItems.length} clothing item{filteredItems.length !== 1 ? 's' : ''} available across student campuses
          </p>
        </div>

        {/* University Switcher button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsUniModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold hover:border-emerald-700 shadow-2xs transition-all"
          >
            <School className="w-4 h-4 text-emerald-700" />
            <span>
              Campus:{' '}
              <strong className="text-[#12372A]">
                {activeBrowseFilter === 'ALL'
                  ? 'All Campuses'
                  : activeBrowseFilter === 'MY_UNI'
                  ? `My (${currentUser?.homeUniversity || 'Default'})`
                  : activeBrowseFilter}
              </strong>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#12372A] text-white text-xs font-bold shadow-xs"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-150">
            <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
              <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
              <span>Filter Wardrobe</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Keywords / Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Blazer, lehenga, saree..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-250 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">
              Transaction Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSelectedTransactionType('All')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  selectedTransactionType === 'All'
                    ? 'bg-[#12372A] text-white border-[#12372A]'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                All Modes
              </button>
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTransactionType(type)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    selectedTransactionType === type
                      ? 'bg-[#12372A] text-white border-[#12372A]'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">
              Item Category
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-50 text-[#12372A] font-bold'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-emerald-50 text-[#12372A] font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">
              Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('All')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                  selectedSize === 'All'
                    ? 'bg-[#12372A] text-white border-[#12372A]'
                    : 'bg-white text-neutral-700 border-neutral-200'
                }`}
              >
                All
              </button>
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    selectedSize === size
                      ? 'bg-[#12372A] text-white border-[#12372A]'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">
              Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-250 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="All">Any Condition</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-neutral-700 mb-1.5">
              <span>Max Price</span>
              <span className="text-[#12372A]">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#2D6A4F]"
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sorting & Filter summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            {/* Active chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-neutral-500 mr-1">Active:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="ml-1 hover:text-emerald-950">
                    &times;
                  </button>
                </span>
              )}
              {selectedTransactionType !== 'All' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  {selectedTransactionType}
                  <button onClick={() => setSelectedTransactionType('All')} className="ml-1 hover:text-emerald-950">
                    &times;
                  </button>
                </span>
              )}
              {selectedSize !== 'All' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  Size: {selectedSize}
                  <button onClick={() => setSelectedSize('All')} className="ml-1 hover:text-emerald-950">
                    &times;
                  </button>
                </span>
              )}
              {!hasActiveFilters && (
                <span className="text-neutral-400">All available campus items</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              >
                <option value="newest">Newest Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Grid of items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/90 p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-850">No Items Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No items match your active filters in this university view. Try switching to "All Universities" or relaxing filters.
              </p>
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#1E4D2B] transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setIsUniModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Change University
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  listing={item}
                  onQuickBorrow={(l) => setSelectedBorrowListing(l)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-2xl p-6 overflow-y-auto z-10 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-bold text-sm text-neutral-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Transaction Types */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Mode</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedTransactionType('All')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                    selectedTransactionType === 'All' ? 'bg-[#12372A] text-white' : 'bg-white'
                  }`}
                >
                  All
                </button>
                {TRANSACTION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTransactionType(type)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      selectedTransactionType === type ? 'bg-[#12372A] text-white' : 'bg-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Size</label>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s === selectedSize ? 'All' : s)}
                    className={`px-2.5 py-1 text-xs border rounded-md ${
                      selectedSize === s ? 'bg-[#12372A] text-white' : 'bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 text-xs font-bold border rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-2.5 text-xs font-bold bg-[#12372A] text-white rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        listing={selectedBorrowListing}
        isOpen={Boolean(selectedBorrowListing)}
        onClose={() => setSelectedBorrowListing(null)}
      />

      {/* University Modal */}
      <UniversityModal
        isOpen={isUniModalOpen}
        onClose={() => setIsUniModalOpen(false)}
      />
    </div>
  );
};
