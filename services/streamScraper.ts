/**
 * Stream Scraper Bot for aflam4you.net
 * 
 * Scrapes the sports schedule page to find match listings with their
 * channel URLs, then matches them to API-Football data using fuzzy
 * team name matching in Arabic and English.
 * 
 * Runs on an interval (default 60s) to keep streams fresh and
 * remove broken links.
 */

const SCRAPER_BASE_URL = 'https://www.aflam4you.net';
const SPORTS_PAGE_URL = `${SCRAPER_BASE_URL}/browse-kora_live-tv-live-videos-1-date.html`;

// ==========================================
// TEAM NAME DICTIONARY (Arabic → English)
// For fuzzy matching between aflam4you and API-Football
// ==========================================
const TEAM_NAME_MAP: Record<string, string[]> = {
  // English Premier League
  'manchester city': ['مانشستر سيتي', 'مان سيتي', 'السيتي'],
  'manchester united': ['مانشستر يونايتد', 'مان يونايتد', 'اليونايتد'],
  'arsenal': ['آرسنال', 'ارسنال'],
  'chelsea': ['تشيلسي', 'تشلسي'],
  'liverpool': ['ليفربول'],
  'tottenham': ['توتنهام', 'توتنهام هوتسبير'],
  'newcastle': ['نيوكاسل', 'نيوكاسل يونايتد'],
  'aston villa': ['أستون فيلا', 'استون فيلا'],
  'brighton': ['برايتون'],
  'west ham': ['وست هام', 'ويست هام'],
  'crystal palace': ['كريستال بالاس'],
  'nottingham': ['نوتنغهام', 'نوتنجهام فورست'],
  'fulham': ['فولهام'],
  'bournemouth': ['بورنموث'],
  'everton': ['إيفرتون', 'ايفرتون'],
  'wolverhampton': ['وولفرهامبتون', 'ولفز'],
  'brentford': ['برينتفورد'],
  'leicester': ['ليستر', 'ليستر سيتي'],
  'southampton': ['ساوثهامبتون', 'ساوثامبتون'],
  'ipswich': ['إيبسويتش', 'ايبسويتش'],

  // La Liga
  'real madrid': ['ريال مدريد'],
  'barcelona': ['برشلونة', 'بارشلونة'],
  'atletico madrid': ['أتلتيكو مدريد', 'اتلتيكو مدريد'],
  'athletic bilbao': ['أتلتيك بيلباو', 'اتلتيك بلباو'],
  'real sociedad': ['ريال سوسيداد'],
  'real betis': ['ريال بيتيس'],
  'villarreal': ['فياريال', 'فيلاريال'],
  'sevilla': ['إشبيلية', 'اشبيلية'],
  'valencia': ['فالنسيا'],
  'rayo vallecano': ['رايو فاليكانو', 'رايو فايكانو'],
  'osasuna': ['أوساسونا', 'اوساسونا'],
  'girona': ['جيرونا'],
  'mallorca': ['مايوركا'],
  'getafe': ['خيتافي'],
  'celta vigo': ['سيلتا فيغو'],
  'cadiz': ['قادس'],
  'granada': ['غرناطة'],

  // Serie A
  'inter': ['إنتر ميلان', 'انتر ميلان', 'إنتر'],
  'ac milan': ['ميلان', 'إيه سي ميلان'],
  'napoli': ['نابولي'],
  'juventus': ['يوفنتوس'],
  'roma': ['روما'],
  'lazio': ['لاتسيو'],
  'atalanta': ['أتالانتا', 'اتالانتا'],
  'fiorentina': ['فيورنتينا'],
  'bologna': ['بولونيا'],
  'torino': ['تورينو'],

  // Bundesliga
  'bayern munich': ['بايرن ميونخ', 'بايرن'],
  'borussia dortmund': ['بوروسيا دورتموند', 'دورتموند'],
  'rb leipzig': ['لايبزيغ', 'آر بي لايبزيغ'],
  'bayer leverkusen': ['باير ليفركوزن', 'ليفركوزن'],
  'eintracht frankfurt': ['فرانكفورت', 'آينتراخت فرانكفورت'],
  'stuttgart': ['شتوتغارت'],

  // Ligue 1
  'psg': ['باريس سان جيرمان', 'باريس'],
  'paris saint-germain': ['باريس سان جيرمان', 'باريس'],
  'marseille': ['مارسيليا', 'مارسيل'],
  'lyon': ['ليون'],
  'monaco': ['موناكو'],
  'lille': ['ليل'],
  'nice': ['نيس'],
  'lens': ['لانس'],

  // Saudi Pro League
  'al hilal': ['الهلال'],
  'al nassr': ['النصر'],
  'al ahli': ['الأهلي', 'الاهلي'],
  'al ittihad': ['الاتحاد'],
  'al shabab': ['الشباب'],
  'al taawoun': ['التعاون'],
  'al fateh': ['الفتح'],
  'al ettifaq': ['الاتفاق'],
  'al raed': ['الرائد'],
  'al khaleej': ['الخليج'],
  'al fayha': ['الفيحاء'],
  'al riyadh': ['الرياض'],
  'al hazem': ['الحزم'],
  'damac': ['ضمك'],

  // Egyptian Premier League
  'al ahly': ['الأهلي المصري', 'الاهلي'],
  'zamalek': ['الزمالك'],
  'pyramids': ['بيراميدز'],
  'al masry': ['المصري'],
  'ismaily': ['الاسماعيلي', 'الإسماعيلي'],
  'future fc': ['فيوتشر'],
  'al mokawloon': ['المقاولون'],
  'enppi': ['إنبي', 'انبي'],
  'ceramica cleopatra': ['سيراميكا كليوباترا'],
  'ghazl el mahalla': ['غزل المحلة'],
  'smouha': ['سموحة'],
  'pharco': ['فاركو'],

  // Qatari Stars League
  'al duhail': ['الدحيل'],
  'al sadd': ['السد'],
  'al rayyan': ['الريان'],
  'al gharafa': ['الغرافة'],
  'al arabi': ['العربي'],
  'al wakrah': ['الوكرة'],

  // UAE Pro League
  'al ain': ['العين'],
  'al wahda': ['الوحدة'],
  'shabab al ahli': ['شباب الأهلي'],
  'al jazira': ['الجزيرة'],
  'al sharjah': ['الشارقة'],

  // Moroccan Botola
  'wydad': ['الوداد', 'الوداد الرياضي'],
  'raja': ['الرجاء', 'رجاء'],
  'rs berkane': ['نهضة بركان'],
  'fus rabat': ['الفتح الرباطي'],
  'olympic safi': ['أولمبيك آسفي', 'اولمبيك اسفي'],

  // Tunisian Ligue 1
  'esperance': ['الترجي', 'الترجي التونسي'],
  'club africain': ['النادي الإفريقي', 'الإفريقي'],
  'cs sfaxien': ['النادي الصفاقسي', 'الصفاقسي'],
  'us monastir': ['الاتحاد المنستيري'],
  'etoile sahel': ['النجم الساحلي'],

  // Iraqi Premier League
  'al shorta': ['الشرطة'],
  'al quwa al jawiya': ['القوة الجوية'],
  'al zawraa': ['الزوراء'],

  // Other International
  'al najma': ['النجمة'],
  'al muharraq': ['المحرق'],
  'al qadisiyah': ['القادسية'],
  'al kuwait': ['الكويت'],
};

