import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '../src/calc';
import { useStore } from '../src/store';
import { useColors } from '../src/useColors';

export default function CalendarScreen() {
  const c = useColors();
  const assets = useStore((s) => s.assets);
  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth());

  const grouped = useMemo(() => {
    const map = new Map<string, typeof assets>();
    assets.forEach((a) => {
      const key = a.purchaseDate;
      map.set(key, [...(map.get(key) ?? []), a]);
    });
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [assets]);

  const prefix = `${y}-${`${m + 1}`.padStart(2, '0')}`;
  const monthItems = grouped.filter(([d]) => d.startsWith(prefix));

  const shift = (dir: number) => {
    const d = new Date(y, m + dir, 1);
    setY(d.getFullYear());
    setM(d.getMonth());
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={styles.monthRow}>
        <Pressable onPress={() => shift(-1)} style={styles.iconBtn}>
          <SymbolView name="chevron.left" size={18} tintColor={c.text} />
        </Pressable>
        <Text style={[styles.month, { color: c.text }]}>
          {y}年{m + 1}月
        </Text>
        <Pressable onPress={() => shift(1)} style={styles.iconBtn}>
          <SymbolView name="chevron.right" size={18} tintColor={c.text} />
        </Pressable>
      </View>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16 }}>
        {monthItems.length === 0 ? <Text style={[styles.empty, { color: c.textSecondary }]}>这个月没有购入记录</Text> : null}
        {monthItems.map(([date, items]) => (
          <View key={date} style={styles.block}>
            <Text style={[styles.date, { color: c.textSecondary }]}>{date}</Text>
            {items.map((a) => (
              <Pressable key={a.id} onPress={() => router.push(`/asset/${a.id}`)} style={[styles.row, { borderBottomColor: c.line }]}>
                <Text style={[styles.name, { color: c.text }]}>{a.name}</Text>
                <Text style={[styles.price, { color: c.text }]}>{formatMoney(a.purchasePrice, 0)}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  month: { fontSize: 18, fontWeight: '800' },
  empty: { textAlign: 'center', marginTop: 24 },
  block: { marginBottom: 16 },
  date: { marginBottom: 8, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EFEFEF',
  },
  name: { flex: 1, fontWeight: '700' },
  price: { fontWeight: '800' },
});
