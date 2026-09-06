import { useState } from 'react';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { formatMoney } from '../calc';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  total: number;
  holdingCost: number;
  daily: number;
  active: number;
  retired: number;
  sold: number;
};

/** MVP overview stamp: r24, big net-worth, cost metrics, green/orange/gray bars. */
export function OverviewCard({ total, holdingCost, daily, active, retired, sold }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const totalCount = active + retired + sold;
  const sum = totalCount || 1;
  const paper = c.surface;
  const dashColor = scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const pillBg = scheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const insetBorder = scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';

  return (
    <View style={[styles.card, { backgroundColor: paper }]}>
      <View pointerEvents="none" style={[styles.insetDash, { borderColor: insetBorder }]} />
      <Text pointerEvents="none" style={[styles.watermark, { color: c.lemon }]}>
        有数
      </Text>

      <View style={styles.topRow}>
        <Text style={[styles.kicker, { color: c.textSecondary }]}>资产总览</Text>
        <View style={[styles.pill, { backgroundColor: pillBg }]}>
          <Text style={[styles.pillText, { color: c.textTertiary }]}>
            {totalCount} 件 · 服役 {active}
          </Text>
        </View>
      </View>

      <View style={styles.netWorth}>
        <Text style={[styles.label, { color: c.textSecondary }]}>总净资产</Text>
        <Text style={[styles.netValue, { color: c.text }]}>{formatMoney(total, 0)}</Text>
      </View>

      <View style={styles.metrics}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.label, { color: c.textSecondary }]}>持有成本</Text>
          <Text style={[styles.metricValue, { color: c.text }]}>{formatMoney(holdingCost, 0)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={[styles.label, { color: c.textSecondary }]}>日均成本</Text>
          <Text style={[styles.metricValue, { color: c.text }]}>{formatMoney(daily)}</Text>
        </View>
      </View>

      <DashedRule color={dashColor} notchColor={c.bg} />

      <View style={styles.statusRow}>
        <StatusColumn
          label="服役中"
          count={active}
          ratio={active / sum}
          fill={c.statusActive}
          track={c.track}
          labelColor={c.textSecondary}
        />
        <StatusColumn
          label="已退役"
          count={retired}
          ratio={retired / sum}
          fill={c.statusRetired}
          track={c.track}
          labelColor={c.textSecondary}
        />
        <StatusColumn
          label="已卖出"
          count={sold}
          ratio={sold / sum}
          fill={c.statusSold}
          track={c.track}
          labelColor={c.textSecondary}
        />
      </View>
    </View>
  );
}

function DashedRule({ color, notchColor }: { color: string; notchColor: string }) {
  const [w, setW] = useState(0);
  const r = 7;
  const top = 9 - r;
  const bottom = 9 + r;
  return (
    <View
      style={styles.dashWrap}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width;
        if (next !== w) setW(next);
      }}>
      {w > 0 ? (
        <Svg width={w} height={18}>
          <Path d={`M0,${top} A${r},${r} 0 0,1 0,${bottom} Z`} fill={notchColor} />
          <Path d={`M${w},${top} A${r},${r} 0 0,0 ${w},${bottom} Z`} fill={notchColor} />
          <Line
            x1={r + 2}
            y1={9}
            x2={w - r - 2}
            y2={9}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        </Svg>
      ) : null}
    </View>
  );
}

function StatusColumn({
  label,
  count,
  ratio,
  fill,
  track,
  labelColor,
}: {
  label: string;
  count: number;
  ratio: number;
  fill: string;
  track: string;
  labelColor: string;
}) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  const fillWidth = (pct + '%') as DimensionValue;
  return (
    <View style={styles.statusColumn}>
      <Text style={[styles.statusLabel, { color: labelColor }]} numberOfLines={1}>
        {label} {count}
      </Text>
      <View style={[styles.columnTrack, { backgroundColor: track }]}>
        {pct > 0 ? (
          <View style={[styles.columnFill, { width: fillWidth, backgroundColor: fill }]} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  insetDash: {
    ...StyleSheet.absoluteFillObject,
    margin: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  watermark: {
    position: 'absolute',
    right: -6,
    bottom: 4,
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: 4,
    opacity: 0.12,
    transform: [{ rotate: '-12deg' }],
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 },
  kicker: { fontSize: 13, fontWeight: '500' },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  netWorth: { marginTop: 10, zIndex: 1 },
  label: { fontSize: 12 },
  netValue: {
    marginTop: 4,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
    lineHeight: 40,
  },
  metrics: { flexDirection: 'row', marginTop: 14, zIndex: 1 },
  metricValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  dashWrap: {
    marginTop: 4,
    marginBottom: 4,
    marginHorizontal: -18,
    height: 18,
    justifyContent: 'center',
    zIndex: 1,
  },
  statusRow: { flexDirection: 'row', gap: 10, zIndex: 1 },
  statusColumn: { flex: 1 },
  statusLabel: { fontSize: 11, marginBottom: 6 },
  columnTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  columnFill: { height: '100%', borderRadius: 2 },
});
