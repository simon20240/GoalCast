export const config = {
  appName: 'جول كاست',
  appNameEn: 'GoalCast',
  appTagline: 'كرة القدم مباشرة. في كل مكان.',
  appTaglineEn: 'Live Football. Everywhere.',
  version: '1.0.0',

  // Default language
  defaultLanguage: 'ar' as const,

  // Streaming
  streamingServers: [
    { id: 's1', name: 'سيرفر 1 — HD', quality: '1080p', latency: 'Low' },
    { id: 's2', name: 'سيرفر 2 — HD', quality: '720p', latency: 'Medium' },
    { id: 's3', name: 'سيرفر 3 — SD', quality: '480p', latency: 'Low' },
    { id: 's4', name: 'سيرفر احتياطي', quality: '720p', latency: 'High' },
  ],

  // Supported languages
  languages: [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ],
};
