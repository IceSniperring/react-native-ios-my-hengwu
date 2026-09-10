import { useAuth } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useSignIn, useSignUp } from '@clerk/expo/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '../src/components/GlassSurface';
import { PlatformIcon } from '../src/native/PlatformIcon';
import type { LoginMode } from '../src/native/forms';
import { LoginForm } from '../src/native/LoginForm';
import { useStore } from '../src/store';
import { FONT } from '../src/typography';
import { useColors } from '../src/useColors';

/**
 * Sign-in screen.
 *
 * Presented full screen (`presentation: 'fullScreenModal'`) — the default
 * `'modal'` maps to an iOS page sheet, which by design leaves a gap at the top
 * showing the screen behind it.
 */
export default function LoginScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const scheme = useStore((s) => s.colorScheme);
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { startHostedAuth } = useHostedAuth();
  const [mode, setMode] = useState<LoginMode>('signin');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // This route can also be entered directly (deep link), where there is no
  // screen to pop — a bare back() would throw an unhandled GO_BACK.
  const leave = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, []);

  useEffect(() => {
    if (authLoaded && isSignedIn) leave();
  }, [authLoaded, isSignedIn, leave]);

  const onSubmit = async (email: string, password: string) => {
    setError(null);
    if (!email.trim() || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        if (!signInLoaded || !signIn) throw new Error('Clerk 未就绪');
        const result = await signIn.create({ identifier: email.trim(), password });
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive!({ session: result.createdSessionId });
          leave();
          return;
        }
        setError('账号或密码不正确，请重试');
      } else {
        if (!signUpLoaded || !signUp) throw new Error('Clerk 未就绪');
        await signUp.create({ emailAddress: email.trim(), password });
        setError('请查收邮箱验证邮件后，再返回登录');
        setMode('signin');
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'errors' in e
          ? String((e as { errors?: { message?: string }[] }).errors?.[0]?.message ?? '')
          : e instanceof Error
            ? e.message
            : '';
      setError(
        /network|fetch|Failed/i.test(msg) ? '网络异常，请检查连接后重试' : msg || '账号或密码不正确，请重试',
      );
    } finally {
      setBusy(false);
    }
  };

  const onHosted = async () => {
    setError(null);
    setBusy(true);
    try {
      await startHostedAuth({ mode: mode === 'signup' ? 'sign-up' : 'sign-in' });
    } catch (e) {
      setError(e instanceof Error ? e.message : '网络异常，请检查连接后重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    // Tapping anywhere that isn't a control dismisses the keyboard: touches on
    // the buttons below are claimed by those Pressables, so they never reach
    // this ancestor.
    <Pressable
      accessible={false}
      onPress={Keyboard.dismiss}
      style={[styles.fill, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      {/* Brand wash. Its real job is to give the Liquid Glass controls
          something to refract — on a flat fill the material is invisible. */}
      <LinearGradient
        pointerEvents="none"
        colors={
          scheme === 'dark'
            ? ['rgba(169,214,46,0.16)', 'rgba(169,214,46,0)']
            : ['rgba(169,214,46,0.22)', 'rgba(169,214,46,0)']
        }
        style={styles.glow}
      />

      <View style={styles.topBar}>
        <GlassSurface
          interactive
          glassStyle="clear"
          style={styles.close}
          fallbackStyle={{ backgroundColor: c.chip }}>
          <Pressable
            onPress={leave}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="关闭"
            style={({ pressed }) => [styles.closeHit, { opacity: pressed ? 0.6 : 1 }]}>
            <PlatformIcon name="xmark" size={15} color={c.text} />
          </Pressable>
        </GlassSurface>
      </View>

      <View style={styles.body}>
        <LoginForm
          mode={mode}
          busy={busy}
          error={error}
          onSubmit={onSubmit}
          onHosted={onHosted}
          onToggleMode={() => {
            setError(null);
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
          }}
        />
      </View>

      <Text style={[styles.foot, { color: c.textTertiary }]}>由 Clerk 提供</Text>
      {/* Clerk bot protection requires this mount point on custom sign-up screens. */}
      <View nativeID="clerk-captcha" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 340 },
  topBar: { height: 44, paddingHorizontal: 20, alignItems: 'flex-end', justifyContent: 'center' },
  close: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  closeHit: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingTop: Platform.OS === 'ios' ? 32 : 24 },
  foot: { textAlign: 'center', fontSize: 12, fontFamily: FONT.regular, paddingBottom: 28 },
});
