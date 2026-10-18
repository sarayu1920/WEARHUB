import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Leaf, Shield, Heart, Sparkles, School, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0d281e] text-white border-t border-emerald-900/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-white shadow-sm">
                <ShoppingBag className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">WEARHUB</span>
            </div>

            <p className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Wear more. Waste less.
            </p>

            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm">
              The sustainable peer-to-peer student marketplace. Save money, reduce waste, and share clothing, books, jewellery, accessories, and essentials for college fests, dance performances, placement drives, and everyday campus life.
            </p>

            <div className="pt-2 flex items-center space-x-3 text-xs text-neutral-400">
              <span className="inline-flex items-center text-emerald-300">
                <Leaf className="w-4 h-4 mr-1 text-emerald-400" />
                Circular Campus Initiative
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  All Items & Outfits
                </Link>
              </li>
              <li>
                <Link to="/browse?type=Borrow" className="hover:text-white transition-colors">
                  Available to Borrow
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Event%20%26%20Performance%20Items" className="hover:text-white transition-colors">
                  Event & Performance Items
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Books%20%26%20Stationery" className="hover:text-white transition-colors">
                  Books & Stationery
                </Link>
              </li>
              <li>
                <Link to="/browse?type=Donate" className="hover:text-white transition-colors">
                  Free Donated Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Student Hub
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <Link to="/requests" className="hover:text-white transition-colors">
                  Campus Requests Feed
                </Link>
              </li>
              <li>
                <Link to="/post-request" className="hover:text-white transition-colors">
                  Post a Request
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="hover:text-white transition-colors">
                  List an Item
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/setup-guide" className="hover:text-white transition-colors text-emerald-300">
                  Firebase & Netlify Setup
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Campus Guidelines
            </h4>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-neutral-300 space-y-2">
              <p>
                <strong>Public Campus Meetups:</strong> Always exchange or return items in well-lit public spots like the central library quad, dining hall, or student center.
              </p>
              <p>
                <strong>Inspect Together:</strong> Verify item condition, size, and zippers before completing borrow handoffs.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} WEARHUB &bull; Student-to-Student Clothing Network. All sample metrics indicated for campus demonstration.
          </p>

          <div className="flex items-center space-x-4">
            <Link to="/setup-guide" className="hover:text-emerald-300">
              Setup Guide
            </Link>
            <span>&bull;</span>
            <span className="flex items-center text-emerald-300">
              Made with <Heart className="w-3.5 h-3.5 mx-1 text-rose-400 fill-current" /> for Indian Campuses
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