// Build reverse map: Arabic name → English team names
const ARABIC_TO_ENGLISH: Map<string, string[]> = new Map();
for (const [eng, arNames] of Object.entries(TEAM_NAME_MAP)) {
  for (const arName of arNames) {
    const normalized = normalizeArabic(arName);
    const existing = ARABIC_TO_ENGLISH.get(normalized) || [];
    existing.push(eng.toLowerCase());
    ARABIC_TO_ENGLISH.set(normalized, existing);
  }
}

// ==========================================
// TEXT NORMALIZATION UTILITIES
// ==========================================

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove diacritics
    .replace(/[أإآ]/g, 'ا')               // Normalize alef
    .replace(/ة/g, 'ه')                    // Normalize ta marbuta
    .replace(/ى/g, 'ي')                    // Normalize ya
    .replace(/ؤ/g, 'و')                    // Normalize waw hamza
    .replace(/ئ/g, 'ي')                    // Normalize ya hamza
    .trim()
    .toLowerCase();
}

function normalizeEnglish(text: string): string {
  return text
    .replace(/FC|SC|CF|AC|AS|SL|CD$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ==========================================
// SCRAPER TYPES
// ==========================================

export interface ScrapedStream {
  homeTeamAr: string;
  awayTeamAr: string;
  channelName: string;
  channelUrl: string;
  matchTime: string; // GMT time from the page
  thumbnailUrl?: string;
}

export interface MatchedStream {
  fixtureId: string;
  streams: StreamServer[];
  lastUpdated: number;
}

export interface StreamServer {
  id: string;
  name: string;
  url: string;
  channelName: string;
  quality: string;
  status: 'active' | 'checking' | 'dead';
  lastChecked: number;
}

// ==========================================
// CHANNEL DATABASE
// Sports channels from aflam4you.net
// ==========================================

const SPORTS_CHANNELS: Record<string, { name: string; nameAr: string; quality: string; urls: string[] }> = {
  'bein1': {
    name: 'beIN Sports 1 HD',
    nameAr: 'بي ان سبورت 1',
    quality: '1080p',
    urls: [
      `${SCRAPER_BASE_URL}/beinsports-1-koora-euro2024-euro2024_68.html`,
    ],
  },
  'bein2': {
    name: 'beIN Sports 2 HD',
    nameAr: 'بي ان سبورت 2',
    quality: '1080p',
    urls: [
      `${SCRAPER_BASE_URL}/bein-sport-2-koora-2023-bn2-euro2024_2.html`,
    ],
  },
  'bein3': {
    name: 'beIN Sports 3 HD',
    nameAr: 'بي ان سبورت 3',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/bein-sport-3-koora-euro2024_71.html`,
    ],
  },
  'beinmax1': {
    name: 'beIN Sports Max 1',
    nameAr: 'بي ان سبورت ماكس 1',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/bein-sport-max-1-koora-euro2024_179.html`,
    ],
  },
  'beinmax2': {
    name: 'beIN Sports Max 2',
    nameAr: 'بي ان سبورت ماكس 2',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/bein-sport-max-2-kora-euro2024_180.html`,
    ],
  },
  'ssc1': {
    name: 'SSC Sports 1',
    nameAr: 'الرياضية 1',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/ssc-sport-hd-1-tv-live-euro2024_503.html`,
    ],
  },
  'ssc2': {
    name: 'SSC Sports 2',
    nameAr: 'الرياضية 2',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/ssc-sport-2-tv-live-euro2024_504.html`,
    ],
  },
  'alkass1': {
    name: 'Al Kass 1',
    nameAr: 'الكأس 1',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/alkass-one-tv-euro2024_108.html`,
    ],
  },
  'alkass2': {
    name: 'Al Kass 2',
    nameAr: 'الكأس 2',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/alkass-two-tv-euro2024_109.html`,
    ],
  },
  'ontimesports1': {
    name: 'ON TIME Sports 1',
    nameAr: 'أون تايم سبورتس 1',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/on-sport-live-euro2024_145.html`,
    ],
  },
  'ontimesports2': {
    name: 'ON TIME Sports 2',
    nameAr: 'أون تايم سبورتس 2',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/ontimesports2-live-euro2024_176.html`,
    ],
  },
  'beinnews': {
    name: 'beIN Sports News',
    nameAr: 'بي ان سبورت الإخبارية',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/beinports-news-koora-euro2024_31.html`,
    ],
  },
  'mbcaction': {
    name: 'MBC Action',
    nameAr: 'ام بي سي اكشن',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/shahid-mbc-action-formula_ramdan-euro2024_500.html`,
    ],
  },
  'arryadia': {
    name: 'Arryadia TNT',
    nameAr: 'الرياضية TNT',
    quality: '720p',
    urls: [
      `${SCRAPER_BASE_URL}/arryadia-tnt-live-euro2024_501.html`,
    ],
  },
};

// ==========================================
// CORE SCRAPER FUNCTIONS
// ==========================================

/**
 * Fetches and parses the aflam4you sports schedule page.
 * Extracts match listings with home/away team names in Arabic,
 * match times, and channel page URLs.
 */
export async function scrapeMatchSchedule(): Promise<ScrapedStream[]> {
  try {
    const response = await fetch(SPORTS_PAGE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.warn('Scraper: Failed to fetch schedule page:', response.status);
      return [];
    }

    const html = await response.text();
    return parseScheduleHtml(html);
  } catch (error) {
    console.warn('Scraper: Network error:', error);
    return [];
  }
}

/**
 * Parses the schedule HTML from aflam4you.
 * The page structure shows match cards with:
 * - Team names in divs
 * - GMT time
 * - Link to channel page
 */
function parseScheduleHtml(html: string): ScrapedStream[] {
  const streams: ScrapedStream[] = [];

  // The site structure has match blocks within the schedule section.
  // Each match block contains: team names, time, and a link to the channel.
  
  // Pattern 1: Match blocks with two teams and time
  // The page shows matches like: "ريال مدريد ... 13:00 GMT ... رايو فاليكانو"
  // with links to channel pages
  
  // Extract match blocks - looking for patterns with team names and GMT times
  const matchBlockRegex = /<a[^>]*href="(https?:\/\/[^"]*aflam4you\.net\/[^"]*\.html)"[^>]*>[\s\S]*?<\/a>/gi;
  const blocks = html.match(matchBlockRegex) || [];

  for (const block of blocks) {
    // Extract URL
    const urlMatch = block.match(/href="(https?:\/\/[^"]*\.html)"/i);
    if (!urlMatch) continue;
    const url = urlMatch[1];

    // Skip non-sports pages
    if (url.includes('browse-') || url.includes('contact') || url.includes('index')) continue;

    // Extract time (GMT pattern)
    const timeMatch = block.match(/(\d{1,2}:\d{2})\s*GMT/i);
    
    // Extract text content for team names
    const textContent = block
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Skip if this looks like a TV channel listing rather than a match
    if (!timeMatch && !textContent.includes('بتوقيت')) continue;

    // Try to identify if this is a match (has team vs team pattern)
    const gmtTime = timeMatch ? timeMatch[1] : '';
    
    // Look for thumbnail
    const thumbMatch = block.match(/src="([^"]*(?:uploads|thumbs)[^"]*)"/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : undefined;

    // The schedule section shows match pairs. Parse team names from text.
    // Format is typically: "TeamA ... GMT time ... TeamB"
    if (gmtTime) {
      streams.push({
        homeTeamAr: textContent.split(gmtTime)[0]?.replace(/بتوقيت\s*غرينتش/g, '').replace(/\d{1,2}:\d{2}/g, '').trim() || '',
        awayTeamAr: '',
        channelName: extractChannelName(url),
        channelUrl: url,
        matchTime: gmtTime,
        thumbnailUrl: thumbnail,
      });
    }
  }

  // Also parse the structured schedule section differently
  // The page has pairs of divs: one for home team, one for away team
  const scheduleSection = html.match(/جدول البث[\s\S]*?(?=قنوات الآكثر|الاكثر متابعة|$)/i);
  if (scheduleSection) {
    const sectionHtml = scheduleSection[0];
    
    // Find all team name pairs between match time patterns
    // Structure: team1 name + GMT time + team2 name (in heading)
    const teamPairRegex = /([^<>]+?)بتوقيت\s*غرينتش\s*(\d{1,2}:\d{2})\s*GMT[\s\S]*?<h2[^>]*>\s*([^<]+?)\s*<\/h2>/gi;
    let pairMatch;
    
    while ((pairMatch = teamPairRegex.exec(sectionHtml)) !== null) {
      const homeTeam = pairMatch[1].replace(/<[^>]*>/g, '').trim();
      const time = pairMatch[2];
      const awayTeam = pairMatch[3].replace(/<[^>]*>/g, '').trim();

      if (homeTeam && awayTeam && time) {
        // Find the closest channel link
        const nearbyLinkMatch = sectionHtml.substring(
          Math.max(0, pairMatch.index - 500),
          pairMatch.index + pairMatch[0].length + 200
        ).match(/href="(https?:\/\/[^"]*aflam4you\.net\/[^"]*\.html)"/i);

        streams.push({
          homeTeamAr: homeTeam,
          awayTeamAr: awayTeam,
          channelName: nearbyLinkMatch ? extractChannelName(nearbyLinkMatch[1]) : 'beIN Sports',
          channelUrl: nearbyLinkMatch ? nearbyLinkMatch[1] : '',
          matchTime: time,
        });
      }
    }
  }

  // Deduplicate by team names
  const seen = new Set<string>();
  return streams.filter(s => {
    const key = `${normalizeArabic(s.homeTeamAr)}-${normalizeArabic(s.awayTeamAr)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return s.homeTeamAr.length > 1;
  });
}

