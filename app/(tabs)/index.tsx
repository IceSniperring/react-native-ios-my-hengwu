import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetCard } from '../../src/components/AssetCard';
import { GlassIconButton } from '../../src/components/GlassIconButton';
import { OverviewCard } from '../../src/components/OverviewCard';
import { useFilteredAssets, useOverview } from '../../src/hooks';
import { FilterTabs } from '../../src/native/FilterTabs';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { useColors } from '../../src/useColors';
import { CATEGORIES, STATUS_FILTERS, type AssetStatus, type CategoryId } from '../../src/types';

const COLLAPSE = 72;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<CategoryId>('all');
  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const overview = useOverview();
  const list = useFilteredAssets(category, status);
  const gap = 10;
  const pad = 16;
  const cardW = (width - pad * 2 - gap) / 2;
  const statusIndex = Math.max(
    0,
    STATUS_FILTERS.findIndex((s) => s.id === status),
  );
  const scrollY = useSharedValue(0);

  const rows = useMemo(() => {
    const r: (typeof list)[] = [];
    for (let i = 0; i < list.length; i += 2) r.push(list.slice(i, i + 2));
    return r;
  }, [list]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // NativeTabs already respects the top safe area on modern iOS — only a light inset.
  const topPad = Math.min(insets.top, 12);

  const largeTitleStyle = useAnimatedStyle(() => {
    const t = scrollY.value;
    const progress = interpolate(t, [0, COLLAPSE], [0, 1], Extrapolation.CLAMP);
    // Drift toward horizontal center while shrinking
    const travel = (width - pad * 2) / 2 - 40;
    return {
      opacity: interpolate(progress, [0, 0.85], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: progress * travel },
        { scale: interpolate(progress, [0, 1], [1, 0.55], Extrapolation.CLAMP) },
      ],
    };
  });

  const compactTitleStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [COLLAPSE * 0.45, COLLAPSE], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: progress,
      transform: [{ translateY: interpolate(progress, [0, 1], [6, 0], Extrapolation.CLAMP) }],
    };
  });

  const stickyChromeStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [40, COLLAPSE], [0, 1], Extrapolation.CLAMP);
    return {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: progress > 0.2 ? c.line : 'transparent',
    };
  });

  return (
    <View collapsable={false} style={[styles.root, { backgroundColor: c.bg }]}>
      {/* Floating glass actions — single SafeArea, not stacked with scroll padding */}
      <View pointerEvents="box-none" style={[styles.floatingActions, { top: insets.top + 4 }]}>
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

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        contentInsetAdjustmentBehavior="never"
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={{
          paddingBottom: Math.max(24, insets.bottom + 72),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces>
        {/* 0 — large title + overview (scrolls away) */}
        <View style={[styles.header, { paddingTop: topPad + 4 }]}>
          <View style={styles.nav}>
            <Animated.Text style={[styles.brand, { color: c.text }, largeTitleStyle]}>有数</Animated.Text>
            {/* Spacer matching floating buttons so title doesn't sit under them */}
            <View style={{ width: 84, height: 36 }} />
          </View>
          <View style={{ paddingTop: 12 }}>
            <OverviewCard
              total={overview.total}
              daily={overview.daily}
              active={overview.active}
              retired={overview.retired}
              sold={overview.sold}
            />
          </View>
        </View>

        {/* 1 — sticky: compact centered title + category / status filters */}
        <Animated.View style={[styles.sticky, { backgroundColor: c.bg }, stickyChromeStyle]}>
          <Animated.Text style={[styles.compactTitle, { color: c.text }, compactTitleStyle]}>
            有数
          </Animated.Text>
          <FilterTabs
            items={CATEGORIES}
            selected={category}
            onSelect={(id) => setCategory(id as CategoryId)}
          />
          <NativeSegmented
            values={STATUS_FILTERS.map((s) => s.label)}
            selectedIndex={statusIndex}
            onChange={(i) => setStatus(STATUS_FILTERS[i]?.id ?? 'all')}
          />
        </Animated.View>

        {/* 2 — asset grid (only this keeps scrolling once filters stick) */}
        <View style={{ paddingHorizontal: pad, paddingTop: 8, backgroundColor: c.bg }}>
          {list.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: c.text }]}>还没有这类资产</Text>
              <Text style={[styles.emptySub, { color: c.textSecondary }]}>点底部加号，把物品变成资产</Text>
            </View>
          ) : (
            rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', gap }}>
                {row.map((a) => (
                  <View key={a.id} style={{ width: cardW }}>
                    <AssetCard asset={a} onPress={() => router.push(`/asset/${a.id}`)} />
                  </View>
                ))}
                {row.length === 1 ? <View style={{ width: cardW }} /> : null}
              </View>
            ))
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  floatingActions: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    gap: 8,
  },
  header: { paddingHorizontal: 16 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 },
  brand: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  sticky: { paddingTop: 4, paddingBottom: 4, zIndex: 10 },
  compactTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    height: 22,
  },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
