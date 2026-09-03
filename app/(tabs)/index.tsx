import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
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

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = e.nativeEvent.contentOffset.y;
  };

  // Large title in the scrolling header fades / drifts as you scroll.
  const largeTitleStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [0, COLLAPSE], [0, 1], Extrapolation.CLAMP);
    const travel = (width - pad * 2) / 2 - 40;
    return {
      opacity: interpolate(progress, [0, 0.85], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: progress * travel },
        { scale: interpolate(progress, [0, 1], [1, 0.55], Extrapolation.CLAMP) },
      ],
    };
  });

  // Compact title lives in the FIXED top bar (above ScrollView), so sticky
  // category tabs always sit *below*「有数」— never climb over it.
  const compactTitleStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [COLLAPSE * 0.45, COLLAPSE], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: progress,
    };
  });

  return (
    <View collapsable={false} style={[styles.root, { backgroundColor: c.bg }]}>
      {/* Fixed chrome: title + search/calendar — always above sticky filters */}
      <View style={[styles.topChrome, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <View style={styles.topRow}>
          <Animated.Text style={[styles.compactTitle, { color: c.text }, compactTitleStyle]}>
            有数
          </Animated.Text>
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

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        contentInsetAdjustmentBehavior="never"
        style={{ backgroundColor: c.bg, flex: 1 }}
        contentContainerStyle={{
          paddingBottom: Math.max(24, insets.bottom + 72),
        }}
        showsVerticalScrollIndicator={false}
        bounces>
        {/* 0 — large title + overview (scrolls away) */}
        <View style={styles.header} collapsable={false}>
          <Animated.Text style={[styles.brand, { color: c.text }, largeTitleStyle]}>有数</Animated.Text>
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

        {/* 1 — sticky: 分类 → 状态（永远在固定标题栏下方） */}
        <View
          collapsable={false}
          style={[styles.sticky, { backgroundColor: c.bg, borderBottomColor: c.line }]}>
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
        </View>

        {/* 2 — asset grid */}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topChrome: {
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  topRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  compactTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  header: { paddingHorizontal: 16, paddingTop: 4 },
  brand: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  sticky: {
    paddingTop: 4,
    paddingBottom: 4,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
