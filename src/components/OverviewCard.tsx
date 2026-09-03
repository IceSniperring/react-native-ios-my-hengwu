import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '../calc';
import { radius, shadow } from '../theme';
import { useColors } from '../useColors';

type Props = {
  total: number;
  daily: number;
  active: number;
  retired: number;
  sold: number;
};

export function OverviewCard({ total, daily, active, retired, sold }: Props) {
  const c = useColors();
  const sum = active + retired + sold || 1;
  return (
    <View style={[styles.card, shadow.card, { backgroundColor: c.card }]}>
      <View style={styles.topRow}>
        <Text style={[styles.kicker, { color: c.textSecondary }]}>资产总览</Text>
        <Text style={[styles.count, { color: c.textTertiary }]}>
          {active}/{active + retired + sold}
        </Text>
      </View>
      <View style={styles.metrics}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: c.textSecondary }]}>总资产</Text>
          <Text style={[styles.value, { color: c.text }]}>{formatMoney(total)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={[styles.label, { color: c.textSecondary }]}>日均成本</Text>
          <Text style={[styles.value, { color: c.text }]}>{formatMoney(daily)}</Text>
        </View>
      </View>
      <View style={styles.bars}>
        <Bar
          label={`服役中 ${active}`}
          color={c.statusActive}
          track={c.track}
          text={c.textSecondary}
          ratio={active / sum}
        />
        <Bar
          label={`已退役 ${retired}`}
          color={c.statusRetired}
          track={c.track}
          text={c.textSecondary}
          ratio={retired / sum}
        />
        <Bar
          label={`已卖出 ${sold}`}
          color={c.statusSold}
          track={c.track}
          text={c.textSecondary}
          ratio={sold / sum}
        />
      </View>
    </View>
  );
}

function Bar({
  label,
  color,
  track,
  text,
  ratio,
}: {
  label: string;
  color: string;
  track: string;
  text: string;
  ratio: number;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.barLabel, { color: text }]}>{label}</Text>
      <View style={[styles.barTrack, { backgroundColor: track }]}>
        <View style={[styles.barFill, { width: `${Math.max(12, ratio * 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { fontSize: 13 },
  count: { fontSize: 13 },
  metrics: { flexDirection: 'row', marginTop: 10 },
  label: { fontSize: 12 },
  value: { marginTop: 4, fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bars: { flexDirection: 'row', gap: 12, marginTop: 16 },
  barLabel: { fontSize: 11, marginBottom: 6 },
  barTrack: { height: 7, borderRadius: 7, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 7 },
});
