const API_KEY = '4dacc53e6232827f801107853303d82a';
const BASE_URL = 'https://v3.football.api-sports.io';

// League IDs prioritized for Arab/Middle East audience
// Top European leagues + Arab/African competitions first
export const PRIORITY_LEAGUES = [
  // Arab & Middle East favorites
  { id: 2, name: 'Champions League', nameAr: 'دوري أبطال أوروبا', shortName: 'UCL', shortNameAr: 'دوري الأبطال', priority: 1 },
  { id: 39, name: 'Premier League', nameAr: 'الدوري الإنجليزي', shortName: 'EPL', shortNameAr: 'الإنجليزي', priority: 2 },
  { id: 140, name: 'La Liga', nameAr: 'الدوري الإسباني', shortName: 'La Liga', shortNameAr: 'الإسباني', priority: 3 },
  { id: 3, name: 'Europa League', nameAr: 'الدوري الأوروبي', shortName: 'UEL', shortNameAr: 'الأوروبي', priority: 4 },
  { id: 135, name: 'Serie A', nameAr: 'الدوري الإيطالي', shortName: 'Serie A', shortNameAr: 'الإيطالي', priority: 5 },
  { id: 78, name: 'Bundesliga', nameAr: 'الدوري الألماني', shortName: 'BuLi', shortNameAr: 'الألماني', priority: 6 },
  { id: 61, name: 'Ligue 1', nameAr: 'الدوري الفرنسي', shortName: 'Ligue 1', shortNameAr: 'الفرنسي', priority: 7 },
  // Saudi Pro League (huge for Arab audience)
  { id: 307, name: 'Saudi Pro League', nameAr: 'الدوري السعودي', shortName: 'SPL', shortNameAr: 'السعودي', priority: 8 },
  // Egyptian Premier League
  { id: 233, name: 'Egyptian Premier League', nameAr: 'الدوري المصري', shortName: 'EPL-EG', shortNameAr: 'المصري', priority: 9 },
  // Qatar Stars League
  { id: 305, name: 'Qatar Stars League', nameAr: 'دوري نجوم قطر', shortName: 'QSL', shortNameAr: 'القطري', priority: 10 },
  // UAE Pro League
  { id: 310, name: 'UAE Pro League', nameAr: 'الدوري الإماراتي', shortName: 'UAEPL', shortNameAr: 'الإماراتي', priority: 11 },
  // Moroccan Botola Pro
  { id: 200, name: 'Botola Pro', nameAr: 'البطولة المغربية', shortName: 'Botola', shortNameAr: 'المغربي', priority: 12 },
  // CAF Champions League
  { id: 12, name: 'CAF Champions League', nameAr: 'دوري أبطال أفريقيا', shortName: 'CAFCL', shortNameAr: 'أبطال أفريقيا', priority: 13 },
  // World Cup
  { id: 1, name: 'World Cup', nameAr: 'كأس العالم', shortName: 'WC', shortNameAr: 'كأس العالم', priority: 14 },
  // AFCON
  { id: 6, name: 'Africa Cup of Nations', nameAr: 'كأس أمم أفريقيا', shortName: 'AFCON', shortNameAr: 'أمم أفريقيا', priority: 15 },
  // Arab Cup
  { id: 536, name: 'FIFA Arab Cup', nameAr: 'كأس العرب', shortName: 'ArabCup', shortNameAr: 'كأس العرب', priority: 16 },
  // Iraqi Stars League
  { id: 282, name: 'Iraqi Premier League', nameAr: 'الدوري العراقي', shortName: 'IQL', shortNameAr: 'العراقي', priority: 17 },
  // Tunisian Ligue 1
  { id: 202, name: 'Tunisian Ligue 1', nameAr: 'الدوري التونسي', shortName: 'TUN', shortNameAr: 'التونسي', priority: 18 },
  // Algerian Ligue 1
  { id: 186, name: 'Algerian Ligue 1', nameAr: 'الدوري الجزائري', shortName: 'ALG', shortNameAr: 'الجزائري', priority: 19 },
  // Kuwaiti Premier League
  { id: 292, name: 'Kuwaiti Premier League', nameAr: 'الدوري الكويتي', shortName: 'KPL', shortNameAr: 'الكويتي', priority: 20 },
];

const leagueIds = PRIORITY_LEAGUES.map(l => l.id);

export interface ApiFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
  events?: {
    time: { elapsed: number; extra: number | null };
    team: { id: number; name: string; logo: string };
    player: { id: number; name: string };
    assist: { id: number | null; name: string | null };
    type: string;
    detail: string;
    comments: string | null;
  }[];
}

