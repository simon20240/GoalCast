/**
 * Cache Service - Stores API data locally so it's fetched once per day.
 * All users on the same device share the same cached data.
 * Live match scores still refresh periodically but fixtures/schedule data
 * is only fetched once daily.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'goalcast_cache_';
const CACHE_META_KEY = `${CACHE_PREFIX}meta`;

interface CacheMeta {
  lastFetchDate: string; // YYYY-MM-DD
  lastFetchTimestamp: number;
  lastLiveRefresh: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get cache metadata
 */
async function getCacheMeta(): Promise<CacheMeta | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Update cache metadata
 */
async function setCacheMeta(meta: Partial<CacheMeta>): Promise<void> {
  try {
    const existing = await getCacheMeta();
    const updated: CacheMeta = {
      lastFetchDate: meta.lastFetchDate || existing?.lastFetchDate || '',
      lastFetchTimestamp: meta.lastFetchTimestamp || existing?.lastFetchTimestamp || 0,
      lastLiveRefresh: meta.lastLiveRefresh || existing?.lastLiveRefresh || 0,
    };
    await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail
  }
}

/**
 * Save data to cache with today's date stamp
 */
export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      date: getTodayString(),
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Silent fail - cache is best-effort
  }
}

/**
 * Get cached data if it's from today. Returns null if cache is stale or missing.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const today = getTodayString();

    // Cache is valid only if it's from today
    if (entry.date === today) {
      return entry.data;
    }

    // Stale cache - remove it
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  } catch {
    return null;
  }
}

/**
 * Get cached data regardless of age (for offline fallback)
 */
export async function getCacheFallback<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Check if today's fixture data has already been fetched
 */
export async function isTodayDataCached(): Promise<boolean> {
  const meta = await getCacheMeta();
  if (!meta) return false;
  return meta.lastFetchDate === getTodayString();
}

/**
 * Mark that today's full data fetch is complete
 */
export async function markDailyFetchComplete(): Promise<void> {
  await setCacheMeta({
    lastFetchDate: getTodayString(),
    lastFetchTimestamp: Date.now(),
  });
}

/**
 * Check if live matches need a refresh.
 * Live scores can refresh more often (every 2 minutes) even though
 * fixture lists are daily.
 */
export async function shouldRefreshLive(intervalMs: number = 120000): Promise<boolean> {
  const meta = await getCacheMeta();
  if (!meta) return true;
  return (Date.now() - meta.lastLiveRefresh) > intervalMs;
}

/**
 * Mark that live data was just refreshed
 */
export async function markLiveRefresh(): Promise<void> {
  await setCacheMeta({ lastLiveRefresh: Date.now() });
}

/**
 * Force clear all cache (for manual refresh)
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Silent fail
  }
}

// Cache keys
export const CACHE_KEYS = {
  LIVE_MATCHES: 'live_matches',
  TODAY_FIXTURES: 'today_fixtures',
  UPCOMING_FIXTURES: 'upcoming_fixtures',
  FINISHED_MATCHES: 'finished_matches',
} as const;
