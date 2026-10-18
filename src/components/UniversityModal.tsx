import React, { useState } from 'react';
import { useUniversity } from '../context/UniversityContext';
import { useAuth } from '../context/AuthContext';
import { X, Search, School, Check, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';

interface UniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversityModal: React.FC<UniversityModalProps> = ({ isOpen, onClose }) => {
  const {
    universities,
    activeBrowseFilter,
    setActiveBrowseFilter,
    requestUniversityAddition,
  } = useUniversity();
  const { currentUser, updateHomeUniversity } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUniName, setNewUniName] = useState('');
  const [newUniCity, setNewUniCity] = useState('');
  const [newUniState, setNewUniState] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUnis = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFilter = (filterValue: string) => {
    setActiveBrowseFilter(filterValue);
    onClose();
  };

  const handleSetHomeUniversity = async (uniName: string) => {
    if (currentUser) {
      await updateHomeUniversity(uniName);
      setFeedbackMsg(`Updated your home university to ${uniName}!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleSubmitNewUni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName.trim()) return;

    await requestUniversityAddition(
      newUniName.trim(),
      newUniCity.trim() || 'Campus',
      newUniState.trim() || 'India'
    );

    setFeedbackMsg(`Thank you! "${newUniName}" has been submitted and added to your options.`);
    setNewUniName('');
    setNewUniCity('');
    setNewUniState('');
    setShowAddForm(false);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-emerald-900/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#12372A] text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#2D6A4F]/60 text-white">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Select University</h3>
              <p className="text-xs text-emerald-200">
                Browse listings campus-wide or across all Indian universities
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

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Browsing Mode
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectFilter('ALL')}
              className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                activeBrowseFilter === 'ALL'
                  ? 'bg-[#12372A] text-white border-[#12372A] shadow-sm'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#2D6A4F]'
              }`}
            >
              <span>All Universities</span>
              {activeBrowseFilter === 'ALL' && <Check className="w-4 h-4 text-emerald-300" />}
            </button>

            {currentUser?.homeUniversity ? (
              <button
                onClick={() => handleSelectFilter('MY_UNI')}
                className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all truncate ${
                  activeBrowseFilter === 'MY_UNI'
                    ? 'bg-[#12372A] text-white border-[#12372A] shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#2D6A4F]'
                }`}
                title={currentUser.homeUniversity}
              >
                <span className="truncate">My: {currentUser.homeUniversity}</span>
                {activeBrowseFilter === 'MY_UNI' && <Check className="w-4 h-4 text-emerald-300 flex-shrink-0" />}
              </button>
            ) : (
              <button
                onClick={() => handleSelectFilter('VIT-AP University')}
                className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-semibold border bg-white text-neutral-700 border-neutral-200 hover:border-[#2D6A4F]"
              >
                <span>VIT-AP (Default)</span>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name, city or state..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* University List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-72">
          {filteredUnis.length === 0 ? (
            <div className="text-center py-8 px-4 text-neutral-500">
              <AlertCircle className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p className="text-sm">No universities matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setNewUniName(searchQuery);
                  setShowAddForm(true);
                }}
                className="mt-3 text-xs font-semibold text-[#12372A] underline hover:text-[#2D6A4F]"
              >
                Click here to request adding this university
              </button>
            </div>
          ) : (
            filteredUnis.map((uni) => {
              const isSelected = activeBrowseFilter === uni.name;
              const isUserHome = currentUser?.homeUniversity === uni.name;

              return (
                <div
                  key={uni.id}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#2D6A4F] bg-emerald-50/50'
                      : 'border-neutral-150 hover:border-emerald-300 hover:bg-neutral-50'
                  }`}
                >
                  <button
                    onClick={() => handleSelectFilter(uni.name)}
                    className="flex-1 text-left flex items-start space-x-3"
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-neutral-100 group-hover:bg-emerald-100 text-neutral-600 group-hover:text-emerald-800 transition-colors">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-neutral-800">
                          {uni.name}
                        </span>
                        {isUserHome && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                            Your Campus
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {uni.city}, {uni.state} &bull; <span className="text-neutral-400 font-mono text-[11px]">{uni.shortName}</span>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center space-x-2 ml-2">
                    {currentUser && !isUserHome && (
                      <button
                        onClick={() => handleSetHomeUniversity(uni.name)}
                        className="opacity-0 group-hover:opacity-100 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded bg-emerald-100/70 hover:bg-emerald-200 transition-all"
                        title="Set as your home university in profile"
                      >
                        Set as Home
                      </button>
                    )}
                    {isSelected && <Check className="w-5 h-5 text-[#2D6A4F]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Request University Section */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-150">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-[#12372A] hover:text-[#2D6A4F] hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Can't find your college? Request university addition</span>
            </button>
          ) : (
            <form onSubmit={handleSubmitNewUni} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700">Request University Addition</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-600"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                required
                value={newUniName}
                onChange={(e) => setNewUniName(e.target.value)}
                placeholder="Official University Name"
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newUniCity}
                  onChange={(e) => setNewUniCity(e.target.value)}
                  placeholder="City / Campus"
                  className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
                <input
                  type="text"
                  value={newUniState}
                  onChange={(e) => setNewUniState(e.target.value)}
                  placeholder="State"
                  className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Submit University Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
