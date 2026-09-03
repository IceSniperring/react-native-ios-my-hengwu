import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dailyCost, formatMoney, holdingDays, statusColor } from '../calc';
import { PRODUCT_IMAGES } from '../images';
import type { Asset } from '../types';
import { STATUS_LABEL } from '../types';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  asset: Asset;
  onPress: () => void;
  /** Square edge length; defaults to stretch parent width */
  size?: number;
};

/**
 * Near-square asset tile:
 * top-left sticker thumb, top-right status, name, price|days, big ¥/天.
 */
export function AssetCard({ asset, onPress, size }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const days = holdingDays(asset);
  const source = asset.imageUri
    ? { uri: asset.imageUri }
    : asset.imageKey
      ? PRODUCT_IMAGES[asset.imageKey]
      : undefined;
  const edge = size ?? 160;
  const thumb = Math.round(edge * 0.36);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        size
          ? { width: size, height: size }
          : { width: '100%', aspectRatio: 1 },
        {
          backgroundColor: c.card,
          borderColor: scheme === 'dark' ? '#2A2A2C' : c.line,
        },
        pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
      ]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.thumb,
            {
              width: thumb,
              height: thumb,
              backgroundColor: '#FFFFFF',
            },
          ]}>
          {source ? (
            <Image source={source} style={styles.thumbImg} contentFit="contain" />
          ) : (
            <View style={[styles.thumbImg, { backgroundColor: c.chip }]} />
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: c.badgeBg }]}>
          <View style={[styles.dot, { backgroundColor: statusColor(asset.status) }]} />
          <Text style={[styles.badgeText, { color: c.text }]}>{STATUS_LABEL[asset.status]}</Text>
        </View>
      </View>

      <Text style={[styles.name, { color: c.text }]} numberOfLines={2}>
        {asset.starred ? '★ ' : ''}
        {asset.name}
      </Text>
      <Text style={[styles.meta, { color: c.textSecondary }]} numberOfLines={1}>
        {formatMoney(asset.purchasePrice, 2)} | {days}天
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.daily, { color: c.text }]} numberOfLines={1}>
          {formatMoney(dailyCost(asset), Math.abs(dailyCost(asset)) >= 10 ? 2 : 2)}/天
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 0,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  thumb: {
    borderRadius: 12,
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
    maxWidth: '52%',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  name: { marginTop: 10, fontSize: 14, fontWeight: '700', lineHeight: 18 },
  meta: { marginTop: 4, fontSize: 11 },
  footer: { flex: 1, justifyContent: 'flex-end' },
  daily: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
