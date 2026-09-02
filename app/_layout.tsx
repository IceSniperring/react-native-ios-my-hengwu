import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { Appearance, Platform, View } from 'react-native';

import { useStore } from '../src/store';
import { useColors } from '../src/useColors';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);
  const setHydrated = useStore((s) => s.setHydrated);
  const scheme = useStore((s) => s.colorScheme);
  const c = useColors();

  useEffect(() => {
    const t = setTimeout(() => setHydrated(), 250);
    return () => clearTimeout(t);
  }, [setHydrated]);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  // Keep native UI (Liquid Glass tab bar / status bar) in sync with app dark mode.
  useEffect(() => {
    Appearance.setColorScheme(scheme);
  }, [scheme]);

  const navTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.tabSelected,
        background: c.bg,
        card: c.surface,
        text: c.text,
        border: c.line,
        notification: c.danger,
      },
    };
  }, [scheme, c]);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: c.limeHeader }} />;

  const nativeHeader = {
    headerShown: true,
    headerShadowVisible: false,
    headerBackTitle: '返回',
    headerTintColor: c.text,
    headerTitleStyle: { fontWeight: '600' as const, color: c.text },
    headerStyle: { backgroundColor: c.bg },
    contentStyle: { backgroundColor: c.bg },
    animation: Platform.OS === 'ios' ? ('default' as const) : ('slide_from_right' as const),
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="asset/[id]" options={{ ...nativeHeader, title: '资产详情' }} />
        <Stack.Screen
          name="asset/form"
          options={{ ...nativeHeader, presentation: 'modal', title: '录入资产' }}
        />
        <Stack.Screen
          name="asset/sell"
          options={{ ...nativeHeader, presentation: 'modal', title: '卖出复盘' }}
        />
        <Stack.Screen
          name="search"
          options={{
            ...nativeHeader,
            title: '搜索',
            headerSearchBarOptions: {
              placeholder: '搜资产名称',
              hideWhenScrolling: false,
              cancelButtonText: '取消',
            },
          }}
        />
        <Stack.Screen name="savings" options={{ ...nativeHeader, title: '智能攒钱' }} />
        <Stack.Screen name="calendar" options={{ ...nativeHeader, title: '购入日历' }} />
      </Stack>
    </ThemeProvider>
  );
}
