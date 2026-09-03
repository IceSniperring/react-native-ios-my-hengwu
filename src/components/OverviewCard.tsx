import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { formatMoney } from '../calc';
import { LIME } from '../theme';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  total: number;
  daily: number;
  active: number;
  retired: number;
  sold: number;
};

/** Reference-matched overview: rounded card, pill count, dashed rule, single segmented track. */
export function OverviewCard({ total, daily, active, retired, sold }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const totalCount = active + retired + sold;
  const sum = totalCount || 1;
  const paper = scheme === 'dark' ? '#1C1C1E' : '#FFFFFF';
  const dashColor = scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  const pillBg = scheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.card, { backgroundColor: paper }]}>
      <View style={styles.topRow}>
        <Text style={[styles.kicker, { color: c.textSecondary }]}>资产总览</Text>
        <View style={[styles.pill, { backgroundColor: pillBg }]}>
          <Text style={[styles.pillText, { color: c.textTertiary }]}>
            {active}/{totalCount}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.label, { color: c.textSecondary }]}>总资产</Text>
          <Text style={[styles.value, { color: c.text }]}>{formatMoney(total)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={[styles.label, { color: c.textSecondary }]}>日均成本</Text>
          <Text style={[styles.value, { color: c.text }]}>{formatMoney(daily)}</Text>
        </View>
      </View>

      <DashedRule color={dashColor} />

      <View style={styles.statusLabels}>
        <Text style={[styles.statusLabel, { color: c.textSecondary }]}>服役中 {active}</Text>
        <Text style={[styles.statusLabel, { color: c.textSecondary, textAlign: 'center' }]}>
          已退役 {retired}
        </Text>
        <Text style={[styles.statusLabel, { color: c.textSecondary, textAlign: 'right' }]}>
          已卖出 {sold}
        </Text>
      </View>
      <View style={[styles.segmentTrack, { backgroundColor: c.track }]}>
        <Seg ratio={active / sum} color={LIME} />
        <Seg ratio={retired / sum} color={c.statusRetired} />
        <Seg ratio={sold / sum} color={c.statusSold} />
      </View>
    </View>
  );
}

function DashedRule({ color }: { color: string }) {
  const [w, setW] = useState(0);
  return (
    <View
      style={styles.dashWrap}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width;
        if (next !== w) setW(next);
      }}>
      {w > 0 ? (
        <Svg width={w} height={2}>
          <Line
            x1={0}
            y1={1}
            x2={w}
            y2={1}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        </Svg>
      ) : null}
    </View>
  );
}

function Seg({ ratio, color }: { ratio: number; color: string }) {
  if (ratio <= 0) return null;
  return (
    <View
      style={{
        flex: Math.max(ratio, 0.04),
        height: 5,
        backgroundColor: color,
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { fontSize: 13 },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  metrics: { flexDirection: 'row', marginTop: 12 },
  label: { fontSize: 12 },
  value: { marginTop: 4, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  dashWrap: {
    marginTop: 12,
    marginBottom: 12,
    height: 2,
    justifyContent: 'center',
  },
  statusLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusLabel: { flex: 1, fontSize: 11 },
  segmentTrack: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
