import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  dailyCost,
  formatMoney,
  holdingDays,
  remainingDays,
  statusColor,
  targetProgress,
} from '../calc';
import { PRODUCT_IMAGES } from '../images';
import { shadow } from '../theme';
import type { Asset } from '../types';
import { STATUS_LABEL } from '../types';
import { useStore } from '../store';
import { useColors } from '../useColors';
import { CostBar } from './CostBar';

type Props = {
  asset: Asset;
  onPress: () => void;
  size?: number;
};

export function AssetCard({ asset, onPress, size }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const days = holdingDays(asset);
  const remain = remainingDays(asset);
  const source = asset.imageUri
    ? { uri: asset.imageUri }
    : asset.imageKey
      ? PRODUCT_IMAGES[asset.imageKey]
      : undefined;
  const daily = dailyCost(asset);
  const badgeBg = scheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.35)';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        size ? { width: size, height: size } : { width: '100%', aspectRatio: 1 },
        {
          backgroundColor: scheme === 'light' ? '#FFFFFF' : '#1C1C1E',
        },
        scheme === 'light' && shadow.card,
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}>
      <View style={styles.topRow}>
        <View style={styles.thumb}>
          {source ? (
            <Image source={source} style={styles.thumbImg} contentFit="contain" />
          ) : (
            <View style={[styles.thumbImg, { backgroundColor: c.chip }]} />
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <View style={[styles.dot, { backgroundColor: statusColor(asset.status) }]} />
          <Text style={[styles.badgeText, { color: c.text }]}>{STATUS_LABEL[asset.status]}</Text>
        </View>
      </View>

      <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
        {asset.starred ? '★ ' : ''}
        {asset.name}
      </Text>
      <Text style={[styles.meta, { color: c.textSecondary }]} numberOfLines={1}>
        {formatMoney(asset.purchasePrice, 2)} | {days}天
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.daily, { color: c.text }]} numberOfLines={1}>
          {formatMoney(daily, 2)}/天
        </Text>
        <View style={{ marginTop: 4 }}>
          <CostBar
            progress={targetProgress(asset)}
            color={statusColor(asset.status)}
            height={3}
            label={asset.status === 'active' ? `剩${remain}天` : STATUS_LABEL[asset.status]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
    maxWidth: '55%',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  name: { marginTop: 10, fontSize: 15, fontWeight: '600' },
  meta: { marginTop: 4, fontSize: 12, fontWeight: '400' },
  footer: { flex: 1, justifyContent: 'flex-end' },
  daily: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