export interface ProcessedMatch {
  id: string;
  fixtureId: number;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    logo: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    logo: string;
  };
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'UPCOMING' | 'FT' | 'HT';
  statusShort: string;
  minute: number | null;
  competition: string;
  competitionAr: string;
  competitionId: number;
  leagueLogo: string;
  startTime: string;
  date: string;
  timestamp: number;
  events: ProcessedEvent[];
  hasStream: boolean;
}

export interface ProcessedEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'var';
  player: string;
  assist: string | null;
  team: 'home' | 'away';
  detail: string;
}

function getShortName(name: string): string {
  if (name.length <= 3) return name.toUpperCase();
  // Common abbreviations
  const words = name.split(' ');
  if (words.length >= 2) {
    if (words[0].length <= 3) return words[0].toUpperCase();
    return name.substring(0, 3).toUpperCase();
  }
  return name.substring(0, 3).toUpperCase();
}

function mapStatus(shortStatus: string): 'LIVE' | 'UPCOMING' | 'FT' | 'HT' {
  const liveStatuses = ['1H', '2H', 'ET', 'BT', 'P', 'LIVE'];
  const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];
  const htStatuses = ['HT'];

  if (liveStatuses.includes(shortStatus)) return 'LIVE';
  if (htStatuses.includes(shortStatus)) return 'HT';
  if (finishedStatuses.includes(shortStatus)) return 'FT';
  return 'UPCOMING';
}

function mapEventType(type: string, detail: string): 'goal' | 'yellow' | 'red' | 'substitution' | 'var' {
  if (type === 'Goal') return 'goal';
  if (type === 'Card' && detail.includes('Yellow')) return 'yellow';
  if (type === 'Card' && detail.includes('Red')) return 'red';
  if (type === 'subst') return 'substitution';
  if (type === 'Var') return 'var';
  return 'yellow';
}

function formatMatchTime(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function formatMatchDate(dateStr: string, lang: 'ar' | 'en'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return lang === 'ar' ? 'اليوم' : 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return lang === 'ar' ? 'غداً' : 'Tomorrow';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return lang === 'ar' ? 'أمس' : 'Yesterday';
  }

  const dayNames = lang === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = lang === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
}

function getLeagueInfo(leagueId: number) {
  return PRIORITY_LEAGUES.find(l => l.id === leagueId);
}

function processFixture(fixture: ApiFixture, lang: 'ar' | 'en'): ProcessedMatch {
  const leagueInfo = getLeagueInfo(fixture.league.id);

  const events: ProcessedEvent[] = (fixture.events || []).map(e => ({
    minute: e.time.elapsed,
    type: mapEventType(e.type, e.detail),
    player: e.player.name,
    assist: e.assist?.name || null,
    team: e.team.id === fixture.teams.home.id ? 'home' : 'away',
    detail: e.detail,
  }));

  const status = mapStatus(fixture.fixture.status.short);

  return {
    id: String(fixture.fixture.id),
    fixtureId: fixture.fixture.id,
    homeTeam: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      shortName: getShortName(fixture.teams.home.name),
      logo: fixture.teams.home.logo,
    },
    awayTeam: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      shortName: getShortName(fixture.teams.away.name),
      logo: fixture.teams.away.logo,
    },
    homeScore: fixture.goals.home ?? 0,
    awayScore: fixture.goals.away ?? 0,
    status,
    statusShort: fixture.fixture.status.short,
    minute: fixture.fixture.status.elapsed,
    competition: leagueInfo ? leagueInfo.name : fixture.league.name,
    competitionAr: leagueInfo ? leagueInfo.nameAr : fixture.league.name,
    competitionId: fixture.league.id,
    leagueLogo: fixture.league.logo,
    startTime: formatMatchTime(fixture.fixture.date),
    date: formatMatchDate(fixture.fixture.date, lang),
    timestamp: fixture.fixture.timestamp,
    events,
    hasStream: status === 'LIVE' || status === 'HT',
  };
}

