import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  User,
  School,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    conversations,
    activeConversation,
    activeMessages,
    setActiveConversationId,
    sendMessage,
  } = useMessages();

  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of active conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Sign in to Access Messages</h2>
        <p className="text-xs text-neutral-500">
          Communicate with item owners and borrowers to arrange campus meetups.
        </p>
        <Link
          to="/auth"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const msg = inputMessage;
    setInputMessage('');
    await sendMessage(msg);
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const otherParticipantId = c.participantIds.find((id) => id !== currentUser.uid);
    const otherName = otherParticipantId ? c.participants[otherParticipantId]?.name : '';
    const title = c.listingTitle || '';
    return otherName.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  });

  // Get recipient info
  const otherId = activeConversation?.participantIds.find((id) => id !== currentUser.uid);
  const otherParticipant = otherId && activeConversation?.participants[otherId]
    ? activeConversation.participants[otherId]
    : { name: 'Campus Student', university: 'Campus', avatar: undefined };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Campus Messages
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Peer-to-peer wardrobe coordination & campus pickup arrangements
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Campus Peer Chat</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 min-h-[650px] max-h-[750px]">
        {/* Left Column: Inbox List */}
        <div className="md:col-span-1 lg:col-span-4 border-r border-neutral-200 flex flex-col">
          {/* Inbox Search */}
          <div className="p-4 border-b border-neutral-150">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-100 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs p-4">
                No active conversations found. Browse items to contact sellers or borrowers!
              </div>
            ) : (
              filteredConversations.map((c) => {
                const partnerId = c.participantIds.find((id) => id !== currentUser.uid);
                const partner = partnerId ? c.participants[partnerId] : null;
                const isSelected = activeConversation?.id === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-4 border-l-[#12372A]'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    {partner?.avatar ? (
                      <img
                        src={partner.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#12372A] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {partner?.name ? partner.name[0] : 'U'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-neutral-900 truncate">
                          {partner?.name || 'Campus Student'}
                        </h4>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(c.lastTimestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="text-[10px] text-[#2D6A4F] font-semibold truncate">
                        {partner?.university}
                      </div>

                      {c.listingTitle && (
                        <div className="text-[11px] text-neutral-700 font-medium truncate mt-0.5">
                          Re: {c.listingTitle}
                        </div>
                      )}

                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Thread */}
        <div className="md:col-span-2 lg:col-span-8 flex flex-col justify-between bg-neutral-50/30">
          {activeConversation ? (
            <>
              {/* Top Chat Header */}
              <div className="p-4 bg-white border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {otherParticipant.avatar ? (
                    <img
                      src={otherParticipant.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#12372A] text-white flex items-center justify-center font-bold text-xs">
                      {otherParticipant.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {otherParticipant.name}
                    </h3>
                    <p className="text-[11px] text-[#2D6A4F] font-semibold">
                      {otherParticipant.university}
                    </p>
                  </div>
                </div>

                {activeConversation.listingId && (
                  <Link
                    to={`/item/${activeConversation.listingId}`}
                    className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
                  >
                    {activeConversation.listingImage && (
                      <img
                        src={activeConversation.listingImage}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                    )}
                    <span className="truncate max-w-[120px] sm:max-w-xs">
                      {activeConversation.listingTitle}
                    </span>
                  </Link>
                )}
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-[#12372A] text-white rounded-br-xs'
                            : 'bg-white text-neutral-800 border border-neutral-200/90 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Form */}
              <form
                onSubmit={handleSend}
                className="p-4 bg-white border-t border-neutral-200 flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message or suggest a campus meetup spot..."
                  className="flex-1 px-4 py-2.5 text-xs bg-neutral-100 border border-neutral-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-full bg-[#12372A] hover:bg-[#1E4D2B] text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4 text-emerald-300" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-neutral-300" />
              <p className="text-sm font-semibold text-neutral-600">Select a conversation</p>
              <p className="text-xs text-neutral-400">
                Choose a chat from the left panel to coordinate with fellow students.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
