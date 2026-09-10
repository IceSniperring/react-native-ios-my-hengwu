import { useAuth } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useStore } from '../store';
import { LIME } from '../theme';
import { FONT } from '../typography';
import { useColors } from '../useColors';

/**
 * Login wall — unsigned users must not see assets.
 *
 * Styled as an iOS 26 welcome state: no bordered card, a brand badge over a
 * soft lime wash, and a full-width capsule call to action — matching the
 * sign-in screen it leads to.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);

  if (!isLoaded) {
    return <View style={[styles.fill, { backgroundColor: c.bg }]} />;
  }

  if (!isSignedIn) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: c.bg }]}>
        <LinearGradient
          pointerEvents="none"
          colors={
            scheme === 'dark'
              ? ['rgba(169,214,46,0.16)', 'rgba(169,214,46,0)']
              : ['rgba(169,214,46,0.22)', 'rgba(169,214,46,0)']
          }
          style={styles.glow}
        />
        <View style={[styles.badge, { backgroundColor: LIME }]}>
          <Text style={[styles.badgeGlyph, { color: c.onLime }]}>衡</Text>
        </View>
        <Text style={[styles.title, { color: c.text }]}>登录后才能查看资产</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          云端第一刀：登录必选（Clerk）。本地账本可一键上云。
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/login')}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: c.tint, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={[styles.ctaText, { color: c.onTint }]}>登录以同步云端</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badgeGlyph: { fontFamily: FONT.extrabold, fontSize: 30 },
  title: { fontFamily: FONT.bold, fontSize: 24, letterSpacing: -0.4, textAlign: 'center' },
  sub: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: FONT.regular,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  cta: {
    alignSelf: 'stretch',
    maxWidth: 340,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: FONT.semibold, fontSize: 17 },
});
