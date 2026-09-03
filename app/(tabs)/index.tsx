import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetCard } from '../../src/components/AssetCard';
import { OverviewCard } from '../../src/components/OverviewCard';
import { useFilteredAssets, useOverview } from '../../src/hooks';
import { FilterTabs } from '../../src/native/FilterTabs';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { useColors } from '../../src/useColors';
import { CATEGORIES, STATUS_FILTERS, type AssetStatus, type CategoryId } from '../../src/types';

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

  const rows = useMemo(() => {
    const r: (typeof list)[] = [];
    for (let i = 0; i < list.length; i += 2) r.push(list.slice(i, i + 2));
    return r;
  }, [list]);

  return (
    <View collapsable={false} style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={{
          paddingBottom: Math.max(24, insets.bottom + 72),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.nav}>
            <Text style={[styles.brand, { color: c.text }]}>有数</Text>
            <View style={styles.navRight}>
              <Pressable
                onPress={() => router.push('/search')}
                hitSlop={8}
                style={[styles.iconBtn, { backgroundColor: c.fill }]}>
                <SymbolView name="magnifyingglass" size={18} tintColor={c.tint} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/calendar')}
                hitSlop={8}
                style={[styles.iconBtn, { backgroundColor: c.fill }]}>
                <SymbolView name="calendar" size={18} tintColor={c.tint} />
              </Pressable>
            </View>
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

        <View style={[styles.sheet, { backgroundColor: c.bg }]}>
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

          <View style={{ paddingHorizontal: pad, paddingTop: 8 }}>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  navRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: { minHeight: 0, paddingTop: 8 },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
