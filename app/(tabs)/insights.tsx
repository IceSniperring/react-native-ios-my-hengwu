import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dailyCost, formatMoney, holdingDays } from '../../src/calc';
import { Donut, SegmentedBar, StackedStatusColumn } from '../../src/components/Charts';
import { useOverview } from '../../src/hooks';
import { FilterTabs } from '../../src/native/FilterTabs';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { radius } from '../../src/theme';
import { CATEGORIES } from '../../src/types';
import { useColors } from '../../src/useColors';

const RANGES = [
  { id: 'all', label: '全部' },
  { id: 'month', label: '本月' },
  { id: '7d', label: '近7天' },
  { id: '3m', label: '近3月' },
  { id: '6m', label: '近半年' },
] as const;

const CAT_COLORS_LIGHT = ['#C8F04D', '#3EE0C8', '#5B8CFF', '#A78BFA', '#FF8A3A', '#F5C400'];

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<'trend' | 'insight'>('insight');
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>('all');
  const [mode, setMode] = useState<'count' | 'price'>('price');
  const overview = useOverview();
  const c = useColors();
  const CAT_COLORS = CAT_COLORS_LIGHT;

  const filtered = useMemo(() => {
    if (range === 'all') return overview.assets;
    const days = range === '7d' ? 7 : range === 'month' ? 30 : range === '3m' ? 90 : 180;
    const from = Date.now() - days * 86400000;
    return overview.assets.filter((a) => new Date(a.purchaseDate).getTime() >= from);
  }, [overview.assets, range]);

  const catSlices = useMemo(() => {
    return CATEGORIES.filter((c) => c.id !== 'all')
      .map((c, i) => {
        const items = filtered.filter((a) => a.category === c.id);
        const value = mode === 'count' ? items.length : items.reduce((s, a) => s + a.purchasePrice, 0);
        return { id: c.id, label: c.label, value, color: CAT_COLORS[i % CAT_COLORS.length], items };
      })
      .filter((x) => x.value > 0);
  }, [filtered, mode]);

  const totalValue = catSlices.reduce((s, x) => s + x.value, 0) || 1;
  const idle = overview.assets.filter((a) => a.status === 'retired' && holdingDays(a) > 365);
  const cheapest = [...overview.assets.filter((a) => a.status === 'active')].sort(
    (a, b) => dailyCost(a) - dailyCost(b),
  )[0];
  const profitable = [...overview.assets.filter((a) => a.status === 'sold')].sort(
    (a, b) => (b.soldPrice ?? 0) - b.purchasePrice - ((a.soldPrice ?? 0) - a.purchasePrice),
  )[0];

  const statusTotal = overview.activeValue + overview.idleValue + overview.soldValue || 1;

  return (
    <View collapsable={false} style={[styles.root, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <FilterTabs
        items={[
          { id: 'trend', label: '趋势' },
          { id: 'insight', label: '洞悉' },
        ]}
        selected={tab}
        onSelect={(id) => setTab(id as 'trend' | 'insight')}
      />
      <FilterTabs
        items={RANGES.map((r) => ({ id: r.id, label: r.label }))}
        selected={range}
        onSelect={(id) => setRange(id as (typeof RANGES)[number]['id'])}
      />

      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
          <Text style={[styles.smart, { color: c.limeDark }]}>✦ 智能发现</Text>
          <InsightRow
            icon="cube"
            title="闲置超过 1 年"
            value={idle[0]?.name ?? '暂无'}
            onPress={() => idle[0] && router.push(`/asset/${idle[0].id}`)}
          />
          <InsightRow
            icon="banknote"
            title="盈利最高物品"
            value={profitable?.name ?? '暂无卖出'}
            onPress={() => profitable && router.push(`/asset/${profitable.id}`)}
          />
          <InsightRow
            icon="leaf"
            title="日均最低（最划算）"
            value={cheapest ? `${cheapest.name}` : '暂无'}
            onPress={() => cheapest && router.push(`/asset/${cheapest.id}`)}
          />
        </View>

        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
          <Text style={[styles.kicker, { color: c.textSecondary }]}>资产总值</Text>
          <Text style={[styles.big, { color: c.text }]}>{formatMoney(overview.activeValue + overview.idleValue)}</Text>
          <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 10 }}>
              <LegendDot color={c.lime} label={`使用中  ${Math.round((overview.activeValue / statusTotal) * 100)}%`} value={formatMoney(overview.activeValue)} text={c.text} muted={c.textSecondary} />
              <LegendDot color={c.teal} label={`闲置中  ${Math.round((overview.idleValue / statusTotal) * 100)}%`} value={formatMoney(overview.idleValue)} text={c.text} muted={c.textSecondary} />
              <LegendDot color={c.orange} label={`已卖出  ${Math.round((overview.soldValue / statusTotal) * 100)}%`} value={formatMoney(overview.soldValue)} text={c.text} muted={c.textSecondary} />
            </View>
            <StackedStatusColumn active={overview.activeValue} idle={overview.idleValue} sold={overview.soldValue} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: c.text }]}>资产类型分布</Text>
            <View style={{ width: 168 }}>
              <NativeSegmented
                compact
                values={['按数量', '按价格']}
                selectedIndex={mode === 'count' ? 0 : 1}
                onChange={(i) => setMode(i === 0 ? 'count' : 'price')}
              />
            </View>
          </View>
          <Text style={[styles.kicker, { color: c.textSecondary }]}>{mode === 'price' ? '总价值' : '总件数'}</Text>
          <Text style={[styles.mid, { color: c.text }]}>
            {mode === 'price' ? formatMoney(totalValue) : `${filtered.length}`}
          </Text>
          <View style={{ marginTop: 12 }}>
            <SegmentedBar items={catSlices} />
          </View>
          <View style={{ marginTop: 16, gap: 10 }}>
            {catSlices.map((s) => (
              <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color, marginRight: 8 }} />
                <Text style={{ flex: 1, color: c.text }}>{s.label}  {Math.round((s.value / totalValue) * 100)}%</Text>
                <Text style={{ fontWeight: '700', color: c.text }}>{mode === 'price' ? formatMoney(s.value) : `${s.value}件`}</Text>
              </View>
            ))}
          </View>
          <View style={{ alignItems: 'center', marginTop: 18 }}>
            <Donut
              slices={catSlices}
              size={Math.min(180, width - 80)}
              center={`${filtered.length}`}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InsightRow({
  icon,
  title,
  value,
  onPress,
}: {
  icon: 'cube' | 'banknote' | 'leaf';
  title: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <InsightRowInner icon={icon} title={title} value={value} onPress={onPress} />
  );
}

function InsightRowInner({
  icon,
  title,
  value,
  onPress,
}: {
  icon: 'cube' | 'banknote' | 'leaf';
  title: string;
  value: string;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.iRow, { borderBottomColor: c.line }]}>
      <SymbolView name={icon} size={18} tintColor={c.text} />
      <Text style={[styles.iTitle, { color: c.textSecondary }]}>{title}</Text>
      <Text style={[styles.iVal, { color: c.text }]} numberOfLines={1}>
        {value}  ›
      </Text>
    </Pressable>
  );
}

function LegendDot({
  color,
  label,
  value,
  text,
  muted,
}: {
  color: string;
  label: string;
  value: string;
  text: string;
  muted: string;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ fontSize: 12, color: muted }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '800', marginTop: 2, marginLeft: 14, color: text }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  smart: { fontWeight: '800', marginBottom: 8 },
  iRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  iTitle: { flex: 1, fontSize: 13 },
  iVal: { maxWidth: 140, fontWeight: '700' },
  kicker: { fontSize: 13 },
  big: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  mid: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
});
