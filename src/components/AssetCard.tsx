import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  dailyCost,
  formatDaily,
  formatMoney,
  holdingDays,
  remainingDays,
  statusColor,
  targetProgress,
} from '../calc';
import { PRODUCT_IMAGES } from '../images';
import { radius, shadow } from '../theme';
import type { Asset } from '../types';
import { STATUS_LABEL } from '../types';
import { useStore } from '../store';
import { useColors } from '../useColors';
import { CostBar } from './CostBar';

type Props = {
  asset: Asset;
  onPress: () => void;
};

export function AssetCard({ asset, onPress }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const days = holdingDays(asset);
  const remain = remainingDays(asset);
  const source = asset.imageUri
    ? { uri: asset.imageUri }
    : asset.imageKey
      ? PRODUCT_IMAGES[asset.imageKey]
      : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        scheme === 'light' && shadow.card,
        { backgroundColor: c.card },
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}>
      <View style={[styles.imageBox, { backgroundColor: c.imageBg }]}>
        {source ? (
          <Image source={source} style={styles.image} contentFit="contain" />
        ) : (
          <View style={[styles.image, { backgroundColor: c.chip }]} />
        )}
        <View style={[styles.badge, { backgroundColor: c.badgeBg }]}>
          <View style={[styles.dot, { backgroundColor: statusColor(asset.status) }]} />
          <Text style={[styles.badgeText, { color: c.text }]}>{STATUS_LABEL[asset.status]}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
          {asset.starred ? '★ ' : ''}
          {asset.name}
        </Text>
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          {formatMoney(asset.purchasePrice, 0)} · {days}天
        </Text>
        <Text style={[styles.daily, { color: c.text }]}>{formatDaily(dailyCost(asset))}</Text>
        <View style={{ marginTop: 8 }}>
          <CostBar
            progress={targetProgress(asset)}
            color={statusColor(asset.status)}
            height={4}
            label={asset.status === 'active' ? `还剩 ${remain} 天` : STATUS_LABEL[asset.status]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageBox: { height: 110 },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  body: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 },
  name: { fontSize: 14, fontWeight: '700' },
  meta: { marginTop: 4, fontSize: 11 },
  daily: { marginTop: 6, fontSize: 17, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
