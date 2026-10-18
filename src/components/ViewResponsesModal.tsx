import React from 'react';
import { ItemRequest } from '../types';
import { useRequests } from '../context/RequestContext';
import { X, MessageSquare, Phone, UserCheck, Calendar } from 'lucide-react';

interface ViewResponsesModalProps {
  request: ItemRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewResponsesModal: React.FC<ViewResponsesModalProps> = ({
  request,
  isOpen,
  onClose,
}) => {
  const { getRequestResponses } = useRequests();

  if (!isOpen || !request) return null;

  const responses = getRequestResponses(request.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#12372A] text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#2D6A4F]/60 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Responses & Offers ({responses.length})</h3>
              <p className="text-xs text-emerald-200 truncate max-w-xs">{request.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#2D6A4F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {responses.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="text-sm font-semibold">No offers submitted yet.</p>
              <p className="text-xs text-neutral-400">
                Other students will see your request on the Requests feed and can post responses.
              </p>
            </div>
          ) : (
            responses.map((resp) => (
              <div
                key={resp.id}
                className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {resp.responderAvatar ? (
                      <img
                        src={resp.responderAvatar}
                        alt={resp.responderName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                        {resp.responderName[0]}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-neutral-800">{resp.responderName}</div>
                      <div className="text-[10px] text-neutral-500">{resp.responderUniversity}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(resp.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {resp.offeredItemTitle && (
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-900 text-xs font-semibold">
                    Offered: {resp.offeredItemTitle}
                  </div>
                )}

                <p className="text-xs text-neutral-700 leading-relaxed bg-white p-3 rounded-xl border border-neutral-200/60">
                  {resp.message}
                </p>

                {resp.contactNumber && (
                  <div className="flex items-center space-x-2 text-xs font-medium text-emerald-800 pt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contact: {resp.contactNumber}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
