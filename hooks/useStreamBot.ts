import { useState, useEffect, useCallback, useRef } from 'react';
import {
  scrapeMatchSchedule,
  linkStreamsToMatches,
  validateMatchStreams,
  StreamServer,
  ScrapedStream,
} from '@/services/streamScraper';
import { ProcessedMatch } from '@/services/footballApi';

const BOT_INTERVAL = 60000; // 60 seconds
const VALIDATION_INTERVAL = 120000; // 2 minutes

export interface BotStatus {
  isRunning: boolean;
  lastScrape: number | null;
  lastScrapeCount: number;
  matchedCount: number;
  totalStreams: number;
  errors: string[];
}

export function useStreamBot(allMatches: ProcessedMatch[]) {
  const [matchStreams, setMatchStreams] = useState<Map<string, StreamServer[]>>(new Map());
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isRunning: false,
    lastScrape: null,
    lastScrapeCount: 0,
    matchedCount: 0,
    totalStreams: 0,
    errors: [],
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const validationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Main scrape cycle: fetch schedule, match to API data, update state
   */
  const runScrapeJob = useCallback(async () => {
    if (allMatches.length === 0) return;

    setBotStatus(prev => ({ ...prev, isRunning: true, errors: [] }));

    try {
      // Step 1: Scrape the schedule page
      const scrapedStreams = await scrapeMatchSchedule();

      // Step 2: Prepare API matches for linking
      const apiMatches = allMatches.map(m => ({
        id: m.id,
        fixtureId: m.fixtureId,
        homeTeamName: m.homeTeam.name,
        awayTeamName: m.awayTeam.name,
        startTime: m.startTime,
        status: m.status,
      }));

      // Step 3: Link scraped streams to API matches
      const linked = linkStreamsToMatches(scrapedStreams, apiMatches);

      // Step 4: Merge with existing streams (keep validated ones)
      setMatchStreams(prev => {
        const merged = new Map(prev);
        for (const [matchId, newStreams] of linked.entries()) {
          const existing = merged.get(matchId) || [];
          // Keep existing active streams, add new ones
          const existingUrls = new Set(existing.map(s => s.url));
          const uniqueNew = newStreams.filter(s => !existingUrls.has(s.url));
          merged.set(matchId, [...existing, ...uniqueNew]);
        }
        return merged;
      });

      // Update bot status
      let totalStreams = 0;
      linked.forEach(streams => { totalStreams += streams.length; });

      setBotStatus(prev => ({
        ...prev,
        isRunning: false,
        lastScrape: Date.now(),
        lastScrapeCount: scrapedStreams.length,
        matchedCount: linked.size,
        totalStreams,
      }));
    } catch (error: any) {
      setBotStatus(prev => ({
        ...prev,
        isRunning: false,
        errors: [...prev.errors, error.message || 'Scrape failed'],
      }));
    }
  }, [allMatches]);

  /**
   * Validation cycle: check if existing stream URLs are still alive
   */
  const runValidation = useCallback(async () => {
    setMatchStreams(prev => {
      const validated = new Map(prev);
      // Only validate matches that have streams
      for (const [matchId, streams] of validated.entries()) {
        // Mark streams older than 5 minutes for re-check
        const updated = streams.map(s => {
          if (Date.now() - s.lastChecked > 300000) {
            return { ...s, status: 'checking' as const };
          }
          return s;
        });
        validated.set(matchId, updated);
      }
      return validated;
    });

    // Actually validate in background
    for (const [matchId, streams] of matchStreams.entries()) {
      const staleStreams = streams.filter(s => Date.now() - s.lastChecked > 300000);
      if (staleStreams.length > 0) {
        const validated = await validateMatchStreams(staleStreams);
        setMatchStreams(prev => {
          const updated = new Map(prev);
          const current = updated.get(matchId) || [];
          const freshIds = new Set(validated.map(v => v.id));
          const merged = [
            ...current.filter(s => !staleStreams.some(st => st.id === s.id)),
            ...validated,
          ];
          updated.set(matchId, merged);
          return updated;
        });
      }
    }
  }, [matchStreams]);

  /**
   * Start the bot: initial scrape + set intervals
   */
  const startBot = useCallback(() => {
    // Run immediately
    runScrapeJob();

    // Set up recurring scrape
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(runScrapeJob, BOT_INTERVAL);

    // Set up recurring validation
    if (validationRef.current) clearInterval(validationRef.current);
    validationRef.current = setInterval(runValidation, VALIDATION_INTERVAL);
  }, [runScrapeJob, runValidation]);

  /**
   * Stop the bot
   */
  const stopBot = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (validationRef.current) {
      clearInterval(validationRef.current);
      validationRef.current = null;
    }
    setBotStatus(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Auto-start when matches are available
  useEffect(() => {
    if (allMatches.length > 0) {
      startBot();
    }
    return () => stopBot();
  }, [allMatches.length > 0]);

  // Re-scrape when matches data changes significantly
  useEffect(() => {
    if (allMatches.length > 0 && botStatus.lastScrape) {
      // If more than 2 minutes since last scrape, re-run
      if (Date.now() - botStatus.lastScrape > 120000) {
        runScrapeJob();
      }
    }
  }, [allMatches]);

  /**
   * Get streams for a specific match
   */
  const getStreamsForMatch = useCallback((matchId: string): StreamServer[] => {
    return matchStreams.get(matchId) || [];
  }, [matchStreams]);

  /**
   * Check if a match has any streams
   */
  const hasStreams = useCallback((matchId: string): boolean => {
    const streams = matchStreams.get(matchId);
    return (streams?.length ?? 0) > 0;
  }, [matchStreams]);

  /**
   * Force refresh streams for a specific match
   */
  const refreshMatchStreams = useCallback(async (matchId: string) => {
    const streams = matchStreams.get(matchId);
    if (streams && streams.length > 0) {
      const validated = await validateMatchStreams(streams);
      setMatchStreams(prev => {
        const updated = new Map(prev);
        updated.set(matchId, validated);
        return updated;
      });
    }
  }, [matchStreams]);

  return {
    matchStreams,
    botStatus,
    getStreamsForMatch,
    hasStreams,
    startBot,
    stopBot,
    runScrapeJob,
    refreshMatchStreams,
  };
}