/**
 * Extract channel name from URL
 */
function extractChannelName(url: string): string {
  // Check against known channels
  for (const [, channel] of Object.entries(SPORTS_CHANNELS)) {
    if (channel.urls.some(u => url.includes(u.split('/').pop()?.split('.')[0] || '__nomatch__'))) {
      return channel.nameAr;
    }
  }
  
  // Parse from URL slug
  const slug = url.split('/').pop()?.split('.')[0]?.replace(/-/g, ' ') || '';
  if (slug.includes('beinsports') || slug.includes('bein')) return 'beIN Sports';
  if (slug.includes('ssc') || slug.includes('sport')) return 'SSC Sports';
  if (slug.includes('alkass')) return 'Al Kass';
  if (slug.includes('on')) return 'ON TIME Sports';
  return slug.substring(0, 20);
}

// ==========================================
// TEAM MATCHING ENGINE
// ==========================================

/**
 * Fuzzy match a scraped Arabic team name against API-Football team names.
 * Returns a confidence score 0-100.
 */
function matchTeamName(scrapedAr: string, apiTeamName: string): number {
  const normalizedScraped = normalizeArabic(scrapedAr);
  const normalizedApi = normalizeEnglish(apiTeamName);

  // Direct Arabic match from dictionary
  const englishNames = ARABIC_TO_ENGLISH.get(normalizedScraped);
  if (englishNames) {
    for (const eng of englishNames) {
      if (normalizedApi.includes(eng) || eng.includes(normalizedApi)) {
        return 100;
      }
      // Partial match
      const words = eng.split(' ');
      const apiWords = normalizedApi.split(' ');
      const commonWords = words.filter(w => apiWords.some(aw => aw.includes(w) || w.includes(aw)));
      if (commonWords.length > 0 && commonWords.length >= words.length * 0.5) {
        return 80;
      }
    }
  }

  // Check if scraped name contains any dictionary Arabic name
  for (const [arNorm, engNames] of ARABIC_TO_ENGLISH.entries()) {
    if (normalizedScraped.includes(arNorm) || arNorm.includes(normalizedScraped)) {
      for (const eng of engNames) {
        if (normalizedApi.includes(eng) || eng.includes(normalizedApi)) {
          return 90;
        }
      }
    }
  }

  // Character-level similarity as last resort
  const similarity = calculateSimilarity(normalizedScraped, normalizedApi);
  return Math.round(similarity * 60);
}

