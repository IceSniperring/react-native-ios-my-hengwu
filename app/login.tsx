import { useAuth, useSignIn, useSignUp } from '@clerk/expo/legacy';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LIME } from '../src/theme';
import { FONT } from '../src/typography';
import { useColors } from '../src/useColors';

/**
 * Login screen aligned with youshu-auth-migrate-prototype copy.
 * Email/password is the primary path; hosted Account Portal as fallback.
 */
export default function LoginScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { startHostedAuth } = useHostedAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [authLoaded, isSignedIn]);

  const onSubmit = async () => {
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
          router.replace('/(tabs)');
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
      if (/network|fetch|Failed/i.test(msg)) {
        setError('网络异常，请检查连接后重试');
      } else if (msg) {
        setError(msg);
      } else {
        setError('账号或密码不正确，请重试');
      }
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
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: c.bg, paddingTop: insets.top + 12 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: c.tint, fontSize: 16 }}>关闭</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={[styles.logo, { backgroundColor: LIME }]}>
          <Text style={styles.logoGlyph}>衡</Text>
        </View>
        <Text style={[styles.title, { color: c.text }]}>登录以同步云端</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          云端第一刀：登录必选（Clerk）。本地账本可一键上云。
        </Text>

        <View style={[styles.seg, { backgroundColor: c.chip }]}>
          <Pressable
            onPress={() => setMode('signin')}
            style={[styles.segItem, mode === 'signin' && { backgroundColor: c.surface }]}>
            <Text style={{ color: c.text, fontFamily: FONT.semibold, fontSize: 13 }}>邮箱密码</Text>
          </Pressable>
          <Pressable onPress={onHosted} style={styles.segItem}>
            <Text style={{ color: c.textSecondary, fontSize: 13 }}>浏览器登录</Text>
          </Pressable>
        </View>

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="邮箱"
          placeholderTextColor={c.textTertiary}
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.line }]}
        />
        <TextInput
          secureTextEntry
          autoComplete="password"
          placeholder="密码"
          placeholderTextColor={c.textTertiary}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.line }]}
        />

        {error ? <Text style={[styles.err, { color: c.danger }]}>{error}</Text> : null}

        <Pressable
          disabled={busy}
          onPress={() => void onSubmit()}
          style={[styles.cta, { backgroundColor: c.tint, opacity: busy ? 0.7 : 1 }]}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>{mode === 'signin' ? '登录' : '注册'}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={{ color: c.tint, marginTop: 16, fontSize: 14 }}>
            {mode === 'signin' ? '还没有账号？注册' : '已有账号？登录'}
          </Text>
        </Pressable>

        <Text style={[styles.foot, { color: c.textTertiary }]}>由 Clerk 接入</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 8 },
  body: { flex: 1, paddingHorizontal: 24, alignItems: 'center', paddingTop: 24 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoGlyph: { fontFamily: FONT.extrabold, fontSize: 28, color: '#1C1C1E' },
  title: { fontFamily: FONT.bold, fontSize: 22, marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 20 },
  seg: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  segItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  input: {
    alignSelf: 'stretch',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    fontFamily: FONT.regular,
  },
  err: { alignSelf: 'stretch', fontSize: 13, marginBottom: 8 },
  cta: {
    alignSelf: 'stretch',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaText: { color: '#fff', fontFamily: FONT.semibold, fontSize: 16 },
  foot: { marginTop: 28, fontSize: 12 },
});
