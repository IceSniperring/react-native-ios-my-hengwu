import { Globe } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { FONT } from '../typography';
import { useColors } from '../useColors';
import type { LoginFormProps } from './forms';

/**
 * Sign-in form.
 *
 * React Native controls throughout, which are the platform's own views
 * (`UITextField`, `UILabel`, `UIView`) — only the styling is ours. The visual
 * language follows iOS 26:
 *
 * - a large bold title over a secondary subtitle,
 * - filled, generously rounded fields rather than 1px-bordered boxes,
 * - a full-width capsule call to action,
 * - Liquid Glass (`GlassSurface`) for the secondary action, so the translucent
 *   material reads against the page instead of a flat fill.
 *
 * Full-width capsule buttons need `alignSelf: 'stretch'` because a `Pressable`
 * otherwise hugs its content.
 */
export function LoginForm({ mode, busy, error, onSubmit, onHosted, onToggleMode }: LoginFormProps) {
  const c = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isSignup = mode === 'signup';
  const ready = email.trim().length > 0 && password.length > 0 && !busy;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: c.text }]}>{isSignup ? '注册衡物' : '登录衡物'}</Text>
      <Text style={[styles.sub, { color: c.textSecondary }]}>登录后账本跨设备同步</Text>

      {/* One inset group for both credentials, matching `GroupedSection`:
          radius 26, `card` fill, hairline separator inset 16. */}
      <View style={[styles.group, { backgroundColor: c.card }]}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="邮箱"
          placeholderTextColor={c.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          editable={!busy}
          style={[styles.groupField, { color: c.text }]}
        />
        <View style={[styles.groupSep, { backgroundColor: c.line }]} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="密码"
          placeholderTextColor={c.textTertiary}
          secureTextEntry
          autoCapitalize="none"
          textContentType={isSignup ? 'newPassword' : 'password'}
          editable={!busy}
          style={[styles.groupField, { color: c.text }]}
        />
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: c.danger }]}>
          {error}
        </Text>
      ) : null}

      <Pressable
        disabled={!ready}
        accessibilityRole="button"
        onPress={() => onSubmit(email, password)}
        style={({ pressed }) => [
          styles.cta,
          {
            // iOS renders a disabled prominent button as neutral grey, not as a
            // dimmed tint — a washed-out blue reads as a broken button.
            backgroundColor: ready ? c.tint : c.chip,
            opacity: pressed && ready ? 0.85 : 1,
          },
        ]}>
        <Text style={[styles.ctaText, { color: ready ? c.onTint : c.textTertiary }]}>
          {busy ? '请稍候…' : isSignup ? '注册' : '登录'}
        </Text>
      </Pressable>

      <GlassSurface
        interactive
        style={styles.secondary}
        fallbackStyle={{ backgroundColor: c.chip }}>
        <Pressable
          accessibilityRole="button"
          onPress={onHosted}
          style={({ pressed }) => [styles.secondaryHit, { opacity: pressed ? 0.6 : 1 }]}>
          <Globe size={17} color={c.tint} strokeWidth={2.2} />
          <Text style={[styles.secondaryText, { color: c.tint }]}>使用浏览器登录</Text>
        </Pressable>
      </GlassSurface>

      <Pressable
        accessibilityRole="button"
        onPress={onToggleMode}
        hitSlop={8}
        style={styles.toggle}>
        <Text style={[styles.link, { color: c.tint }]}>
          {isSignup ? '已有账号？直接登录' : '还没有账号？注册'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 8 },
  title: { fontSize: 34, fontFamily: FONT.bold, letterSpacing: -0.6 },
  sub: { marginTop: 6, fontSize: 15, fontFamily: FONT.regular },
  group: { marginTop: 28, borderRadius: 26, overflow: 'hidden' },
  groupField: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 17,
    fontFamily: FONT.regular,
  },
  groupSep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  error: { marginTop: 12, fontSize: 13, fontFamily: FONT.regular },
  cta: {
    marginTop: 24,
    alignSelf: 'stretch',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 17, fontFamily: FONT.semibold },
  secondary: {
    marginTop: 12,
    alignSelf: 'stretch',
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.25)',
  },
  secondaryHit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: { fontSize: 17, fontFamily: FONT.medium },
  toggle: { marginTop: 22, alignSelf: 'center' },
  link: { fontSize: 14, fontFamily: FONT.medium },
});