/**
 * Simple Levenshtein-based similarity ratio
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(a.length, b.length);
  return 1 - matrix[b.length][a.length] / maxLen;
}

// ==========================================
// MATCH LINKING ENGINE
// ==========================================

interface ApiMatch {
  id: string;
  fixtureId: number;
  homeTeamName: string;
  awayTeamName: string;
  startTime: string;
  status: string;
}

/**
 * Link scraped streams to API-Football matches.
 * Uses fuzzy matching on team names + time comparison.
 */
export function linkStreamsToMatches(
  scrapedStreams: ScrapedStream[],
  apiMatches: ApiMatch[]
): Map<string, StreamServer[]> {
  const matchStreams = new Map<string, StreamServer[]>();

  for (const scraped of scrapedStreams) {
    let bestMatch: ApiMatch | null = null;
    let bestScore = 0;

    for (const api of apiMatches) {
      // Score home team match
      const homeScore = Math.max(
        matchTeamName(scraped.homeTeamAr, api.homeTeamName),
        scraped.awayTeamAr ? matchTeamName(scraped.awayTeamAr, api.awayTeamName) : 0
      );

      // If we have away team, also check cross-match
      let awayScore = 0;
      if (scraped.awayTeamAr) {
        awayScore = Math.max(
          matchTeamName(scraped.awayTeamAr, api.awayTeamName),
          matchTeamName(scraped.homeTeamAr, api.homeTeamName)
        );
      }

      const totalScore = Math.max(homeScore, awayScore);

      // Bonus for time match
      let timeBonus = 0;
      if (scraped.matchTime && api.startTime) {
        if (scraped.matchTime === api.startTime) timeBonus = 10;
        else {
          // Check within 1 hour
          const [sh, sm] = scraped.matchTime.split(':').map(Number);
          const [ah, am] = api.startTime.split(':').map(Number);
          const scrapedMin = sh * 60 + sm;
          const apiMin = ah * 60 + am;
          if (Math.abs(scrapedMin - apiMin) <= 60) timeBonus = 5;
        }
      }

      const finalScore = totalScore + timeBonus;

      if (finalScore > bestScore && finalScore >= 70) {
        bestScore = finalScore;
        bestMatch = api;
      }
    }

    if (bestMatch) {
      const existing = matchStreams.get(bestMatch.id) || [];
      
      // Add the main channel URL
      if (scraped.channelUrl) {
        existing.push({
          id: `scraped-${existing.length + 1}-${Date.now()}`,
          name: scraped.channelName || 'سيرفر البث',
          url: scraped.channelUrl,
          channelName: scraped.channelName,
          quality: guessQuality(scraped.channelName),
          status: 'active',
          lastChecked: Date.now(),
        });
      }

      // Also add known channel alternatives for the same broadcast
      const relatedChannels = findRelatedChannels(scraped.channelName);
      for (const ch of relatedChannels) {
        if (!existing.some(e => e.url === ch.urls[0])) {
          existing.push({
            id: `channel-${ch.name}-${Date.now()}`,
            name: ch.nameAr,
            url: ch.urls[0],
            channelName: ch.name,
            quality: ch.quality,
            status: 'active',
            lastChecked: Date.now(),
          });
        }
      }

      matchStreams.set(bestMatch.id, existing);
    }
  }

  // For any live match without scraped streams, provide default sport channels
  for (const api of apiMatches) {
    if (api.status === 'LIVE' || api.status === 'HT') {
      if (!matchStreams.has(api.id)) {
        matchStreams.set(api.id, getDefaultSportsChannels());
      }
    }
  }

  return matchStreams;
}

