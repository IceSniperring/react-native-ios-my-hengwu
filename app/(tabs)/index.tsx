import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetCard } from '../../src/components/AssetCard';
import { GlassIconButton } from '../../src/components/GlassIconButton';
import { OverviewCard } from '../../src/components/OverviewCard';
import { useFilteredAssets, useOverview } from '../../src/hooks';
import { FilterTabs } from '../../src/native/FilterTabs';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';
import {
  CATEGORIES,
  STATUS_FILTERS,
  type AssetStatus,
  type CategoryId,
} from '../../src/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { width } = useWindowDimensions();
  const assets = useStore((s) => s.assets);
  const [category, setCategory] = useState<CategoryId>('all');
  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const overview = useOverview();
  const gap = 10;
  const pad = 16;
  const cardW = (width - pad * 2 - gap) / 2;
  const statusIndex = Math.max(
    0,
    STATUS_FILTERS.findIndex((s) => s.id === status),
  );

  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter(
      (cat) => cat.id === 'all' || assets.some((a) => a.category === cat.id),
    );
  }, [assets]);

  useEffect(() => {
    if (!visibleCategories.some((cat) => cat.id === category)) {
      setCategory('all');
    }
  }, [visibleCategories, category]);

  const list = useFilteredAssets(category, status);
  const rows = useMemo(() => {
    const r: (typeof list)[] = [];
    for (let i = 0; i < list.length; i += 2) r.push(list.slice(i, i + 2));
    return r;
  }, [list]);

  return (
    <View collapsable={false} style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={[styles.topChrome, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <View style={styles.topRow}>
          <Text style={[styles.compactTitle, { color: c.text }]}>有数</Text>
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
        stickyHeaderIndices={[1]}
        contentContainerStyle={{
          paddingBottom: Math.max(24, insets.bottom + 72),
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: pad, paddingTop: 4 }}>
          <Text style={[styles.brand, { color: c.text }]}>有数</Text>
          <View style={{ paddingTop: 12 }}>
            <OverviewCard
              total={overview.total}
              daily={overview.daily}
              active={overview.active}
              retired={overview.retired}
              sold={overview.sold}
            />
          </View>
          <View style={{ height: 14 }} />
        </View>

        <View style={[styles.stickyBlock, { backgroundColor: c.bg }]}>
          <FilterTabs
            items={visibleCategories}
            selected={category}
            onSelect={(id) => setCategory(id as CategoryId)}
          />
          <NativeSegmented
            values={STATUS_FILTERS.map((s) => s.label)}
            selectedIndex={statusIndex}
            onChange={(i) => setStatus(STATUS_FILTERS[i]?.id ?? 'all')}
          />
        </View>

        <Animated.View
          key={`${category}-${status}`}
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(100)}
          layout={LinearTransition.springify().damping(22).stiffness(280)}
          style={{ paddingHorizontal: pad, paddingTop: 10 }}>
          {list.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: c.text }]}>还没有这类资产</Text>
              <Text style={[styles.emptySub, { color: c.textSecondary }]}>
                点底部加号，把物品变成资产
              </Text>
            </View>
          ) : (
            rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', gap, marginBottom: gap }}>
                {row.map((a) => (
                  <AssetCard
                    key={a.id}
                    asset={a}
                    size={cardW}
                    onPress={() => router.push(`/asset/${a.id}`)}
                  />
                ))}
                {row.length === 1 ? <View style={{ width: cardW }} /> : null}
              </View>
            ))
          )}
        </Animated.View>
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
  brand: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  stickyBlock: {
    paddingBottom: 4,
    zIndex: 10,
  },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
