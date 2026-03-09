import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { theme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

export default function StreamPlayerScreen() {
  const { url, name, quality } = useLocalSearchParams<{ url: string; name: string; quality: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const decodedUrl = url ? decodeURIComponent(url) : '';
  const channelName = name ? decodeURIComponent(name) : 'Stream';
  const channelQuality = quality ? decodeURIComponent(quality) : '720p';

  const handleReload = useCallback(() => {
    Haptics.selectionAsync();
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (!decodedUrl) {
    return (
      <View style={[styles.container, styles.center]}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.textMuted} />
          <Text style={styles.errorTitle}>URL not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{isRTL ? 'رجوع' : 'Go Back'}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  // Inject CSS to improve mobile viewing: hide ads, force dark bg, make player bigger
  const injectedJS = `
    (function() {
      // Dark background
      document.body.style.backgroundColor = '#000';
      document.documentElement.style.backgroundColor = '#000';
      
      // Try to hide common ad elements and navigation
      var selectors = [
        'header', 'footer', 'nav', '.ads', '.ad', '#ads', 
        '[class*="banner"]', '[class*="popup"]', '[id*="popup"]',
        '[class*="overlay"]', '.social', '.share', '.comments',
        '[class*="sidebar"]', '[class*="menu"]'
      ];
      selectors.forEach(function(sel) {
        try {
          document.querySelectorAll(sel).forEach(function(el) {
            el.style.display = 'none';
          });
        } catch(e) {}
      });

      // Try to find and maximize the player/iframe
      var iframes = document.querySelectorAll('iframe');
      iframes.forEach(function(iframe) {
        var src = iframe.src || '';
        if (src.indexOf('player') !== -1 || src.indexOf('embed') !== -1 || 
            src.indexOf('stream') !== -1 || src.indexOf('video') !== -1 ||
            iframe.width > 200) {
          iframe.style.width = '100vw';
          iframe.style.height = '100vh';
          iframe.style.position = 'fixed';
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.style.zIndex = '99999';
          iframe.style.border = 'none';
          iframe.setAttribute('allowfullscreen', 'true');
        }
      });

      // Also check for video elements
      var videos = document.querySelectorAll('video');
      videos.forEach(function(v) {
        v.style.width = '100%';
        v.style.height = 'auto';
        v.style.maxHeight = '100vh';
      });
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header Bar */}
        <View style={[styles.headerBar, isRTL && styles.rowReverse]}>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); router.back(); }}
            style={styles.headerBtn}
          >
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#FFF" />
          </Pressable>

          <View style={[styles.headerCenter, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.headerTitle, isRTL && styles.textRight]} numberOfLines={1}>
              {channelName}
            </Text>
            <View style={[styles.headerMeta, isRTL && styles.rowReverse]}>
              <View style={styles.liveDot} />
              <Text style={styles.headerQuality}>{channelQuality}</Text>
            </View>
          </View>

          <Pressable onPress={handleReload} style={styles.headerBtn}>
            <Ionicons name="refresh" size={20} color="#FFF" />
          </Pressable>
        </View>

        {/* WebView Player */}
        <View style={styles.webviewContainer}>
          {hasError ? (
            <View style={styles.errorState}>
              <Ionicons name="wifi-outline" size={48} color={theme.textMuted} />
              <Text style={styles.errorTitle}>
                {isRTL ? 'فشل تحميل البث' : 'Failed to load stream'}
              </Text>
              <Text style={styles.errorSubtitle}>
                {isRTL ? 'تحقق من اتصالك بالإنترنت أو جرب سيرفر آخر' : 'Check your connection or try another server'}
              </Text>
              <Pressable onPress={handleReload} style={styles.retryButton}>
                <Ionicons name="refresh" size={16} color="#060A13" />
                <Text style={styles.retryText}>
                  {isRTL ? 'إعادة المحاولة' : 'Retry'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={{ uri: decodedUrl }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              mixedContentMode="always"
              userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
              onLoadStart={() => { setIsLoading(true); setHasError(false); }}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setHasError(true); }}
              onHttpError={(e) => {
                if (e.nativeEvent.statusCode >= 400) {
                  setHasError(true);
                  setIsLoading(false);
                }
              }}
              injectedJavaScript={injectedJS}
              onMessage={() => {}}
              startInLoadingState={false}
              scalesPageToFit={true}
              allowsBackForwardNavigationGestures={true}
            />
          )}

          {/* Loading Overlay */}
          {isLoading && !hasError ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>
                {isRTL ? 'جاري تحميل البث...' : 'Loading stream...'}
              </Text>
              <Text style={styles.loadingHint}>
                {isRTL ? 'قد يستغرق التحميل بضع ثوان' : 'This may take a few seconds'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Bottom Info Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={[styles.bottomContent, isRTL && styles.rowReverse]}>
            <View style={[styles.bottomLeft, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.bottomChannel, isRTL && styles.textRight]} numberOfLines={1}>
                {channelName}
              </Text>
              <Text style={[styles.bottomStatus, isRTL && styles.textRight]}>
                {isLoading 
                  ? (isRTL ? 'جاري التحميل...' : 'Loading...') 
                  : hasError 
                    ? (isRTL ? 'خطأ في الاتصال' : 'Connection error')
                    : (isRTL ? 'البث نشط' : 'Stream active')
                }
              </Text>
            </View>
            <View style={[styles.bottomRight, isRTL && styles.rowReverse]}>
              <View style={[styles.qualityBadge]}>
                <Text style={styles.qualityBadgeText}>{channelQuality}</Text>
              </View>
              {!isLoading && !hasError ? (
                <View style={styles.activeDot} />
              ) : null}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  textRight: { textAlign: 'right' },
  rowReverse: { flexDirection: 'row-reverse' },

  headerBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(6,10,19,0.95)',
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.live },
  headerQuality: { fontSize: 11, fontWeight: '600', color: theme.textSecondary },

  webviewContainer: { flex: 1, backgroundColor: '#000', position: 'relative' },
  webview: { flex: 1, backgroundColor: '#000' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  loadingText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  loadingHint: { fontSize: 12, color: theme.textMuted },

  errorState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12,
    paddingHorizontal: 32,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' },
  errorSubtitle: { fontSize: 14, color: theme.textMuted, textAlign: 'center', lineHeight: 20 },
  retryButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.primary, paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: theme.radius.full, marginTop: 8,
  },
  retryText: { fontSize: 15, fontWeight: '700', color: '#060A13' },
  backButton: {
    backgroundColor: theme.surface, paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: theme.radius.full, marginTop: 8,
  },
  backButtonText: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },

  bottomBar: {
    backgroundColor: 'rgba(6,10,19,0.95)',
    borderTopWidth: 1, borderTopColor: theme.border,
    paddingHorizontal: 16, paddingTop: 10,
  },
  bottomContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomLeft: { flex: 1 },
  bottomChannel: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  bottomStatus: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  bottomRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qualityBadge: {
    backgroundColor: 'rgba(0,230,118,0.15)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.sm,
  },
  qualityBadgeText: { fontSize: 11, fontWeight: '700', color: theme.primary },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary },
});
