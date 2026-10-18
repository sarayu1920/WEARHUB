import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUniversity } from '../context/UniversityContext';
import { useMessages } from '../context/MessageContext';
import { UniversityModal } from './UniversityModal';
import {
  ShoppingBag,
  PlusCircle,
  MessageSquare,
  User,
  School,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldAlert,
  Leaf,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout, isFirebaseReady } = useAuth();
  const { activeBrowseFilter } = useUniversity();
  const { unreadCount } = useMessages();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUniModalOpen, setIsUniModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchNav, setSearchNav] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNav.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchNav.trim())}`);
      setSearchNav('');
      setIsMobileMenuOpen(false);
    }
  };

  const getFilterLabel = () => {
    if (activeBrowseFilter === 'ALL') return 'All Universities';
    if (activeBrowseFilter === 'MY_UNI') {
      return currentUser?.homeUniversity ? `My: ${currentUser.homeUniversity}` : 'My University';
    }
    return activeBrowseFilter;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top micro banner for configuration status & sustainability notice */}
      <div className="bg-[#0d281e] text-white text-[11px] py-1.5 px-4 font-medium flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-2 mx-auto sm:mx-0">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong>WEARHUB:</strong> Student sustainable fashion marketplace &bull;{' '}
            <span className="text-emerald-300 font-semibold">Wear more. Waste less.</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-[11px]">
          {isFirebaseReady ? (
            <span className="inline-flex items-center text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Firebase Live Connected
            </span>
          ) : (
            <Link
              to="/setup-guide"
              className="inline-flex items-center text-amber-200 hover:text-white bg-amber-950/60 hover:bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-800/80 transition-colors"
            >
              <Database className="w-3 h-3 mr-1 text-amber-300" />
              <span>Preview Mode &bull; Setup Firebase</span>
            </Link>
          )}

          <Link
            to="/setup-guide"
            className="text-neutral-300 hover:text-white flex items-center space-x-1"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Guide</span>
          </Link>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Tagline */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-[#12372A] flex items-center justify-center text-white shadow-md group-hover:bg-[#1E4D2B] transition-colors">
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-extrabold tracking-tight text-[#12372A]">
                      WEARHUB
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D6A4F] block -mt-1">
                    Wear more. Waste less.
                  </span>
                </div>
              </Link>

              {/* University Selector Pill */}
              <button
                onClick={() => setIsUniModalOpen(true)}
                className="hidden lg:flex items-center space-x-2 ml-4 px-3 py-1.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 text-[#12372A] text-xs font-semibold transition-all shadow-2xs group"
                title="Change campus or university filter"
              >
                <School className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[150px] truncate">{getFilterLabel()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700 group-hover:rotate-180 transition-transform" />
              </button>
            </div>

            {/* Global Search Bar (Desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xs mx-6 relative"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchNav}
                onChange={(e) => setSearchNav(e.target.value)}
                placeholder="Search blazers, kurtas, jackets..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-100/80 border border-neutral-200/80 rounded-full text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
              />
            </form>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/')
                    ? 'text-[#12372A] bg-emerald-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                }`}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/browse')
                    ? 'text-[#12372A] bg-emerald-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                }`}
              >
                Browse Marketplace
              </Link>
              <Link
                to="/requests"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/requests')
                    ? 'text-[#12372A] bg-emerald-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                }`}
              >
                Requests Feed
              </Link>
              <Link
                to="/post-request"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/post-request')
                    ? 'text-[#12372A] bg-emerald-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                }`}
              >
                Post a Request
              </Link>

              {/* Messages Link */}
              <Link
                to="/messages"
                className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                  isActive('/messages')
                    ? 'text-[#12372A] bg-emerald-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                )}
              </Link>
            </nav>

            {/* Right Action buttons */}
            <div className="flex items-center space-x-3">
              {/* Sell / Lend CTA button */}
              <Link
                to="/create-listing"
                className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Sell / Lend</span>
              </Link>

              {/* User Account / Profile */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-neutral-100 transition-colors border border-neutral-200/80"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName}
                        className="w-8 h-8 rounded-full object-cover border border-emerald-600/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs font-bold">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden xl:inline text-xs font-bold text-neutral-800 max-w-[100px] truncate">
                      {currentUser.displayName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-150 p-2 z-50 animate-fadeIn"
                    >
                      <div className="p-3 border-b border-neutral-100">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {currentUser.displayName}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">{currentUser.email}</p>
                        <div className="mt-1 flex items-center text-[10px] font-semibold text-[#2D6A4F]">
                          <School className="w-3 h-3 mr-1" />
                          <span className="truncate">{currentUser.homeUniversity}</span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 font-medium"
                        >
                          <User className="w-4 h-4 text-emerald-800" />
                          <span>My Profile & Dashboard</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setIsUniModalOpen(true);
                          }}
                          className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 font-medium"
                        >
                          <School className="w-4 h-4 text-emerald-800" />
                          <span>Change University</span>
                        </button>
                        <Link
                          to="/setup-guide"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 font-medium"
                        >
                          <Database className="w-4 h-4 text-emerald-800" />
                          <span>Firebase & Tech Setup</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-neutral-100">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/auth"
                    className="px-3.5 py-2 rounded-full border border-neutral-300 hover:border-neutral-400 text-neutral-800 text-xs font-bold hover:bg-neutral-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-full bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white p-4 space-y-4 animate-fadeIn">
            {/* University Selector */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsUniModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#12372A] text-xs font-bold"
            >
              <div className="flex items-center space-x-2">
                <School className="w-4 h-4 text-emerald-700" />
                <span>Browsing: {getFilterLabel()}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchNav}
                onChange={(e) => setSearchNav(e.target.value)}
                placeholder="Search items, sizes, or categories..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </form>

            <nav className="flex flex-col space-y-1 text-sm font-semibold">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                Home
              </Link>
              <Link
                to="/browse"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                Browse Marketplace
              </Link>
              <Link
                to="/requests"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                Requests Feed
              </Link>
              <Link
                to="/post-request"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                Post a Request
              </Link>
              <Link
                to="/create-listing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                Sell or Lend an Item
              </Link>
              <Link
                to="/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
              >
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
                    Active
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                My Profile & Dashboard
              </Link>
              <Link
                to="/setup-guide"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50 text-emerald-800"
              >
                Firebase Setup & Deployment Guide
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* University Selection Modal */}
      <UniversityModal
        isOpen={isUniModalOpen}
        onClose={() => setIsUniModalOpen(false)}
      />
    </>
  );
};
