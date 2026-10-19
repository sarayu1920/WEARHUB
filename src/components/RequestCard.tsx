import React, { useState, useRef, useEffect } from 'react';
import { ItemRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Tag,
  MessageCircle,
  Gift,
  Trash2,
  MoreVertical,
  UserCheck,
} from 'lucide-react';

interface RequestCardProps {
  request: ItemRequest;
  onOffer: (request: ItemRequest) => void;
  onViewResponses?: (request: ItemRequest) => void;
  onDelete?: (request: ItemRequest) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onOffer,
  onViewResponses,
  onDelete,
}) => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ownership strictly determined by authenticated UID
  const isOwner = Boolean(currentUser && currentUser.uid === request.requesterId);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isUrgent = () => {
    const needed = new Date(request.dateNeeded).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((needed - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#D8F3DC] text-[#12372A]">
              <Tag className="w-3 h-3 mr-1" />
              {request.preferredType}
            </span>
            {isOwner && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#12372A] text-emerald-200 border border-[#2D6A4F]/40">
                <UserCheck className="w-3 h-3 mr-1" />
                Your Request
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isUrgent() && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                Needed Soon
              </span>
            )}
            <span className="text-xs font-semibold text-neutral-500 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-neutral-400" />
              By {request.dateNeeded}
            </span>

            {/* Three-dot menu for Request Owner */}
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen((prev) => !prev);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                  title="Request Options"
                  aria-label="Request Options"
                  aria-expanded={isMenuOpen}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-30 animate-fadeIn">
                    {onViewResponses && request.responsesCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onViewResponses(request);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Offers ({request.responsesCount})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        if (onDelete) onDelete(request);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete Request</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-neutral-900 text-base line-clamp-2 mb-1.5 hover:text-[#12372A] transition-colors">
          {request.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-neutral-600 line-clamp-3 mb-3 leading-relaxed">
          {request.description}
        </p>

        {/* Purpose & Category / Size Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {request.size && request.size !== 'N/A' && (
            <span className="px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 text-neutral-700">
              Size: <strong className="text-neutral-900">{request.size}</strong>
            </span>
          )}
          <span className="px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 text-neutral-700">
            {request.category === 'Other' && request.customCategory ? request.customCategory : request.category}
          </span>
          <span className="px-2 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 text-[#12372A] border border-emerald-100">
            {request.purpose}
          </span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-neutral-150">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2 truncate">
            {request.requesterAvatar ? (
              <img
                src={request.requesterAvatar}
                alt={request.requesterName}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px] font-bold">
                {request.requesterName ? request.requesterName[0] : 'S'}
              </div>
            )}
            <span className="font-semibold text-neutral-700 truncate">
              {isOwner ? 'You' : request.requesterName}
            </span>
          </div>

          <div className="flex items-center text-[#2D6A4F] font-semibold text-xs ml-2 truncate">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{request.preferredUniversity}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 gap-2">
          {request.responsesCount > 0 ? (
            <button
              type="button"
              onClick={() => (onViewResponses ? onViewResponses(request) : null)}
              className="text-xs font-semibold text-[#12372A] hover:text-[#2D6A4F] flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{request.responsesCount} Offer(s)</span>
            </button>
          ) : (
            <span className="text-[11px] text-neutral-400">
              {isOwner ? 'No offers yet' : 'Be the first to offer!'}
            </span>
          )}

          {/* Action button based on ownership */}
          {isOwner ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => (onDelete ? onDelete(request) : null)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs"
                title="Delete your request"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Request</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOffer(request)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-300" />
              <span>Offer Item</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
