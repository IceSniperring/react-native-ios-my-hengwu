import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '../calc';
import { shadow } from '../theme';
import { useColors } from '../useColors';

export type ShareRow = {
  id: string;
  label: string;
  value: number;
  pct: number;
};

/** Horizontal category-share pills under the lemon tabs (MVP overview). */
export function CategoryShareRow({ shares }: { shares: ShareRow[] }) {
  const c = useColors();
  if (shares.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.wrap}
      accessibilityLabel="分类占比">
      {shares.map((s) => (
        <View
          key={s.id}
          style={[styles.pill, { backgroundColor: c.surface }, shadow.card]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{s.label}</Text>
          <Text style={[styles.value, { color: c.text }]}>
            {formatMoney(s.value, 0)} · {s.pct}%
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 0 },
  row: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  label: { fontSize: 12 },
  value: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
