import { useState } from 'react';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

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
  const paper = c.card;
  const dashColor = scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
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

      <DashedRule color={dashColor} notchColor={c.bg} />

      {/* Three independent columns, each with its own label and share bar. */}
      <View style={styles.statusRow}>
        <StatusColumn
          label="服役中"
          count={active}
          ratio={active / sum}
          fill={LIME}
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
  // Box is w × 18 with the dash centreline at y = 9. Each card edge carries a
  // ticket-style tear notch: a semicircular bite (radius 7) centred on the
  // dash line, painted in the page colour so the background shows through.
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
    marginTop: 4,
    marginBottom: 4,
    marginHorizontal: -16,
    height: 18,
    justifyContent: 'center',
  },
  statusRow: { flexDirection: 'row', gap: 12 },
  statusColumn: { flex: 1 },
  statusLabel: { fontSize: 11, marginBottom: 8 },
  columnTrack: { height: 5, borderRadius: 999, overflow: 'hidden' },
  columnFill: { height: '100%', borderRadius: 999 },
});
