import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PagerView, { type PagerViewOnPageScrollEvent } from 'react-native-pager-view';
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
import { useSharedValue } from 'react-native-reanimated';

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
  const pageOffset = useSharedValue(0);
  const pagerRef = useRef<PagerView>(null);
  const syncingFromTab = useRef(false);

  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter(
      (cat) => cat.id === 'all' || assets.some((a) => a.category === cat.id),
    );
  }, [assets]);

  useEffect(() => {
    if (!visibleCategories.some((cat) => cat.id === category)) {
      setCategory('all');
      syncingFromTab.current = true;
      pagerRef.current?.setPage(0);
      pageOffset.value = 0;
    }
  }, [visibleCategories, category, pageOffset]);

  const categoryIndex = Math.max(
    0,
    visibleCategories.findIndex((cat) => cat.id === category),
  );

  const selectCategory = (id: CategoryId) => {
    setCategory(id);
    const idx = visibleCategories.findIndex((cat) => cat.id === id);
    if (idx >= 0) {
      syncingFromTab.current = true;
      pagerRef.current?.setPage(idx);
    }
  };

  const onPageScroll = (e: PagerViewOnPageScrollEvent) => {
    const { position, offset } = e.nativeEvent;
    pageOffset.value = position + offset;
  };

  const onPageSelected = (e: { nativeEvent: { position: number } }) => {
    const id = visibleCategories[e.nativeEvent.position]?.id;
    if (id && id !== category) setCategory(id);
    syncingFromTab.current = false;
  };

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

      <View style={styles.header}>
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
      </View>

      <View style={[styles.tabsBlock, { backgroundColor: c.bg }]}>
        <FilterTabs
          items={visibleCategories}
          selected={category}
          onSelect={(id) => selectCategory(id as CategoryId)}
          pageOffset={pageOffset}
        />
        <NativeSegmented
          values={STATUS_FILTERS.map((s) => s.label)}
          selectedIndex={statusIndex}
          onChange={(i) => setStatus(STATUS_FILTERS[i]?.id ?? 'all')}
        />
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={categoryIndex}
        onPageScroll={onPageScroll}
        onPageSelected={onPageSelected}>
        {visibleCategories.map((cat) => (
          <View key={cat.id} style={{ flex: 1 }}>
            <CategoryPage category={cat.id} status={status} cardW={cardW} gap={gap} pad={pad} />
          </View>
        ))}
      </PagerView>
    </View>
  );
}

function CategoryPage({
  category,
  status,
  cardW,
  gap,
  pad,
}: {
  category: CategoryId;
  status: AssetStatus | 'all';
  cardW: number;
  gap: number;
  pad: number;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const list = useFilteredAssets(category, status);
  const rows = useMemo(() => {
    const r: (typeof list)[] = [];
    for (let i = 0; i < list.length; i += 2) r.push(list.slice(i, i + 2));
    return r;
  }, [list]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: pad,
        paddingTop: 10,
        paddingBottom: Math.max(24, insets.bottom + 72),
      }}
      showsVerticalScrollIndicator={false}>
      {list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>还没有这类资产</Text>
          <Text style={[styles.emptySub, { color: c.textSecondary }]}>点底部加号，把物品变成资产</Text>
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
    </ScrollView>
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
  tabsBlock: {
    paddingBottom: 4,
  },
  pager: { flex: 1 },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
