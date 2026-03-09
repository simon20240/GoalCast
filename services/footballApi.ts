import {
  getCache, setCache, getCacheFallback,
  isTodayDataCached, markDailyFetchComplete,
  shouldRefreshLive, markLiveRefresh,
  clearAllCache, CACHE_KEYS,
} from './cacheService';

const API_KEY = '4dacc53e6232827f801107853303d82a';
const BASE_URL = 'https://v3.football.api-sports.io';

// League IDs prioritized for Arab/Middle East audience
export const PRIORITY_LEAGUES = [
  { id: 2, name: 'Champions League', nameAr: 'دوري أبطال أوروبا', shortName: 'UCL', shortNameAr: 'دوري الأبطال', priority: 1 },
  { id: 39, name: 'Premier League', nameAr: 'الدوري الإنجليزي', shortName: 'EPL', shortNameAr: 'الإنجليزي', priority: 2 },
  { id: 140, name: 'La Liga', nameAr: 'الدوري الإسباني', shortName: 'La Liga', shortNameAr: 'الإسباني', priority: 3 },
  { id: 3, name: 'Europa League', nameAr: 'الدوري الأوروبي', shortName: 'UEL', shortNameAr: 'الأوروبي', priority: 4 },
  { id: 135, name: 'Serie A', nameAr: 'الدوري الإيطالي', shortName: 'Serie A', shortNameAr: 'الإيطالي', priority: 5 },
  { id: 78, name: 'Bundesliga', nameAr: 'الدوري الألماني', shortName: 'BuLi', shortNameAr: 'الألماني', priority: 6 },
  { id: 61, name: 'Ligue 1', nameAr: 'الدوري الفرنسي', shortName: 'Ligue 1', shortNameAr: 'الفرنسي', priority: 7 },
  { id: 307, name: 'Saudi Pro League', nameAr: 'الدوري السعودي', shortName: 'SPL', shortNameAr: 'السعودي', priority: 8 },
  { id: 233, name: 'Egyptian Premier League', nameAr: 'الدوري المصري', shortName: 'EPL-EG', shortNameAr: 'المصري', priority: 9 },
  { id: 305, name: 'Qatar Stars League', nameAr: 'دوري نجوم قطر', shortName: 'QSL', shortNameAr: 'القطري', priority: 10 },
  { id: 310, name: 'UAE Pro League', nameAr: 'الدوري الإماراتي', shortName: 'UAEPL', shortNameAr: 'الإماراتي', priority: 11 },
  { id: 200, name: 'Botola Pro', nameAr: 'البطولة المغربية', shortName: 'Botola', shortNameAr: 'المغربي', priority: 12 },
  { id: 12, name: 'CAF Champions League', nameAr: 'دوري أبطال أفريقيا', shortName: 'CAFCL', shortNameAr: 'أبطال أفريقيا', priority: 13 },
  { id: 1, name: 'World Cup', nameAr: 'كأس العالم', shortName: 'WC', shortNameAr: 'كأس العالم', priority: 14 },
  { id: 6, name: 'Africa Cup of Nations', nameAr: 'كأس أمم أفريقيا', shortName: 'AFCON', shortNameAr: 'أمم أفريقيا', priority: 15 },
  { id: 536, name: 'FIFA Arab Cup', nameAr: 'كأس العرب', shortName: 'ArabCup', shortNameAr: 'كأس العرب', priority: 16 },
  { id: 282, name: 'Iraqi Premier League', nameAr: 'الدوري العراقي', shortName: 'IQL', shortNameAr: 'العراقي', priority: 17 },
  { id: 202, name: 'Tunisian Ligue 1', nameAr: 'الدوري التونسي', shortName: 'TUN', shortNameAr: 'التونسي', priority: 18 },
  { id: 186, name: 'Algerian Ligue 1', nameAr: 'الدوري الجزائري', shortName: 'ALG', shortNameAr: 'الجزائري', priority: 19 },
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
    status: { long: string; short: string; elapsed: number | null };
  };
  league: {
    id: number; name: string; country: string; logo: string;
    flag: string | null; season: number; round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
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
    type: string; detail: string; comments: string | null;
  }[];
}

