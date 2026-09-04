import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Tabs,
  type CollapsingTabsRef,
  type TabBarRenderProps,
} from 'react-native-collapsible-tab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '../../src/components/GlassIconButton';
import { filterAssets, useOverview } from '../../src/hooks';
import { CategoryPage } from '../../src/home/CategoryPage';
import { HomeHeader } from '../../src/home/HomeHeader';
import { HomeTabBar } from '../../src/home/HomeTabBar';
import { styles } from '../../src/home/homeStyles';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';
import {
  CATEGORIES,
  STATUS_FILTERS,
  type Asset,
  type AssetStatus,
} from '../../src/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { width } = useWindowDimensions();
  const assets = useStore((s) => s.assets);
  const overview = useOverview();
  const tabsRef = useRef<CollapsingTabsRef>(null);
  const collapseProgress = useSharedValue(0);

  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const gap = 10;
  const pad = 16;
  const cardW = (width - pad * 2 - gap) / 2;
  // iOS 26 floating tab bar + trailing add button overlay the screen.
  // Safe-area bottom is only the home indicator (~34); the pill is ~120pt.
  const bottomPad = Platform.OS === 'ios' ? insets.bottom + 120 : 32;
  const statusIndex = Math.max(0, STATUS_FILTERS.findIndex((s) => s.id === status));

  const cats = useMemo(() => {
    return CATEGORIES.filter(
      (cat) => cat.id === 'all' || assets.some((a) => a.category === cat.id),
    );
  }, [assets]);

  const rowsByCat = useMemo(() => {
    const map: Record<string, Asset[][]> = {};
    for (const cat of cats) {
      const list = filterAssets(assets, cat.id, status);
      const rows: Asset[][] = [];
      for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
      map[cat.id] = rows;
    }
    return map;
  }, [assets, cats, status]);

  const expandHeader = useCallback(() => {
    tabsRef.current?.scrollToTop(true);
  }, []);

  const onStatusChange = useCallback((i: number) => {
    setStatus(STATUS_FILTERS[i]?.id ?? 'all');
  }, []);

  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0.35, 0.75], [0, 1], Extrapolation.CLAMP),
  }));

  const renderHeader = useCallback(
    () => <HomeHeader overview={overview} collapseProgress={collapseProgress} />,
    [overview, collapseProgress],
  );

  const renderTabBar = useCallback(
    (props: TabBarRenderProps) => (
      <HomeTabBar
        {...props}
        cats={cats}
        statusIndex={statusIndex}
        onStatusChange={onStatusChange}
      />
    ),
    [cats, statusIndex, onStatusChange],
  );

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={[styles.topChrome, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <View style={styles.topRow}>
          <Pressable hitSlop={12} onPress={expandHeader} style={styles.titlePress}>
            <Animated.Text style={[styles.compactTitle, { color: c.text }, compactTitleStyle]}>
              有数
            </Animated.Text>
          </Pressable>
          <View style={styles.topActions}>
            <GlassIconButton
              name="magnifyingglass"
              accessibilityLabel="搜索"
              onPress={() => router.push('/search')}
            />
            <GlassIconButton
              name="calendar"
              accessibilityLabel="购入日历"
              onPress={() => router.push('/calendar')}
            />
          </View>
        </View>
      </View>

      <Tabs.Container
        ref={tabsRef}
        renderHeader={renderHeader}
        renderTabBar={renderTabBar}
        minHeaderHeight={0}
        headerBackgroundColor={c.bg}
        containerStyle={styles.body}
        initialTabName="all"
        pagerProps={{ offscreenPageLimit: Math.max(1, cats.length - 1) }}>
        {cats.map((cat) => (
          <Tabs.Tab key={cat.id} name={cat.id} label={cat.label}>
            <CategoryPage
              rows={rowsByCat[cat.id] ?? []}
              cardW={cardW}
              gap={gap}
              pad={pad}
              bottomPad={bottomPad}
            />
          </Tabs.Tab>
        ))}
      </Tabs.Container>
    </GestureHandlerRootView>
  );
}