async function apiFetch(endpoint: string): Promise<any> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Fetch live matches across all priority leagues
export async function fetchLiveMatches(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const data = await apiFetch('/fixtures?live=all');
    if (!data.response) return [];

    const matches: ProcessedMatch[] = data.response
      .filter((f: ApiFixture) => leagueIds.includes(f.league.id))
      .map((f: ApiFixture) => processFixture(f, lang));

    // Sort by priority (Arab-relevant leagues first)
    return matches.sort((a, b) => {
      const aP = PRIORITY_LEAGUES.find(l => l.id === a.competitionId)?.priority ?? 99;
      const bP = PRIORITY_LEAGUES.find(l => l.id === b.competitionId)?.priority ?? 99;
      return aP - bP;
    });
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

// Fetch today's fixtures
export async function fetchTodayFixtures(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Fetch from multiple priority leagues
    const topLeagueIds = PRIORITY_LEAGUES.slice(0, 12).map(l => l.id);

    const promises = topLeagueIds.map(lid =>
      apiFetch(`/fixtures?league=${lid}&season=2024&date=${today}`).catch(() => ({ response: [] }))
    );

    const results = await Promise.all(promises);
    const allFixtures: ApiFixture[] = [];
    results.forEach(r => {
      if (r.response && Array.isArray(r.response)) {
        allFixtures.push(...r.response);
      }
    });

    const matches = allFixtures.map(f => processFixture(f, lang));

    // Sort: live first, then by priority
    return matches.sort((a, b) => {
      const statusOrder = { LIVE: 0, HT: 1, UPCOMING: 2, FT: 3 };
      const sA = statusOrder[a.status] ?? 4;
      const sB = statusOrder[b.status] ?? 4;
      if (sA !== sB) return sA - sB;
      const aP = PRIORITY_LEAGUES.find(l => l.id === a.competitionId)?.priority ?? 99;
      const bP = PRIORITY_LEAGUES.find(l => l.id === b.competitionId)?.priority ?? 99;
      return aP - bP;
    });
  } catch (error) {
    console.error('Error fetching today fixtures:', error);
    return [];
  }
}

// Fetch upcoming fixtures for next days
export async function fetchUpcomingFixtures(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    // Fetch from top leagues for next 2 days
    const topLeagueIds = PRIORITY_LEAGUES.slice(0, 8).map(l => l.id);

    const promises: Promise<any>[] = [];
    topLeagueIds.forEach(lid => {
      promises.push(
        apiFetch(`/fixtures?league=${lid}&season=2024&date=${tomorrowStr}`).catch(() => ({ response: [] }))
      );
      promises.push(
        apiFetch(`/fixtures?league=${lid}&season=2024&date=${dayAfterStr}`).catch(() => ({ response: [] }))
      );
    });

    const results = await Promise.all(promises);
    const allFixtures: ApiFixture[] = [];
    results.forEach(r => {
      if (r.response && Array.isArray(r.response)) {
        allFixtures.push(...r.response);
      }
    });

    return allFixtures
      .map(f => processFixture(f, lang))
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    return [];
  }
}

// Fetch finished matches from yesterday
export async function fetchFinishedMatches(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const topLeagueIds = PRIORITY_LEAGUES.slice(0, 8).map(l => l.id);

    const promises = topLeagueIds.map(lid =>
      apiFetch(`/fixtures?league=${lid}&season=2024&date=${yesterdayStr}&status=FT-AET-PEN`).catch(() => ({ response: [] }))
    );

    const results = await Promise.all(promises);
    const allFixtures: ApiFixture[] = [];
    results.forEach(r => {
      if (r.response && Array.isArray(r.response)) {
        allFixtures.push(...r.response);
      }
    });

    return allFixtures
      .map(f => processFixture(f, lang))
      .sort((a, b) => {
        const aP = PRIORITY_LEAGUES.find(l => l.id === a.competitionId)?.priority ?? 99;
        const bP = PRIORITY_LEAGUES.find(l => l.id === b.competitionId)?.priority ?? 99;
        return aP - bP;
      });
  } catch (error) {
    console.error('Error fetching finished matches:', error);
    return [];
  }
}

// Fetch match events/details
export async function fetchMatchEvents(fixtureId: number, lang: 'ar' | 'en' = 'ar'): Promise<ProcessedEvent[]> {
  try {
    const data = await apiFetch(`/fixtures/events?fixture=${fixtureId}`);
    if (!data.response) return [];

    return data.response.map((e: any) => ({
      minute: e.time.elapsed,
      type: mapEventType(e.type, e.detail),
      player: e.player.name,
      assist: e.assist?.name || null,
      team: 'home', // Will be resolved with team IDs
      detail: e.detail,
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Fetch lineups
export async function fetchLineups(fixtureId: number): Promise<any> {
  try {
    const data = await apiFetch(`/fixtures/lineups?fixture=${fixtureId}`);
    return data.response || [];
  } catch (error) {
    console.error('Error fetching lineups:', error);
    return [];
  }
}

// Fetch match statistics
export async function fetchStatistics(fixtureId: number): Promise<any> {
  try {
    const data = await apiFetch(`/fixtures/statistics?fixture=${fixtureId}`);
    return data.response || [];
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return [];
  }
}

export function formatViewers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
