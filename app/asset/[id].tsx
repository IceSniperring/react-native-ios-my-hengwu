import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showNativeSheet } from '../../src/native/sheet';

import {
  dailyCost,
  dailyCostHistory,
  expectedFinishISO,
  formatDaily,
  formatMoney,
  holdingDays,
  remainingDays,
  targetProgress,
} from '../../src/calc';
import { DailyCostChart } from '../../src/components/Charts';
import { CostBar } from '../../src/components/CostBar';
import { useAsset } from '../../src/hooks';
import { PRODUCT_IMAGES } from '../../src/images';
import { useStore } from '../../src/store';
import { radius } from '../../src/theme';
import { STATUS_LABEL } from '../../src/types';
import { useColors } from '../../src/useColors';

export default function AssetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const asset = useAsset(id);
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const removeAsset = useStore((s) => s.removeAsset);
  const updateAsset = useStore((s) => s.updateAsset);

  if (!asset) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
        <Text style={{ textAlign: 'center' }}>资产不存在</Text>
      </View>
    );
  }

  const source = asset.imageUri
    ? { uri: asset.imageUri }
    : asset.imageKey
      ? PRODUCT_IMAGES[asset.imageKey]
      : undefined;
  const cost = dailyCost(asset);
  const days = holdingDays(asset);
  const remain = remainingDays(asset);
  const progress = targetProgress(asset);
  const history = dailyCostHistory(asset, 14);

  const retire = () => {
    updateAsset(asset.id, { status: 'retired', retiredDate: new Date().toISOString().slice(0, 10) });
  };

  const del = () => {
    removeAsset(asset.id);
    router.back();
  };

  const more = () => {
    const items =
      asset.status === 'active'
        ? [
            { label: '编辑', onPress: () => router.push({ pathname: '/asset/form', params: { id: asset.id } }) },
            { label: '标记退役', onPress: retire },
            { label: '卖出复盘', onPress: () => router.push({ pathname: '/asset/sell', params: { id: asset.id } }) },
            { label: '删除资产', destructive: true, onPress: del },
          ]
        : [
            { label: '编辑', onPress: () => router.push({ pathname: '/asset/form', params: { id: asset.id } }) },
            {
              label: '恢复服役',
              onPress: () =>
                updateAsset(asset.id, {
                  status: 'active',
                  soldDate: undefined,
                  soldPrice: undefined,
                  retiredDate: undefined,
                }),
            },
            { label: '删除资产', destructive: true, onPress: del },
          ];
    showNativeSheet({ title: asset.name, items });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <Stack.Screen
        options={{
          title: asset.name,
          headerRight: () => (
            <Pressable onPress={more} hitSlop={8}>
              <SymbolView name="ellipsis.circle" size={22} tintColor={c.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          {source ? (
            <Image source={source} style={styles.heroImg} contentFit="contain" />
          ) : (
            <View style={[styles.heroImg, { backgroundColor: c.imageBg, borderColor: c.card }]} />
          )}
        </View>

        <Text style={[styles.name, { color: c.text }]}>{asset.name}</Text>
        <Text style={[styles.bigDaily, { color: c.text }]}>{formatDaily(cost)}</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          总价：{formatMoney(asset.purchasePrice, 0)}  |  已用 {days} 天
        </Text>

        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>目标成本</Text>
          <View style={styles.row3}>
            <Metric label="当前成本" value={formatDaily(cost)} />
            <Metric label="进度" value={`${Math.round(progress * 100)}%`} center />
            <Metric label="目标成本" value={formatDaily(asset.targetDailyCost)} right />
          </View>
          <View style={{ marginTop: 14 }}>
            <CostBar progress={progress} height={10} />
          </View>
          <View style={styles.footerRow}>
            <Text style={[styles.foot, { color: c.textSecondary }]}>预计达成时间：{expectedFinishISO(asset)}</Text>
            <Text style={[styles.foot, { color: c.textSecondary }]}>剩余：{remain} 天</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: c.text }]}>日均成本</Text>
            {progress >= 1 ? (
              <View style={styles.done}>
                <Text style={styles.doneText}>☺ 达成目标</Text>
              </View>
            ) : null}
          </View>
          <DailyCostChart data={history} target={asset.targetDailyCost} width={width - 56} />
        </View>

        {asset.status === 'sold' ? (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>变现复盘</Text>
            <View style={styles.row3}>
              <Metric label="买入" value={formatMoney(asset.purchasePrice, 0)} />
              <Metric label="卖出" value={formatMoney(asset.soldPrice ?? 0, 0)} center />
              <Metric
                label="盈亏"
                value={formatMoney((asset.soldPrice ?? 0) - asset.purchasePrice, 0)}
                right
              />
            </View>
            <Text style={[styles.foot, { marginTop: 12 }]}>
              持有 {days} 天，真实日耗 {formatDaily(cost)}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {asset.status === 'active' ? (
            <>
              <Pressable style={[styles.btnGhost, { backgroundColor: c.input }]} onPress={retire}>
                <Text style={[styles.btnGhostText, { color: c.text }]}>标记退役</Text>
              </Pressable>
              <Pressable
                style={[styles.btnLime, { backgroundColor: c.lime }]}
                onPress={() => router.push({ pathname: '/asset/sell', params: { id: asset.id } })}>
                <Text style={styles.btnLimeText}>卖出复盘</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.btnGhost, { backgroundColor: c.input }]}
              onPress={() => updateAsset(asset.id, { status: 'active', soldDate: undefined, soldPrice: undefined, retiredDate: undefined })}>
              <Text style={[styles.btnGhostText, { color: c.text }]}>恢复服役</Text>
            </Pressable>
          )}
        </View>
        <Pressable onPress={more} style={{ alignSelf: 'center', marginTop: 8, padding: 12 }}>
          <Text style={{ color: c.textSecondary, fontSize: 13 }}>更多操作</Text>
        </Pressable>
        <Text style={styles.statusHint}>当前状态：{STATUS_LABEL[asset.status]}</Text>
      </ScrollView>
    </View>
  );
}

function MetricText({ label, value }: { label: string; value: string }) {
  const c = useColors();
  return (
    <>
      <Text style={{ fontSize: 12, color: c.textSecondary }}>{label}</Text>
      <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: c.text }}>{value}</Text>
    </>
  );
}

function Metric({
  label,
  value,
  center,
  right,
}: {
  label: string;
  value: string;
  center?: boolean;
  right?: boolean;
}) {
  return (
    <View style={{ flex: 1, alignItems: center ? 'center' : right ? 'flex-end' : 'flex-start' }}>
      <MetricText label={label} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingVertical: 8 },
  heroImg: {
    width: 220,
    height: 220,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 6,
    borderColor: '#fff',
    shadowColor: '#111',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  name: { textAlign: 'center', fontSize: 22, fontWeight: '800', marginTop: 8 },
  bigDaily: { textAlign: 'center', fontSize: 32, fontWeight: '800', marginTop: 6 },
  sub: { textAlign: 'center', fontSize: 13, marginTop: 6 },
  card: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row3: { flexDirection: 'row' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  foot: { fontSize: 12 },
  done: { backgroundColor: '#C8F04D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  doneText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 22 },
  btnGhost: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: { fontSize: 15, fontWeight: '700' },
  btnLime: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLimeText: { fontSize: 15, fontWeight: '800', color: '#111' },
  statusHint: { textAlign: 'center', fontSize: 12, marginTop: 4 },
});
