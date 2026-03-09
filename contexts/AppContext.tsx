import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ProcessedMatch,
  fetchLiveMatches,
  fetchTodayFixtures,
  fetchUpcomingFixtures,
  fetchFinishedMatches,
  isTodayDataCached,
  markDailyFetchComplete,
  clearAllCache,
  resetApiStatus,
} from '@/services/footballApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStreamBot, BotStatus } from '@/hooks/useStreamBot';
import { StreamServer } from '@/services/streamScraper';

interface AppState {
  favorites: string[];
  toggleFavorite: (matchId: string) => void;
  isFavorite: (matchId: string) => boolean;
  liveMatches: ProcessedMatch[];
  upcomingMatches: ProcessedMatch[];
  finishedMatches: ProcessedMatch[];
  allMatches: ProcessedMatch[];
  selectedServer: string;
  setSelectedServer: (id: string) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  forceRefreshData: () => Promise<void>;
  isCached: boolean;
  // Stream Bot
  getStreamsForMatch: (matchId: string) => StreamServer[];
  hasStreamsForMatch: (matchId: string) => boolean;
  botStatus: BotStatus;
  refreshMatchStreams: (matchId: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedServer, setSelectedServer] = useState('s1');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [liveMatches, setLiveMatches] = useState<ProcessedMatch[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<ProcessedMatch[]>([]);
  const [finishedMatches, setFinishedMatches] = useState<ProcessedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Load favorites from storage
  useEffect(() => {
    AsyncStorage.getItem('favorites').then(data => {
      if (data) setFavorites(JSON.parse(data));
    });
    AsyncStorage.getItem('notifications').then(data => {
      if (data !== null) setNotificationsEnabled(JSON.parse(data));
    });
  }, []);

  // Save favorites
  useEffect(() => {
    AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    AsyncStorage.setItem('notifications', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  // Fetch data from API - uses daily cache for fixtures
  // Live matches still refresh every 2 min, but fixture lists are daily
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      // These functions internally check cache:
      // - today/upcoming/finished: return cached data if already fetched today
      // - live: return cached data if refreshed within 2 minutes
      const [live, today, upcoming, finished] = await Promise.all([
        fetchLiveMatches(language),
        fetchTodayFixtures(language),
        fetchUpcomingFixtures(language),
        fetchFinishedMatches(language),
      ]);

      setLiveMatches(live);

      // Merge today's non-live upcoming into upcoming
      const todayUpcoming = today.filter(m => m.status === 'UPCOMING');
      const allUpcoming = [...todayUpcoming, ...upcoming];
      const uniqueUpcoming = allUpcoming.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
      setUpcomingMatches(uniqueUpcoming);

      // Merge today's finished with yesterday's
      const todayFinished = today.filter(m => m.status === 'FT');
      const allFinished = [...todayFinished, ...finished];
      const uniqueFinished = allFinished.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
      setFinishedMatches(uniqueFinished);

      // Mark daily fetch complete
      await markDailyFetchComplete();
      const cachedStatus = await isTodayDataCached();
      setIsCached(cachedStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [language]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh live matches every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const live = await fetchLiveMatches(language);
        setLiveMatches(live);
      } catch (err) {
        // Silent fail for background refresh
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [language]);

  // Normal refresh - uses cache (won't re-fetch if cached today)
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(false);
  }, [loadData]);

  // Force refresh - clears cache and fetches fresh data from API
  const forceRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    await clearAllCache();
    resetApiStatus();
    setIsCached(false);
    await loadData(false);
  }, [loadData]);

  const toggleFavorite = (matchId: string) => {
    setFavorites(prev =>
      prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]
    );
  };

  const isFavorite = (matchId: string) => favorites.includes(matchId);
  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

  const allMatches = [...liveMatches, ...upcomingMatches, ...finishedMatches];

  // Stream Bot integration
  const {
    getStreamsForMatch,
    hasStreams: hasStreamsForMatch,
    botStatus,
    refreshMatchStreams,
  } = useStreamBot(allMatches);

  return (
    <AppContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        liveMatches,
        upcomingMatches,
        finishedMatches,
        allMatches,
        selectedServer,
        setSelectedServer,
        notificationsEnabled,
        toggleNotifications,
        isLoading,
        isRefreshing,
        error,
        refreshData,
        forceRefreshData,
        isCached,
        getStreamsForMatch,
        hasStreamsForMatch,
        botStatus,
        refreshMatchStreams,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
