import React, { createContext, useContext, useState, useEffect } from 'react';
import { University } from '../types';
import { INITIAL_UNIVERSITIES } from '../data/universities';
import { useAuth } from './AuthContext';

export type UniversityBrowseMode = 'ALL' | 'MY_UNI' | string;

interface UniversityContextType {
  universities: University[];
  activeBrowseFilter: UniversityBrowseMode;
  setActiveBrowseFilter: (filter: UniversityBrowseMode) => void;
  requestUniversityAddition: (name: string, city: string, state: string) => Promise<boolean>;
  requestedUniversities: { name: string; city: string; state: string; submittedAt: string }[];
  getEffectiveUniversityFilter: () => string | null; // Returns null for all, or university name string
  searchUniversities: (query: string) => University[];
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export const UniversityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [universities, setUniversities] = useState<University[]>(() => {
    const saved = localStorage.getItem('wearhub_universities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_UNIVERSITIES;
      }
    }
    return INITIAL_UNIVERSITIES;
  });

  const [activeBrowseFilter, setActiveBrowseFilter] = useState<UniversityBrowseMode>('ALL');
  const [requestedUniversities, setRequestedUniversities] = useState<{
    name: string;
    city: string;
    state: string;
    submittedAt: string;
  }[]>(() => {
    const saved = localStorage.getItem('wearhub_requested_universities');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wearhub_universities', JSON.stringify(universities));
  }, [universities]);

  useEffect(() => {
    localStorage.setItem('wearhub_requested_universities', JSON.stringify(requestedUniversities));
  }, [requestedUniversities]);

  const requestUniversityAddition = async (name: string, city: string, state: string): Promise<boolean> => {
    const newReq = { name, city, state, submittedAt: new Date().toISOString() };
    setRequestedUniversities((prev) => [newReq, ...prev]);

    // Also optimistically add to current list with a pending tag
    const newUni: University = {
      id: 'req-' + Date.now(),
      name,
      shortName: name.length > 15 ? name.substring(0, 15) : name,
      city,
      state,
      popular: false,
    };
    setUniversities((prev) => [...prev, newUni]);
    return true;
  };

  const getEffectiveUniversityFilter = (): string | null => {
    if (activeBrowseFilter === 'ALL') return null;
    if (activeBrowseFilter === 'MY_UNI') {
      return currentUser?.homeUniversity || null;
    }
    return activeBrowseFilter;
  };

  const searchUniversities = (query: string): University[] => {
    if (!query.trim()) return universities;
    const lower = query.toLowerCase();
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.shortName.toLowerCase().includes(lower) ||
        u.city.toLowerCase().includes(lower) ||
        u.state.toLowerCase().includes(lower)
    );
  };

  return (
    <UniversityContext.Provider
      value={{
        universities,
        activeBrowseFilter,
        setActiveBrowseFilter,
        requestUniversityAddition,
        requestedUniversities,
        getEffectiveUniversityFilter,
        searchUniversities,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
};

export const useUniversity = () => {
  const context = useContext(UniversityContext);
  if (!context) {
    throw new Error('useUniversity must be used within a UniversityProvider');
  }
  return context;
};
