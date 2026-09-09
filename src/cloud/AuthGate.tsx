import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LIME } from '../theme';
import { FONT } from '../typography';
import { useColors } from '../useColors';

/** Login wall — unsigned users must not see assets. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const c = useColors();

  if (!isLoaded) {
    return <View style={[styles.fill, { backgroundColor: c.bg }]} />;
  }

  if (!isSignedIn) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: c.bg }]}>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={[styles.badge, { backgroundColor: LIME }]}>
            <Text style={styles.badgeGlyph}>衡</Text>
          </View>
          <Text style={[styles.title, { color: c.text }]}>登录后才能查看资产</Text>
          <Text style={[styles.sub, { color: c.textSecondary }]}>
            云端第一刀：登录必选（Clerk）。本地账本可一键上云。
          </Text>
          <Pressable
            onPress={() => router.push('/login')}
            style={[styles.cta, { backgroundColor: c.tint }]}>
            <Text style={styles.ctaText}>登录以同步云端</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeGlyph: { fontFamily: FONT.extrabold, fontSize: 24, color: '#1C1C1E' },
  title: { fontFamily: FONT.bold, fontSize: 20, textAlign: 'center' },
  sub: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 8 },
  cta: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontFamily: FONT.semibold, fontSize: 16 },
});
