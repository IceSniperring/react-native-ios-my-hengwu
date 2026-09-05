import { router, useLocalSearchParams } from 'expo-router';
import { PlatformIcon } from '../../src/native/PlatformIcon';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  dailyCost,
  dailyCostHistory,
  formatMoney,
  holdingDays,
  parseISO,
} from '../../src/calc';
import { DailyCostChart } from '../../src/components/Charts';
import { GlassIconButton } from '../../src/components/GlassIconButton';
import { StickerImage } from '../../src/components/StickerImage';
import { useAsset } from '../../src/hooks';

import { useCategoryLabel } from '../../src/catalog';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

function formatChineseDate(iso: string): string {
  const d = parseISO(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function AssetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const asset = useAsset(id);
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const removeAsset = useStore((s) => s.removeAsset);
  const categoryLabel = useCategoryLabel(asset?.category ?? '');

  if (!asset) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 20, backgroundColor: c.bg }]}>
        <Text style={{ textAlign: 'center', color: c.textSecondary }}>资产不存在</Text>
      </View>
    );
  }

  const cost = dailyCost(asset);
  const days = holdingDays(asset);
  const history = dailyCostHistory(asset, 6);
  const cardBg = c.card;

  const del = () => {
    Alert.alert('删除资产', '删除后无法恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认删除',
        style: 'destructive',
        onPress: () => {
          removeAsset(asset.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <StickerImage imageKey={asset.imageKey} imageUri={asset.imageUri} size={108} radius={22} />
        </View>

        <Text style={[styles.name, { color: c.text }]}>{asset.name}</Text>
        <Text style={[styles.dailyCost, { color: c.text }]}>
          <Text style={styles.dailySymbol}>¥</Text>
          {cost.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <Text style={[styles.dailyUnit, { color: c.textSecondary }]}>/天</Text>
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          总价：{formatMoney(asset.purchasePrice, 2)}  |  已服役 {days} 天
        </Text>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>日均成本</Text>
          <DailyCostChart data={history} width={width - 64} height={196} />
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <InfoRow label="价格" value={formatMoney(asset.purchasePrice, 2)} c={c} />
          <InfoRow label="类别" value={categoryLabel} c={c} />
          <InfoRow label="购买日期" value={formatChineseDate(asset.purchaseDate)} c={c} last />
        </View>

        <Pressable style={styles.deleteBtn} onPress={del}>
          <PlatformIcon name="trash" size={16} color={c.danger} />
          <Text style={[styles.deleteText, { color: c.danger }]}>删除</Text>
        </Pressable>
      </ScrollView>
      <View pointerEvents="box-none" style={[styles.chrome, { paddingTop: insets.top + 6 }]}>
        <GlassIconButton name="xmark" size={40} accessibilityLabel="关闭" onPress={() => router.back()} />
        <GlassIconButton
          name="pencil"
          size={40}
          accessibilityLabel="编辑"
          onPress={() => router.push({ pathname: '/asset/form', params: { id: asset.id } })}
        />
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  c,
  last,
}: {
  label: string;
  value: string;
  c: { text: string; textSecondary: string; line: string };
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
      ]}>
      <Text style={[styles.infoLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center', marginTop: 4, marginBottom: 12 },
  name: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
    paddingHorizontal: 32,
  },
  dailyCost: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: -0.6,
  },
  dailySymbol: { fontSize: 20, fontWeight: '700' },
  dailyUnit: { fontSize: 16, fontWeight: '500' },
  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 0.1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15, fontWeight: '500' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
    paddingVertical: 12,
  },
  deleteText: { fontSize: 16, fontWeight: '500' },
});
