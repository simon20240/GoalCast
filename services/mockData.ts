export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution';
  player: string;
  team: 'home' | 'away';
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'UPCOMING' | 'FT' | 'HT';
  minute?: number;
  competition: string;
  competitionId: string;
  startTime: string;
  date: string;
  events: MatchEvent[];
  hasStream: boolean;
  viewers?: number;
}

const teams: Record<string, Team> = {
  rma: { id: 'rma', name: 'Real Madrid', shortName: 'RMA', logo: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=80&h=80&fit=crop', color: '#FEBE10' },
  fcb: { id: 'fcb', name: 'FC Barcelona', shortName: 'BAR', logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=80&h=80&fit=crop', color: '#A50044' },
  liv: { id: 'liv', name: 'Liverpool', shortName: 'LIV', logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=80&h=80&fit=crop', color: '#C8102E' },
  mci: { id: 'mci', name: 'Manchester City', shortName: 'MCI', logo: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=80&h=80&fit=crop', color: '#6CABDD' },
  ars: { id: 'ars', name: 'Arsenal', shortName: 'ARS', logo: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=80&h=80&fit=crop', color: '#EF0107' },
  bay: { id: 'bay', name: 'Bayern Munich', shortName: 'BAY', logo: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=80&h=80&fit=crop', color: '#DC052D' },
  psg: { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&h=80&fit=crop', color: '#004170' },
  juv: { id: 'juv', name: 'Juventus', shortName: 'JUV', logo: 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?w=80&h=80&fit=crop', color: '#000000' },
  mun: { id: 'mun', name: 'Manchester United', shortName: 'MUN', logo: 'https://images.unsplash.com/photo-1556816213-1b59d0856f47?w=80&h=80&fit=crop', color: '#DA291C' },
  che: { id: 'che', name: 'Chelsea', shortName: 'CHE', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&h=80&fit=crop', color: '#034694' },
  int: { id: 'int', name: 'Inter Milan', shortName: 'INT', logo: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=80&h=80&fit=crop', color: '#010E80' },
  acm: { id: 'acm', name: 'AC Milan', shortName: 'ACM', logo: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=80&h=80&fit=crop', color: '#FB090B' },
  atm: { id: 'atm', name: 'Atletico Madrid', shortName: 'ATM', logo: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=80&h=80&fit=crop', color: '#CB3524' },
  dor: { id: 'dor', name: 'Borussia Dortmund', shortName: 'BVB', logo: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=80&h=80&fit=crop', color: '#FDE100' },
  tot: { id: 'tot', name: 'Tottenham', shortName: 'TOT', logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=80&h=80&fit=crop', color: '#132257' },
  nap: { id: 'nap', name: 'Napoli', shortName: 'NAP', logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=80&h=80&fit=crop', color: '#12A0D7' },
  ben: { id: 'ben', name: 'Benfica', shortName: 'BEN', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&h=80&fit=crop', color: '#FF0000' },
  por: { id: 'por', name: 'FC Porto', shortName: 'POR', logo: 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?w=80&h=80&fit=crop', color: '#003893' },
  ahl: { id: 'ahl', name: 'Al Ahly', shortName: 'AHL', logo: 'https://images.unsplash.com/photo-1556816213-1b59d0856f47?w=80&h=80&fit=crop', color: '#C8102E' },
  zmk: { id: 'zmk', name: 'Zamalek', shortName: 'ZMK', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&h=80&fit=crop', color: '#FFFFFF' },
};

export const liveMatches: Match[] = [
  {
    id: 'live1',
    homeTeam: teams.rma,
    awayTeam: teams.mci,
    homeScore: 2,
    awayScore: 1,
    status: 'LIVE',
    minute: 67,
    competition: 'Champions League',
    competitionId: 'ucl',
    startTime: '21:00',
    date: 'Today',
    events: [
      { minute: 12, type: 'goal', player: 'Vinícius Jr.', team: 'home' },
      { minute: 34, type: 'goal', player: 'Haaland', team: 'away' },
      { minute: 58, type: 'goal', player: 'Bellingham', team: 'home' },
      { minute: 45, type: 'yellow', player: 'Rodri', team: 'away' },
    ],
    hasStream: true,
    viewers: 124500,
  },
  {
    id: 'live2',
    homeTeam: teams.liv,
    awayTeam: teams.fcb,
    homeScore: 3,
    awayScore: 3,
    status: 'LIVE',
    minute: 82,
    competition: 'Champions League',
    competitionId: 'ucl',
    startTime: '21:00',
    date: 'Today',
    events: [
      { minute: 5, type: 'goal', player: 'Salah', team: 'home' },
      { minute: 22, type: 'goal', player: 'Lewandowski', team: 'away' },
      { minute: 38, type: 'goal', player: 'Yamal', team: 'away' },
      { minute: 51, type: 'goal', player: 'Núñez', team: 'home' },
      { minute: 64, type: 'goal', player: 'Pedri', team: 'away' },
      { minute: 77, type: 'goal', player: 'Salah', team: 'home' },
      { minute: 30, type: 'yellow', player: 'Robertson', team: 'home' },
      { minute: 55, type: 'red', player: 'Araujo', team: 'away' },
    ],
    hasStream: true,
    viewers: 198300,
  },
  {
    id: 'live3',
    homeTeam: teams.bay,
    awayTeam: teams.psg,
    homeScore: 1,
    awayScore: 0,
    status: 'HT',
    minute: 45,
    competition: 'Champions League',
    competitionId: 'ucl',
    startTime: '21:00',
    date: 'Today',
    events: [
      { minute: 29, type: 'goal', player: 'Müller', team: 'home' },
    ],
    hasStream: true,
    viewers: 87600,
  },
  {
    id: 'live4',
    homeTeam: teams.ars,
    awayTeam: teams.tot,
    homeScore: 1,
    awayScore: 0,
    status: 'LIVE',
    minute: 23,
    competition: 'Premier League',
    competitionId: 'epl',
    startTime: '17:30',
    date: 'Today',
    events: [
      { minute: 15, type: 'goal', player: 'Saka', team: 'home' },
    ],
    hasStream: true,
    viewers: 156800,
  },
  {
    id: 'live5',
    homeTeam: teams.int,
    awayTeam: teams.acm,
    homeScore: 0,
    awayScore: 0,
    status: 'LIVE',
    minute: 8,
    competition: 'Serie A',
    competitionId: 'seriea',
    startTime: '20:45',
    date: 'Today',
    events: [],
    hasStream: true,
    viewers: 65200,
  },
];

export const upcomingMatches: Match[] = [
  {
    id: 'up1',
    homeTeam: teams.mun,
    awayTeam: teams.che,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Premier League',
    competitionId: 'epl',
    startTime: '16:00',
    date: 'Tomorrow',
    events: [],
    hasStream: false,
  },
  {
    id: 'up2',
    homeTeam: teams.fcb,
    awayTeam: teams.atm,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'La Liga',
    competitionId: 'laliga',
    startTime: '21:00',
    date: 'Tomorrow',
    events: [],
    hasStream: false,
  },
  {
    id: 'up3',
    homeTeam: teams.dor,
    awayTeam: teams.bay,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Bundesliga',
    competitionId: 'bundesliga',
    startTime: '18:30',
    date: 'Tomorrow',
    events: [],
    hasStream: false,
  },
  {
    id: 'up4',
    homeTeam: teams.nap,
    awayTeam: teams.juv,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Serie A',
    competitionId: 'seriea',
    startTime: '20:45',
    date: 'Tomorrow',
    events: [],
    hasStream: false,
  },
  {
    id: 'up5',
    homeTeam: teams.psg,
    awayTeam: teams.rma,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Champions League',
    competitionId: 'ucl',
    startTime: '21:00',
    date: 'Wed, Jun 18',
    events: [],
    hasStream: false,
  },
  {
    id: 'up6',
    homeTeam: teams.mci,
    awayTeam: teams.liv,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Premier League',
    competitionId: 'epl',
    startTime: '17:30',
    date: 'Wed, Jun 18',
    events: [],
    hasStream: false,
  },
  {
    id: 'up7',
    homeTeam: teams.ahl,
    awayTeam: teams.zmk,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Africa Cup',
    competitionId: 'afcon',
    startTime: '19:00',
    date: 'Thu, Jun 19',
    events: [],
    hasStream: false,
  },
  {
    id: 'up8',
    homeTeam: teams.ben,
    awayTeam: teams.por,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Champions League',
    competitionId: 'ucl',
    startTime: '20:00',
    date: 'Thu, Jun 19',
    events: [],
    hasStream: false,
  },
  {
    id: 'up9',
    homeTeam: teams.che,
    awayTeam: teams.ars,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'Premier League',
    competitionId: 'epl',
    startTime: '15:00',
    date: 'Sat, Jun 21',
    events: [],
    hasStream: false,
  },
  {
    id: 'up10',
    homeTeam: teams.rma,
    awayTeam: teams.fcb,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    competition: 'La Liga',
    competitionId: 'laliga',
    startTime: '21:00',
    date: 'Sat, Jun 21',
    events: [],
    hasStream: false,
  },
];

export const finishedMatches: Match[] = [
  {
    id: 'fin1',
    homeTeam: teams.ars,
    awayTeam: teams.mci,
    homeScore: 2,
    awayScore: 2,
    status: 'FT',
    competition: 'Premier League',
    competitionId: 'epl',
    startTime: '17:30',
    date: 'Yesterday',
    events: [
      { minute: 10, type: 'goal', player: 'Saka', team: 'home' },
      { minute: 34, type: 'goal', player: 'Haaland', team: 'away' },
      { minute: 56, type: 'goal', player: 'Ødegaard', team: 'home' },
      { minute: 89, type: 'goal', player: 'De Bruyne', team: 'away' },
    ],
    hasStream: false,
  },
  {
    id: 'fin2',
    homeTeam: teams.juv,
    awayTeam: teams.int,
    homeScore: 1,
    awayScore: 3,
    status: 'FT',
    competition: 'Serie A',
    competitionId: 'seriea',
    startTime: '20:45',
    date: 'Yesterday',
    events: [
      { minute: 22, type: 'goal', player: 'Lautaro', team: 'away' },
      { minute: 44, type: 'goal', player: 'Vlahović', team: 'home' },
      { minute: 67, type: 'goal', player: 'Barella', team: 'away' },
      { minute: 80, type: 'goal', player: 'Thuram', team: 'away' },
    ],
    hasStream: false,
  },
  {
    id: 'fin3',
    homeTeam: teams.rma,
    awayTeam: teams.atm,
    homeScore: 3,
    awayScore: 1,
    status: 'FT',
    competition: 'La Liga',
    competitionId: 'laliga',
    startTime: '21:00',
    date: 'Yesterday',
    events: [
      { minute: 8, type: 'goal', player: 'Vinícius Jr.', team: 'home' },
      { minute: 30, type: 'goal', player: 'Griezmann', team: 'away' },
      { minute: 62, type: 'goal', player: 'Bellingham', team: 'home' },
      { minute: 75, type: 'goal', player: 'Mbappé', team: 'home' },
    ],
    hasStream: false,
  },
];

export const allMatches: Match[] = [...liveMatches, ...upcomingMatches, ...finishedMatches];

export function getMatchById(id: string): Match | undefined {
  return allMatches.find(m => m.id === id);
}

export function getMatchesByCompetition(competitionId: string): Match[] {
  return allMatches.filter(m => m.competitionId === competitionId);
}

export function formatViewers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
