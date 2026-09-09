import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { Appearance, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useStore } from '../src/store';
import { FONT, useAppFonts } from '../src/typography';
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
  const fontsReady = useAppFonts();

  // One appearance source for JS + UIKit (tab materials, status bar, vibrancy).
  useEffect(() => {
    Appearance.setColorScheme(scheme);
  }, [scheme]);

  useEffect(() => {
    const t = setTimeout(() => setHydrated(), 250);
    return () => clearTimeout(t);
  }, [setHydrated]);

  useEffect(() => {
    if (hydrated && fontsReady) SplashScreen.hideAsync();
  }, [hydrated, fontsReady]);

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

  if (!hydrated || !fontsReady) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  const nativeHeader = {
    headerShown: true,
    headerShadowVisible: Platform.OS === 'android',
    headerBackTitle: '返回',
    headerTintColor: c.text,
    headerTitleStyle: { fontFamily: FONT.bold, color: c.text },
    headerStyle: { backgroundColor: c.bg },
    contentStyle: { backgroundColor: c.bg },
    animation: Platform.OS === 'ios' ? ('default' as const) : ('slide_from_right' as const),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.bg }}>
      <ThemeProvider value={navTheme}>
        {/* Follow the app scheme so status bar matches UI + tab material. */}
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="ingress/index"
          options={{
            headerShown: false,
            presentation: 'modal',
            contentStyle: { backgroundColor: c.bg },
          }}
        />
        <Stack.Screen
          name="ingress/csv"
          options={{
            headerShown: false,
            presentation: 'modal',
            contentStyle: { backgroundColor: c.bg },
          }}
        />
        <Stack.Screen
          name="ingress/confirm"
          options={{
            headerShown: false,
            presentation: 'modal',
            contentStyle: { backgroundColor: c.bg },
          }}
        />
        <Stack.Screen
          name="asset/[id]"
          options={{
            headerShown: false,
            // Standard iOS push/pop — left-edge swipe back stays enabled.
            animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
            gestureEnabled: true,
            contentStyle: { backgroundColor: c.bg },
          }}
        />
        <Stack.Screen
          name="asset/form"
          options={{
            headerShown: false,
            presentation: 'modal',
            contentStyle: { backgroundColor: c.bg },
          }}
        />
        <Stack.Screen
          name="pick/tags"
          options={{
            headerShown: false,
            presentation: 'modal',
            contentStyle: { backgroundColor: c.bg },
          }}
        />
        <Stack.Screen
          name="pick/category"
          options={{
            headerShown: false,
            presentation: 'modal',
            contentStyle: { backgroundColor: c.bg },
          }}
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
        <Stack.Screen name="manage/categories" options={{ ...nativeHeader, title: '分类' }} />
        <Stack.Screen name="manage/tags" options={{ ...nativeHeader, title: '标签' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
