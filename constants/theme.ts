import { Platform } from 'react-native';

export const theme = {
  // Core colors — Dark sports UI
  primary: '#00E676',
  primaryLight: '#69F0AE',
  primaryDark: '#00C853',
  accent: '#FF6D00',
  accentLight: '#FF9E40',

  // Backgrounds
  background: '#060A13',
  backgroundSecondary: '#0C1220',
  surface: '#121A2D',
  surfaceElevated: '#182038',
  card: '#151D30',
  cardElevated: '#1C2640',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#7B8AA5',
  textMuted: '#4A5568',

  // Semantic
  live: '#FF1744',
  liveGlow: 'rgba(255, 23, 68, 0.3)',
  success: '#00E676',
  warning: '#FFD600',
  error: '#FF1744',

  // Borders
  border: '#1E2A42',
  borderLight: '#253350',

  // Gradients
  gradientDark: ['#060A13', '#0C1220'],
  gradientCard: ['#151D30', '#1C2640'],
  gradientLive: ['#FF1744', '#D50000'],
  gradientPrimary: ['#00E676', '#00C853'],
  gradientAccent: ['#FF6D00', '#FF9100'],
  gradientHero: ['rgba(6,10,19,0)', 'rgba(6,10,19,0.85)', '#060A13'],

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Border radius
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 24,
    full: 9999,
  },

  // Typography
  typography: {
    heroScore: { fontSize: 56, fontWeight: '800' as const, color: '#FFFFFF', letterSpacing: -1 },
    heroTitle: { fontSize: 28, fontWeight: '700' as const, color: '#FFFFFF' },
    sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: '#FFFFFF' },
    matchTeam: { fontSize: 15, fontWeight: '600' as const, color: '#FFFFFF' },
    matchScore: { fontSize: 24, fontWeight: '800' as const, color: '#FFFFFF' },
    matchMinute: { fontSize: 13, fontWeight: '700' as const, color: '#FF1744' },
    cardTitle: { fontSize: 16, fontWeight: '600' as const, color: '#FFFFFF' },
    cardSubtitle: { fontSize: 13, fontWeight: '500' as const, color: '#7B8AA5' },
    body: { fontSize: 15, fontWeight: '400' as const, color: '#FFFFFF' },
    caption: { fontSize: 12, fontWeight: '500' as const, color: '#7B8AA5' },
    label: { fontSize: 11, fontWeight: '600' as const, color: '#7B8AA5', textTransform: 'uppercase' as const, letterSpacing: 1 },
    tabLabel: { fontSize: 11, fontWeight: '600' as const },
    buttonPrimary: { fontSize: 16, fontWeight: '700' as const, color: '#060A13' },
    buttonSecondary: { fontSize: 14, fontWeight: '600' as const, color: '#00E676' },
  },

  // Shadows
  shadows: Platform.select({
    ios: {
      card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
      elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
      glow: { shadowColor: '#00E676', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12 },
    },
    android: {
      card: { elevation: 3 },
      elevated: { elevation: 6 },
      glow: { elevation: 4 },
    },
    default: {
      card: {},
      elevated: {},
      glow: {},
    },
  }),
};