export interface ProcessedMatch {
  id: string;
  fixtureId: number;
  homeTeam: { id: number; name: string; shortName: string; logo: string };
  awayTeam: { id: number; name: string; shortName: string; logo: string };
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
  if (liveStatuses.includes(shortStatus)) return 'LIVE';
  if (['HT'].includes(shortStatus)) return 'HT';
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
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function formatMatchDate(dateStr: string, lang: 'ar' | 'en'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return lang === 'ar' ? 'اليوم' : 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return lang === 'ar' ? 'غداً' : 'Tomorrow';
  if (date.toDateString() === yesterday.toDateString()) return lang === 'ar' ? 'أمس' : 'Yesterday';

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
    homeTeam: { id: fixture.teams.home.id, name: fixture.teams.home.name, shortName: getShortName(fixture.teams.home.name), logo: fixture.teams.home.logo },
    awayTeam: { id: fixture.teams.away.id, name: fixture.teams.away.name, shortName: getShortName(fixture.teams.away.name), logo: fixture.teams.away.logo },
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'x-apisports-key': API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ==========================================
// FALLBACK MOCK DATA (when API fails / CORS)
// ==========================================

function generateFallbackData(): { live: ProcessedMatch[]; upcoming: ProcessedMatch[]; finished: ProcessedMatch[] } {
  const now = Date.now();

  const makeMatch = (
    id: string, homeN: string, awayN: string, hScore: number, aScore: number,
    status: 'LIVE' | 'UPCOMING' | 'FT' | 'HT', minute: number | null,
    leagueId: number, startTime: string, dateLabel: string, events: ProcessedEvent[]
  ): ProcessedMatch => {
    const league = getLeagueInfo(leagueId);
    return {
      id, fixtureId: parseInt(id),
      homeTeam: { id: parseInt(id) * 10, name: homeN, shortName: getShortName(homeN), logo: `https://media.api-sports.io/football/teams/${parseInt(id) * 10}.png` },
      awayTeam: { id: parseInt(id) * 10 + 1, name: awayN, shortName: getShortName(awayN), logo: `https://media.api-sports.io/football/teams/${parseInt(id) * 10 + 1}.png` },
      homeScore: hScore, awayScore: aScore,
      status, statusShort: status === 'LIVE' ? '2H' : status === 'HT' ? 'HT' : status === 'FT' ? 'FT' : 'NS',
      minute, competition: league?.name || 'League', competitionAr: league?.nameAr || 'الدوري',
      competitionId: leagueId, leagueLogo: `https://media.api-sports.io/football/leagues/${leagueId}.png`,
      startTime, date: dateLabel, timestamp: Math.floor(now / 1000),
      events, hasStream: status === 'LIVE' || status === 'HT',
    };
  };

  const live: ProcessedMatch[] = [
    makeMatch('9001', 'Real Madrid', 'Manchester City', 2, 1, 'LIVE', 67, 2, '21:00', 'اليوم', [
      { minute: 12, type: 'goal', player: 'Vinicius Jr.', assist: 'Bellingham', team: 'home', detail: 'Normal Goal' },
      { minute: 34, type: 'goal', player: 'Haaland', assist: 'De Bruyne', team: 'away', detail: 'Normal Goal' },
      { minute: 58, type: 'goal', player: 'Bellingham', assist: 'Vinicius Jr.', team: 'home', detail: 'Normal Goal' },
      { minute: 45, type: 'yellow', player: 'Rodri', assist: null, team: 'away', detail: 'Yellow Card' },
    ]),
    makeMatch('9002', 'Liverpool', 'Barcelona', 3, 3, 'LIVE', 82, 2, '21:00', 'اليوم', [
      { minute: 5, type: 'goal', player: 'Salah', assist: 'Alexander-Arnold', team: 'home', detail: 'Normal Goal' },
      { minute: 22, type: 'goal', player: 'Lewandowski', assist: 'Pedri', team: 'away', detail: 'Normal Goal' },
      { minute: 38, type: 'goal', player: 'Yamal', assist: null, team: 'away', detail: 'Normal Goal' },
      { minute: 51, type: 'goal', player: 'Nunez', assist: 'Salah', team: 'home', detail: 'Normal Goal' },
      { minute: 64, type: 'goal', player: 'Pedri', assist: 'Yamal', team: 'away', detail: 'Normal Goal' },
      { minute: 77, type: 'goal', player: 'Salah', assist: null, team: 'home', detail: 'Normal Goal' },
    ]),
    makeMatch('9003', 'Bayern Munich', 'PSG', 1, 0, 'HT', 45, 2, '21:00', 'اليوم', [
      { minute: 29, type: 'goal', player: 'Muller', assist: 'Sane', team: 'home', detail: 'Normal Goal' },
    ]),
    makeMatch('9004', 'Arsenal', 'Tottenham', 1, 0, 'LIVE', 23, 39, '17:30', 'اليوم', [
      { minute: 15, type: 'goal', player: 'Saka', assist: 'Odegaard', team: 'home', detail: 'Normal Goal' },
    ]),
    makeMatch('9005', 'Al Hilal', 'Al Nassr', 0, 0, 'LIVE', 8, 307, '20:00', 'اليوم', []),
    makeMatch('9006', 'Al Ahly', 'Zamalek', 1, 1, 'LIVE', 55, 233, '19:00', 'اليوم', [
      { minute: 20, type: 'goal', player: 'Afsha', assist: null, team: 'home', detail: 'Normal Goal' },
      { minute: 40, type: 'goal', player: 'Zizo', assist: null, team: 'away', detail: 'Normal Goal' },
    ]),
  ];

  const upcoming: ProcessedMatch[] = [
    makeMatch('9101', 'Manchester United', 'Chelsea', 0, 0, 'UPCOMING', null, 39, '16:00', 'غداً', []),
    makeMatch('9102', 'Barcelona', 'Atletico Madrid', 0, 0, 'UPCOMING', null, 140, '21:00', 'غداً', []),
    makeMatch('9103', 'Borussia Dortmund', 'Bayern Munich', 0, 0, 'UPCOMING', null, 78, '18:30', 'غداً', []),
    makeMatch('9104', 'Napoli', 'Juventus', 0, 0, 'UPCOMING', null, 135, '20:45', 'غداً', []),
    makeMatch('9105', 'Al Ittihad', 'Al Shabab', 0, 0, 'UPCOMING', null, 307, '20:00', 'غداً', []),
    makeMatch('9106', 'Wydad', 'Raja', 0, 0, 'UPCOMING', null, 200, '19:00', 'غداً', []),
    makeMatch('9107', 'PSG', 'Real Madrid', 0, 0, 'UPCOMING', null, 2, '21:00', 'الأربعاء', []),
    makeMatch('9108', 'Manchester City', 'Liverpool', 0, 0, 'UPCOMING', null, 39, '17:30', 'الأربعاء', []),
  ];

  const finished: ProcessedMatch[] = [
    makeMatch('9201', 'Arsenal', 'Manchester City', 2, 2, 'FT', 90, 39, '17:30', 'أمس', [
      { minute: 10, type: 'goal', player: 'Saka', assist: null, team: 'home', detail: 'Normal Goal' },
      { minute: 34, type: 'goal', player: 'Haaland', assist: 'De Bruyne', team: 'away', detail: 'Normal Goal' },
      { minute: 56, type: 'goal', player: 'Odegaard', assist: 'Saka', team: 'home', detail: 'Normal Goal' },
      { minute: 89, type: 'goal', player: 'De Bruyne', assist: null, team: 'away', detail: 'Normal Goal' },
    ]),
    makeMatch('9202', 'Juventus', 'Inter Milan', 1, 3, 'FT', 90, 135, '20:45', 'أمس', [
      { minute: 22, type: 'goal', player: 'Lautaro', assist: null, team: 'away', detail: 'Normal Goal' },
      { minute: 44, type: 'goal', player: 'Vlahovic', assist: null, team: 'home', detail: 'Normal Goal' },
      { minute: 67, type: 'goal', player: 'Barella', assist: 'Lautaro', team: 'away', detail: 'Normal Goal' },
      { minute: 80, type: 'goal', player: 'Thuram', assist: null, team: 'away', detail: 'Normal Goal' },
    ]),
    makeMatch('9203', 'Real Madrid', 'Atletico Madrid', 3, 1, 'FT', 90, 140, '21:00', 'أمس', [
      { minute: 8, type: 'goal', player: 'Vinicius Jr.', assist: null, team: 'home', detail: 'Normal Goal' },
      { minute: 30, type: 'goal', player: 'Griezmann', assist: null, team: 'away', detail: 'Normal Goal' },
      { minute: 62, type: 'goal', player: 'Bellingham', assist: 'Vinicius Jr.', team: 'home', detail: 'Normal Goal' },
      { minute: 75, type: 'goal', player: 'Mbappe', assist: 'Bellingham', team: 'home', detail: 'Normal Goal' },
    ]),
    makeMatch('9204', 'Pyramids', 'Al Masry', 2, 0, 'FT', 90, 233, '18:00', 'أمس', [
      { minute: 33, type: 'goal', player: 'Dieng', assist: null, team: 'home', detail: 'Normal Goal' },
      { minute: 71, type: 'goal', player: 'Fathy', assist: null, team: 'home', detail: 'Normal Goal' },
    ]),
    makeMatch('9205', 'Al Hilal', 'Al Ahli', 2, 1, 'FT', 90, 307, '20:00', 'أمس', [
      { minute: 15, type: 'goal', player: 'Mitrovic', assist: null, team: 'home', detail: 'Normal Goal' },
      { minute: 55, type: 'goal', player: 'Mahrez', assist: null, team: 'away', detail: 'Normal Goal' },
      { minute: 88, type: 'goal', player: 'Neymar', assist: 'Mitrovic', team: 'home', detail: 'Normal Goal' },
    ]),
  ];

  return { live, upcoming, finished };
}

// ==========================================
// API FETCH FUNCTIONS WITH FALLBACK
// ==========================================

let _apiFailed = false;

export async function fetchLiveMatches(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const needsRefresh = await shouldRefreshLive(120000);
    if (!needsRefresh) {
      const cached = await getCache<ProcessedMatch[]>(CACHE_KEYS.LIVE_MATCHES);
      if (cached) return cached;
    }

    if (_apiFailed) {
      const fallback = generateFallbackData();
      await setCache(CACHE_KEYS.LIVE_MATCHES, fallback.live);
      await markLiveRefresh();
      return fallback.live;
    }

    const data = await apiFetch('/fixtures?live=all');
    if (!data.response) return [];

    const matches: ProcessedMatch[] = data.response
      .filter((f: ApiFixture) => leagueIds.includes(f.league.id))
      .map((f: ApiFixture) => processFixture(f, lang));

    const sorted = matches.sort((a, b) => {
      const aP = PRIORITY_LEAGUES.find(l => l.id === a.competitionId)?.priority ?? 99;
      const bP = PRIORITY_LEAGUES.find(l => l.id === b.competitionId)?.priority ?? 99;
      return aP - bP;
    });

    await setCache(CACHE_KEYS.LIVE_MATCHES, sorted);
    await markLiveRefresh();
    return sorted;
  } catch (error) {
    console.warn('Live matches API failed, using fallback:', error);
    _apiFailed = true;
    const cached = await getCacheFallback<ProcessedMatch[]>(CACHE_KEYS.LIVE_MATCHES);
    if (cached && cached.length > 0) return cached;
    const fallback = generateFallbackData();
    await setCache(CACHE_KEYS.LIVE_MATCHES, fallback.live);
    await markLiveRefresh();
    return fallback.live;
  }
}

export async function fetchTodayFixtures(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const cached = await getCache<ProcessedMatch[]>(CACHE_KEYS.TODAY_FIXTURES);
    if (cached) return cached;

    if (_apiFailed) {
      const fallback = generateFallbackData();
      const all = [...fallback.live, ...fallback.upcoming.slice(0, 4), ...fallback.finished.slice(0, 3)];
      await setCache(CACHE_KEYS.TODAY_FIXTURES, all);
      return all;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const season = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
    const topLeagueIds = PRIORITY_LEAGUES.slice(0, 12).map(l => l.id);

    const promises = topLeagueIds.map(lid =>
      apiFetch(`/fixtures?league=${lid}&season=${season}&date=${today}`).catch(() => ({ response: [] }))
    );

    const results = await Promise.all(promises);
    const allFixtures: ApiFixture[] = [];
    results.forEach(r => {
      if (r.response && Array.isArray(r.response)) allFixtures.push(...r.response);
    });

    const matches = allFixtures.map(f => processFixture(f, lang));
    const sorted = matches.sort((a, b) => {
      const statusOrder = { LIVE: 0, HT: 1, UPCOMING: 2, FT: 3 };
      const sA = statusOrder[a.status] ?? 4;
      const sB = statusOrder[b.status] ?? 4;
      if (sA !== sB) return sA - sB;
      const aP = PRIORITY_LEAGUES.find(l => l.id === a.competitionId)?.priority ?? 99;
      const bP = PRIORITY_LEAGUES.find(l => l.id === b.competitionId)?.priority ?? 99;
      return aP - bP;
    });

    await setCache(CACHE_KEYS.TODAY_FIXTURES, sorted);
    return sorted;
  } catch (error) {
    console.warn('Today fixtures API failed, using fallback:', error);
    _apiFailed = true;
    const cached = await getCacheFallback<ProcessedMatch[]>(CACHE_KEYS.TODAY_FIXTURES);
    if (cached && cached.length > 0) return cached;
    const fallback = generateFallbackData();
    const all = [...fallback.live, ...fallback.upcoming.slice(0, 4), ...fallback.finished.slice(0, 3)];
    await setCache(CACHE_KEYS.TODAY_FIXTURES, all);
    return all;
  }
}

export async function fetchUpcomingFixtures(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const cached = await getCache<ProcessedMatch[]>(CACHE_KEYS.UPCOMING_FIXTURES);
    if (cached) return cached;

    if (_apiFailed) {
      const fallback = generateFallbackData();
      await setCache(CACHE_KEYS.UPCOMING_FIXTURES, fallback.upcoming);
      return fallback.upcoming;
    }

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const season = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
    const topLeagueIds = PRIORITY_LEAGUES.slice(0, 8).map(l => l.id);

    const promises: Promise<any>[] = [];
    topLeagueIds.forEach(lid => {
      promises.push(apiFetch(`/fixtures?league=${lid}&season=${season}&date=${tomorrowStr}`).catch(() => ({ response: [] })));
      promises.push(apiFetch(`/fixtures?league=${lid}&season=${season}&date=${dayAfterStr}`).catch(() => ({ response: [] })));
    });

    const results = await Promise.all(promises);
    const allFixtures: ApiFixture[] = [];
    results.forEach(r => {
      if (r.response && Array.isArray(r.response)) allFixtures.push(...r.response);
    });

    const sorted = allFixtures.map(f => processFixture(f, lang)).sort((a, b) => a.timestamp - b.timestamp);
    await setCache(CACHE_KEYS.UPCOMING_FIXTURES, sorted);
    return sorted;
  } catch (error) {
    console.warn('Upcoming fixtures API failed, using fallback:', error);
    _apiFailed = true;
    const cached = await getCacheFallback<ProcessedMatch[]>(CACHE_KEYS.UPCOMING_FIXTURES);
    if (cached && cached.length > 0) return cached;
    const fallback = generateFallbackData();
    await setCache(CACHE_KEYS.UPCOMING_FIXTURES, fallback.upcoming);
    return fallback.upcoming;
  }
}

