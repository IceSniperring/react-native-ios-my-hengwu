import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { daysBetween, formatDaily, formatMoney, todayISO } from '../../src/calc';
import { useAsset } from '../../src/hooks';
import { NativeDateField } from '../../src/native/NativeDateField';
import { useStore } from '../../src/store';
import { radius } from '../../src/theme';
import { useColors } from '../../src/useColors';

export default function SellScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const asset = useAsset(id);
  const updateAsset = useStore((s) => s.updateAsset);
  const [price, setPrice] = useState(asset ? String(Math.round(asset.purchasePrice * 0.6)) : '');
  const [date, setDate] = useState(todayISO());

  const preview = useMemo(() => {
    if (!asset) return null;
    const soldPrice = Number(price) || 0;
    const days = Math.max(1, daysBetween(asset.purchaseDate, date));
    const pnl = soldPrice - asset.purchasePrice;
    const trueDaily = (asset.purchasePrice - soldPrice) / days;
    return { soldPrice, days, pnl, trueDaily };
  }, [asset, price, date]);

  if (!asset || !preview) return null;

  const confirm = () => {
    if (!Number(price) && Number(price) !== 0) return Alert.alert('请填写卖出价');
    updateAsset(asset.id, {
      status: 'sold',
      soldPrice: preview.soldPrice,
      soldDate: date,
    });
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Stack.Screen
        options={{
          title: '卖出复盘',
          headerRight: () => (
            <Pressable onPress={confirm} hitSlop={8}>
              <Text style={{ color: c.limeDark, fontSize: 17, fontWeight: '600' }}>确认</Text>
            </Pressable>
          ),
        }}
      />
      <Text style={[styles.name, { color: c.text }]}>{asset.name}</Text>
      <Text style={[styles.buy, { color: c.textSecondary }]}>买入 {formatMoney(asset.purchasePrice, 0)}</Text>

      <Text style={[styles.label, { color: c.textSecondary }]}>卖出价格</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        style={[styles.input, { backgroundColor: c.input, color: c.text }]}
        placeholder="0"
        placeholderTextColor={c.textTertiary}
      />
      <NativeDateField label="卖出日期" value={date} onChange={setDate} />

      <View style={[styles.card, { backgroundColor: c.input }]}>
        <Row label="持有天数" value={`${preview.days} 天`} />
        <Row label="盈亏" value={formatMoney(preview.pnl, 0)} danger={preview.pnl < 0} />
        <Row label="真实日耗" value={formatDaily(preview.trueDaily)} />
      </View>

      <Pressable onPress={confirm} style={[styles.cta, { backgroundColor: c.lime }]}>
        <Text style={styles.ctaText}>确认卖出</Text>
      </Pressable>
    </View>
  );
}

function SellRowText({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  const c = useColors();
  return (
    <>
      <Text style={{ color: c.textSecondary }}>{label}</Text>
      <Text style={{ fontWeight: '800', color: danger ? c.danger : c.text }}>{value}</Text>
    </>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
      <SellRowText label={label} value={value} danger={danger} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  buy: { marginTop: 4, marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  card: { borderRadius: radius.lg, paddingHorizontal: 16, marginTop: 8 },
  cta: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontWeight: '800', fontSize: 16 },
});
