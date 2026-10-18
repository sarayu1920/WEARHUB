import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';
import { useRequests } from '../context/RequestContext';
import { useUniversity } from '../context/UniversityContext';
import { ProductCard } from '../components/ProductCard';
import { RequestCard } from '../components/RequestCard';
import { BorrowModal } from '../components/BorrowModal';
import { OfferItemModal } from '../components/OfferItemModal';
import { Listing, ItemRequest } from '../types';
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  ShoppingBag,
  Repeat,
  Gift,
  Leaf,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { listings, filterListings } = useListings();
  const { requests } = useRequests();
  const { activeBrowseFilter, getEffectiveUniversityFilter } = useUniversity();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorrowListing, setSelectedBorrowListing] = useState<Listing | null>(null);
  const [selectedOfferRequest, setSelectedOfferRequest] = useState<ItemRequest | null>(null);

  const effectiveUni = getEffectiveUniversityFilter();

  // Filter listings based on active university filter if set
  const filteredCampusListings = effectiveUni
    ? listings.filter((l) => l.university.toLowerCase() === effectiveUni.toLowerCase())
    : listings;

  // Sections
  const trendingItems = [...filteredCampusListings].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  const recentlyAdded = [...filteredCampusListings].slice(0, 4);
  const availableToBorrow = filteredCampusListings.filter((item) => item.transactionTypes.includes('Borrow')).slice(0, 4);
  const recentRequests = requests.slice(0, 3);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#12372A] via-[#1E4D2B] to-[#12372A] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-xl">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#40916C]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#52B788]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Mission badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sustainable Campus Fashion &bull; College Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Wear more. <span className="text-[#B7E4C7]">Waste less.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl mx-auto">
              The student-to-student marketplace to buy, borrow, lend, exchange, and donate clothing, books, accessories, and essentials for college fests, dance performances, placement drives, and campus life.
            </p>

            {/* University context indicator */}
            {effectiveUni && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/80 text-xs text-white border border-emerald-400/30">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>Showing items for: <strong>{effectiveUni}</strong></span>
              </div>
            )}

            {/* Big Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white p-1.5 sm:p-2 border-2 border-emerald-500/30 focus-within:border-emerald-400 transition-all">
                <Search className="w-5 h-5 text-neutral-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blazers, kurtas, textbooks, calculators, costumes, accessories..."
                  className="w-full px-3 py-2.5 text-sm text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Hero CTA buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/browse"
                className="px-6 py-3 rounded-full bg-[#D8F3DC] hover:bg-white text-[#12372A] font-bold text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#12372A]" />
                <span>Browse Marketplace</span>
              </Link>
              <Link
                to="/post-request"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm backdrop-blur-sm transition-all flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Post a Request</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Category Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Buy', icon: ShoppingBag, desc: 'Keep forever', path: '/browse?type=Buy', bg: 'hover:border-emerald-600' },
            { label: 'Borrow', icon: Clock, desc: 'For events & fests', path: '/browse?type=Borrow', bg: 'hover:border-emerald-600' },
            { label: 'Sell', icon: PlusCircle, desc: 'List unused items', path: '/create-listing?mode=Sell', bg: 'hover:border-emerald-600' },
            { label: 'Lend', icon: Sparkles, desc: 'Earn student cash', path: '/create-listing?mode=Borrow', bg: 'hover:border-emerald-600' },
            { label: 'Exchange', icon: Repeat, desc: 'Wardrobe swap', path: '/browse?type=Exchange', bg: 'hover:border-amber-600' },
            { label: 'Donate', icon: Gift, desc: 'Give to juniors', path: '/browse?type=Donate', bg: 'hover:border-emerald-600' },
            { label: 'Request', icon: HelpCircle, desc: 'Ask campus', path: '/post-request', bg: 'hover:border-emerald-600' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.path}
                className="group flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#12372A] group-hover:bg-[#12372A] group-hover:text-white transition-colors flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-800 group-hover:text-[#12372A]">
                  {action.label}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {action.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Campus Favorites</span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 mt-0.5">Trending on Campus</h2>
          </div>
          <Link
            to="/browse?sort=popular"
            className="text-xs font-bold text-[#12372A] hover:text-[#2D6A4F] flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingItems.map((item) => (
            <ProductCard
              key={item.id}
              listing={item}
              onQuickBorrow={(l) => setSelectedBorrowListing(l)}
            />
          ))}
        </div>
      </section>

      {/* Available to Borrow Section */}
      <section className="bg-emerald-50/60 py-12 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#12372A]">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Zero Commitment &bull; Return After Use</span>
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900 mt-0.5">
                Items Available to Borrow
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Ideal for one-night dance performances, college fests, mock placements, and presentations.
              </p>
            </div>
            <Link
              to="/browse?type=Borrow"
              className="text-xs font-bold text-[#12372A] hover:text-[#2D6A4F] flex items-center space-x-1"
            >
              <span>Explore All Borrows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {availableToBorrow.map((item) => (
              <ProductCard
                key={item.id}
                listing={item}
                onQuickBorrow={(l) => setSelectedBorrowListing(l)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 mt-0.5">Recently Added</h2>
          </div>
          <Link
            to="/browse?sort=newest"
            className="text-xs font-bold text-[#12372A] hover:text-[#2D6A4F] flex items-center space-x-1"
          >
            <span>See Newest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recentlyAdded.map((item) => (
            <ProductCard
              key={item.id}
              listing={item}
              onQuickBorrow={(l) => setSelectedBorrowListing(l)}
            />
          ))}
        </div>
      </section>

      {/* Recent Requests Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>Student Community Board</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">
                  Recent Requests from Students
                </h2>
                <p className="text-xs text-neutral-300 mt-1">
                  Have something in your hostel room or wardrobe that matches? Help a campus peer!
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/post-request"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors"
                >
                  Post a Request
                </Link>
                <Link
                  to="/requests"
                  className="text-xs font-bold text-neutral-300 hover:text-white"
                >
                  View All Requests &rarr;
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onOffer={(r) => setSelectedOfferRequest(r)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Stats (Clearly identified as demo metrics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Leaf className="w-3.5 h-3.5" />
              <span>Campus Ecological Impact</span>
            </div>
            <h3 className="text-2xl font-extrabold text-neutral-900">
              The Power of Circular Student Wardrobes
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              * The figures below represent projected campus savings & demo impact metrics until production transaction benchmarks are compiled.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#F3F9F5] border border-emerald-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#12372A]">4,250 kg</div>
              <div className="text-xs font-bold text-neutral-700 mt-2">Carbon Emissions Prevented</div>
              <p className="text-[11px] text-neutral-500 mt-1">
                By recirculating ethnic and formal attire across college batches.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F3F9F5] border border-emerald-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#12372A]">1,850+</div>
              <div className="text-xs font-bold text-neutral-700 mt-2">Wearable Items Reused</div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Costumes, suits, blazers, and lab coats active on campuses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F3F9F5] border border-emerald-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#12372A]">₹14.2 Lakhs</div>
              <div className="text-xs font-bold text-neutral-700 mt-2">Student Cash Saved</div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Avoided expensive one-time purchases for college events and placement drives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="text-2xl font-extrabold text-neutral-900">How WEARHUB Works on Campus</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Safe, peer-to-peer wardrobe sharing between fellow students
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover or Request',
              desc: 'Browse items by college or post what you need for an upcoming fest, dance performance, or placement.',
            },
            {
              step: '02',
              title: 'Connect & Coordinate',
              desc: 'Chat directly with fellow students to agree on dates, borrowing fees, or clothing exchange options.',
            },
            {
              step: '03',
              title: 'Campus Handoff',
              desc: 'Meet safely at a public campus spot (library, student center, or canteen) for quick item exchange.',
            },
            {
              step: '04',
              title: 'Wear & Return',
              desc: 'Enjoy your event looking sharp, return the borrowed piece on time, and keep campus wardrobes circular!',
            },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs relative">
              <div className="text-3xl font-extrabold text-emerald-200 mb-2 font-mono">
                {item.step}
              </div>
              <h4 className="text-sm font-bold text-neutral-800 mb-1">{item.title}</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Borrow Modal */}
      <BorrowModal
        listing={selectedBorrowListing}
        isOpen={Boolean(selectedBorrowListing)}
        onClose={() => setSelectedBorrowListing(null)}
      />

      {/* Offer Item to Request Modal */}
      <OfferItemModal
        request={selectedOfferRequest}
        isOpen={Boolean(selectedOfferRequest)}
        onClose={() => setSelectedOfferRequest(null)}
      />
    </div>
  );
};
