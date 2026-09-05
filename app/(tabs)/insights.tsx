import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import {
  addDaysISO,
  dailyCost,
  daysBetween,
  formatDaily,
  formatMoney,
  holdingDays,
  todayISO,
} from '../../src/calc';
import { Donut, DailyCostChart, SegmentedBar, StackedStatusColumn } from '../../src/components/Charts';
import { GroupedRow, GroupedSection } from '../../src/components/GroupedList';
import { LargeTitleScreen } from '../../src/components/LargeTitleScreen';
import { useOverview } from '../../src/hooks';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { LIME } from '../../src/theme';
import { useSelectableCategories } from '../../src/catalog';
import { useColors } from '../../src/useColors';

const RANGES = [
  { id: 'all', label: '全部' },
  { id: '7d', label: '7天' },
  { id: 'month', label: '本月' },
  { id: '3m', label: '3月' },
  { id: '6m', label: '半年' },
] as const;

const CAT_COLORS = [LIME, '#64D2FF', '#AF52DE', '#FF9500', '#30D158', '#FF453A'];

export default function InsightsScreen() {
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<'trend' | 'insight'>('insight');
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>('all');
  const [mode, setMode] = useState<'count' | 'price'>('price');
  const overview = useOverview();
  const catalog = useSelectableCategories();
  const c = useColors();
  const chartW = Math.max(0, width - 64);

  const filtered = useMemo(() => {
    if (range === 'all') return overview.assets;
    const days = range === '7d' ? 7 : range === 'month' ? 30 : range === '3m' ? 90 : 180;
    const from = Date.now() - days * 86400000;
    return overview.assets.filter((a) => new Date(a.purchaseDate).getTime() >= from);
  }, [overview.assets, range]);

  const catSlices = useMemo(() => {
    return catalog
      .map((cat, i) => {
        const items = filtered.filter((a) => a.category === cat.id);
        const value = mode === 'count' ? items.length : items.reduce((s, a) => s + a.purchasePrice, 0);
        return { id: cat.id, label: cat.label, value, color: CAT_COLORS[i % CAT_COLORS.length], items };
      })
      .filter((x) => x.value > 0);
  }, [filtered, mode, catalog]);

  const totalValue = catSlices.reduce((s, x) => s + x.value, 0) || 1;
  const idle = overview.assets.filter((a) => a.status === 'retired' && holdingDays(a) > 365);
  const cheapest = [...overview.assets.filter((a) => a.status === 'active')].sort(
    (a, b) => dailyCost(a) - dailyCost(b),
  )[0];
  const profitable = [...overview.assets.filter((a) => a.status === 'sold')].sort(
    (a, b) => (b.soldPrice ?? 0) - b.purchasePrice - ((a.soldPrice ?? 0) - a.purchasePrice),
  )[0];

  const statusTotal = overview.activeValue + overview.idleValue + overview.soldValue || 1;

  const series = useMemo(() => {
    const span = range === '7d' ? 7 : range === 'month' ? 30 : range === '3m' ? 90 : range === '6m' ? 180 : 60;
    const points = Math.min(12, Math.max(6, Math.round(span / 7) + 4));
    const today = todayISO();
    return Array.from({ length: points }, (_, p) => {
      const daysBack = Math.round(((points - 1 - p) * span) / Math.max(1, points - 1));
      const date = addDaysISO(today, -daysBack);
      const value = overview.assets.reduce((s, a) => {
        if (a.purchaseDate > date) return s;
        if (a.status === 'sold' && a.soldDate && a.soldDate < date) return s;
        if (a.status === 'retired' && a.retiredDate && a.retiredDate < date) return s;
        const days = daysBetween(a.purchaseDate, date);
        return s + a.purchasePrice / Math.max(1, days);
      }, 0);
      return { day: p + 1, value, date };
    });
  }, [overview.assets, range]);

  const bought = filtered.reduce((s, a) => s + a.purchasePrice, 0);

  return (
    <LargeTitleScreen
      title="洞悉"
      header={
        <>
          <NativeSegmented
            values={['趋势', '洞悉']}
            selectedIndex={tab === 'trend' ? 0 : 1}
            onChange={(i) => setTab(i === 0 ? 'trend' : 'insight')}
          />
          <NativeSegmented
            values={RANGES.map((r) => r.label)}
            selectedIndex={Math.max(0, RANGES.findIndex((r) => r.id === range))}
            onChange={(i) => setRange(RANGES[i]?.id ?? 'all')}
          />
        </>
      }>
        {tab === 'trend' ? (
          <>
            <GroupedSection header="日均成本">
              <View style={styles.pad}>
                <Text style={[styles.kicker, { color: c.textSecondary }]}>组合日均</Text>
                <Text style={[styles.big, { color: c.text }]}>{formatDaily(overview.daily)}</Text>
                <View style={{ marginTop: 12 }}>
                  {series.length >= 2 ? (
                    <DailyCostChart data={series} width={chartW} height={188} />
                  ) : (
                    <Text style={[styles.empty, { color: c.textSecondary }]}>还没有足够的记录画趋势</Text>
                  )}
                </View>
              </View>
            </GroupedSection>
            <GroupedSection header="区间购入">
              <GroupedRow icon="shippingbox" iconBg={LIME} iconTint="#1C1C1E" label="件数" value={`${filtered.length}`} chevron={false} />
              <GroupedRow icon="yensign.circle.fill" iconBg="#64D2FF" label="金额" value={formatMoney(bought, 0)} chevron={false} />
            </GroupedSection>
          </>
        ) : (
          <>
            <GroupedSection header="智能发现">
              <GroupedRow
                icon="cube"
                iconBg="#8E8E93"
                label="闲置超过 1 年"
                value={idle[0]?.name ?? '暂无'}
                onPress={() => idle[0] && router.push(`/asset/${idle[0].id}`)}
              />
              <GroupedRow
                icon="banknote"
                iconBg={LIME}
                iconTint="#1C1C1E"
                label="盈利最高"
                value={profitable?.name ?? '暂无卖出'}
                onPress={() => profitable && router.push(`/asset/${profitable.id}`)}
              />
              <GroupedRow
                icon="leaf"
                iconBg="#30D158"
                label="日均最低"
                value={cheapest?.name ?? '暂无'}
                onPress={() => cheapest && router.push(`/asset/${cheapest.id}`)}
              />
            </GroupedSection>

            <GroupedSection header="资产总值">
              <View style={styles.pad}>
                <Text style={[styles.big, { color: c.text }]}>
                  {formatMoney(overview.activeValue + overview.idleValue)}
                </Text>
                <View style={styles.statusRow}>
                  <View style={{ flex: 1, gap: 12 }}>
                    <LegendDot
                      color={LIME}
                      label={`服役中  ${Math.round((overview.activeValue / statusTotal) * 100)}%`}
                      value={formatMoney(overview.activeValue)}
                      text={c.text}
                      muted={c.textSecondary}
                    />
                    <LegendDot
                      color={c.teal}
                      label={`闲置中  ${Math.round((overview.idleValue / statusTotal) * 100)}%`}
                      value={formatMoney(overview.idleValue)}
                      text={c.text}
                      muted={c.textSecondary}
                    />
                    <LegendDot
                      color={c.orange}
                      label={`已卖出  ${Math.round((overview.soldValue / statusTotal) * 100)}%`}
                      value={formatMoney(overview.soldValue)}
                      text={c.text}
                      muted={c.textSecondary}
                    />
                  </View>
                  <StackedStatusColumn
                    active={overview.activeValue}
                    idle={overview.idleValue}
                    sold={overview.soldValue}
                  />
                </View>
              </View>
            </GroupedSection>

            <GroupedSection header="资产类型分布">
              <View style={styles.pad}>
                <View style={styles.cardHead}>
                  <Text style={[styles.mid, { color: c.text }]}>
                    {mode === 'price' ? formatMoney(totalValue) : `${filtered.length} 件`}
                  </Text>
                  <View style={{ width: 148 }}>
                    <NativeSegmented
                      compact
                      values={['数量', '价格']}
                      selectedIndex={mode === 'count' ? 0 : 1}
                      onChange={(i) => setMode(i === 0 ? 'count' : 'price')}
                    />
                  </View>
                </View>
                {catSlices.length === 0 ? (
                  <Text style={[styles.empty, { color: c.textSecondary }]}>这个区间还没有资产</Text>
                ) : (
                  <>
                    <View style={{ marginTop: 12 }}>
                      <SegmentedBar items={catSlices} />
                    </View>
                    <View style={{ marginTop: 14, gap: 10 }}>
                      {catSlices.map((s) => (
                        <View key={s.id} style={styles.catRow}>
                          <View style={[styles.swatch, { backgroundColor: s.color }]} />
                          <Text style={{ flex: 1, color: c.text, fontSize: 15 }}>
                            {s.label}  {Math.round((s.value / totalValue) * 100)}%
                          </Text>
                          <Text style={{ fontWeight: '600', color: c.text, fontVariant: ['tabular-nums'] }}>
                            {mode === 'price' ? formatMoney(s.value) : `${s.value}件`}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 18 }}>
                      <Donut slices={catSlices} size={Math.min(180, width - 80)} center={`${filtered.length}`} />
                    </View>
                  </>
                )}
              </View>
            </GroupedSection>
          </>
        )}
    </LargeTitleScreen>
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
      <Text style={{ fontSize: 17, fontWeight: '700', marginTop: 2, marginLeft: 14, color: text, fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 16, paddingVertical: 14 },
  kicker: { fontSize: 13 },
  big: { fontSize: 28, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  mid: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  empty: { textAlign: 'center', paddingVertical: 24, fontSize: 15 },
  statusRow: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
});