function guessQuality(channelName: string): string {
  if (channelName.includes('HD') || channelName.includes('1')) return '1080p';
  if (channelName.includes('Max') || channelName.includes('ماكس')) return '720p';
  return '720p';
}

function findRelatedChannels(channelName: string): typeof SPORTS_CHANNELS[string][] {
  const related: typeof SPORTS_CHANNELS[string][] = [];
  const lowerName = channelName.toLowerCase();

  // If beIN 1, also suggest beIN 2 and Max 1
  if (lowerName.includes('bein') || lowerName.includes('بي ان')) {
    if (SPORTS_CHANNELS.bein1 && !lowerName.includes('1')) related.push(SPORTS_CHANNELS.bein1);
    if (SPORTS_CHANNELS.bein2 && !lowerName.includes('2')) related.push(SPORTS_CHANNELS.bein2);
    if (SPORTS_CHANNELS.beinmax1) related.push(SPORTS_CHANNELS.beinmax1);
  }

  return related.slice(0, 2); // Max 2 related channels
}

function getDefaultSportsChannels(): StreamServer[] {
  return [
    {
      id: `default-bein1-${Date.now()}`,
      name: 'بي ان سبورت 1',
      url: SPORTS_CHANNELS.bein1.urls[0],
      channelName: 'beIN Sports 1 HD',
      quality: '1080p',
      status: 'checking',
      lastChecked: Date.now(),
    },
    {
      id: `default-bein2-${Date.now()}`,
      name: 'بي ان سبورت 2',
      url: SPORTS_CHANNELS.bein2.urls[0],
      channelName: 'beIN Sports 2 HD',
      quality: '1080p',
      status: 'checking',
      lastChecked: Date.now(),
    },
    {
      id: `default-beinmax1-${Date.now()}`,
      name: 'بي ان سبورت ماكس 1',
      url: SPORTS_CHANNELS.beinmax1.urls[0],
      channelName: 'beIN Sports Max 1',
      quality: '720p',
      status: 'checking',
      lastChecked: Date.now(),
    },
  ];
}

// ==========================================
// CHANNEL URL VALIDATOR
// ==========================================

/**
 * Validates that a channel page is still accessible
 */
export async function validateStreamUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Validate all streams for a match, removing dead ones
 */
export async function validateMatchStreams(streams: StreamServer[]): Promise<StreamServer[]> {
  const results = await Promise.allSettled(
    streams.map(async (stream) => {
      const isValid = await validateStreamUrl(stream.url);
      return {
        ...stream,
        status: isValid ? 'active' as const : 'dead' as const,
        lastChecked: Date.now(),
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<StreamServer> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(s => s.status !== 'dead');
}

// ==========================================
// EXPORT CHANNEL LIST FOR UI
// ==========================================

export function getAllSportsChannels() {
  return Object.entries(SPORTS_CHANNELS).map(([id, ch]) => ({
    id,
    ...ch,
  }));
}

export { SPORTS_CHANNELS };