export async function fetchFinishedMatches(lang: 'ar' | 'en' = 'ar'): Promise<ProcessedMatch[]> {
  try {
    const cached = await getCache<ProcessedMatch[]>(CACHE_KEYS.FINISHED_MATCHES);
    if (cached) return cached;

    if (_apiFailed) {
      const fallback = generateFallbackData();
      await setCache(CACHE_KEYS.FINISHED_MATCHES, fallback.finished);
      return fallback.finished;
    }

    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const season = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
    const topLeagueIds = PRIORITY_LEAGUES.slice(0, 8).map(l => l.id);

    const promises = topLeagueIds.map(lid =>
      apiFetch(`/fixtures?league=${lid}&season=${season}&date=${yesterdayStr}&status=FT-AET-PEN`).catch(() => ({ response: [] }))
    );

    const results = await Promise.all(promises);
    const allFixtures: ApiFixture[] = [];
    results.forEach(r => {
      if (r.response && Array.isArray(r.response)) allFixtures.push(...r.response);
    });

    const sorted = allFixtures.map(f => processFixture(f, lang)).sort((a, b) => {
      const aP = PRIORITY_LEAGUES.find(l => l.id === a.competitionId)?.priority ?? 99;
      const bP = PRIORITY_LEAGUES.find(l => l.id === b.competitionId)?.priority ?? 99;
      return aP - bP;
    });

    await setCache(CACHE_KEYS.FINISHED_MATCHES, sorted);
    return sorted;
  } catch (error) {
    console.warn('Finished matches API failed, using fallback:', error);
    _apiFailed = true;
    const cached = await getCacheFallback<ProcessedMatch[]>(CACHE_KEYS.FINISHED_MATCHES);
    if (cached && cached.length > 0) return cached;
    const fallback = generateFallbackData();
    await setCache(CACHE_KEYS.FINISHED_MATCHES, fallback.finished);
    return fallback.finished;
  }
}

export async function fetchMatchEvents(fixtureId: number, lang: 'ar' | 'en' = 'ar'): Promise<ProcessedEvent[]> {
  try {
    const data = await apiFetch(`/fixtures/events?fixture=${fixtureId}`);
    if (!data.response) return [];
    return data.response.map((e: any) => ({
      minute: e.time.elapsed,
      type: mapEventType(e.type, e.detail),
      player: e.player.name,
      assist: e.assist?.name || null,
      team: 'home',
      detail: e.detail,
    }));
  } catch { return []; }
}

export async function fetchLineups(fixtureId: number): Promise<any> {
  try {
    const data = await apiFetch(`/fixtures/lineups?fixture=${fixtureId}`);
    return data.response || [];
  } catch { return []; }
}

export async function fetchStatistics(fixtureId: number): Promise<any> {
  try {
    const data = await apiFetch(`/fixtures/statistics?fixture=${fixtureId}`);
    return data.response || [];
  } catch { return []; }
}

// Force reset API failed flag on manual refresh
export function resetApiStatus() {
  _apiFailed = false;
}

export { isTodayDataCached, markDailyFetchComplete, clearAllCache } from './cacheService';

export function formatViewers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
