import { Image } from 'expo-image';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { dailyCost, formatMoney, holdingDays, statusColor, targetProgress } from '../calc';
import { PRODUCT_IMAGES } from '../images';
import { numMuted, numStyle, shadow } from '../theme';
import type { Asset } from '../types';
import { STATUS_LABEL } from '../types';
import { useStore } from '../store';
import { useColors } from '../useColors';

type Props = {
  asset: Asset;
  onPress?: () => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  size?: number;
  selectMode?: boolean;
  selected?: boolean;
  /** false = render as View so an outer Link can own the press. */
  pressable?: boolean;
};

export function AssetCard({
  asset,
  onPress,
  onLongPress,
  size,
  selectMode,
  selected,
  pressable = true,
}: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const days = holdingDays(asset);
  const source = asset.imageUri
    ? { uri: asset.imageUri }
    : asset.imageKey
      ? PRODUCT_IMAGES[asset.imageKey]
      : undefined;
  const daily = dailyCost(asset);
  const progress = targetProgress(asset);
  const progressLabel = Math.round(progress * 100);
  const progressWidth = (progress * 100 + '%') as DimensionValue;
  const badgeBg = scheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)';
  const cardBg = c.card;
  const arrowColor = c.text;

  const cardStyle: import('react-native').StyleProp<import('react-native').ViewStyle> = [
    styles.card,
    size ? { width: size, height: size } : { width: '100%' as const, aspectRatio: 1 },
    { backgroundColor: cardBg },
    scheme === 'light' ? shadow.card : null,
    selected && {
      borderWidth: 2.5,
      borderColor: c.tint,
      padding: 9.5,
    },
  ];

  const body = (
    <>
      {selectMode ? (
        <View
          style={[
            styles.selectDot,
            {
              borderColor: selected ? c.tint : c.textTertiary,
              backgroundColor: selected ? c.tint : 'transparent',
            },
          ]}>
          {selected ? <View style={styles.selectDotInner} /> : null}
        </View>
      ) : null}
      <View style={styles.topRow}>
        <View style={styles.thumb}>
          {source ? (
            <Image source={source} style={styles.thumbImg} contentFit="cover" />
          ) : (
            <View style={[styles.thumbImg, { backgroundColor: c.chip }]} />
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <View style={[styles.dot, { backgroundColor: statusColor(asset.status, scheme) }]} />
          <Text style={[styles.badgeText, { color: c.text }]}>{STATUS_LABEL[asset.status]}</Text>
        </View>
      </View>

      <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
        {asset.starred ? '★ ' : ''}
        {asset.name}
      </Text>
      <Text style={[styles.meta, numMuted, { color: c.textSecondary }]} numberOfLines={1}>
        {formatMoney(asset.purchasePrice, 2)} | {days}天
      </Text>

      <View style={styles.footer}>
        <View style={styles.costRow}>
          <Text style={[styles.daily, numStyle, { color: c.text }]} numberOfLines={1}>
            {formatMoney(daily, 2)}
            <Text style={[styles.dailyUnit, numMuted, { color: c.textSecondary }]}>/天</Text>
          </Text>
          <Text style={[styles.progressValue, numStyle, { color: c.textSecondary }]}>
            {progressLabel}%
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.track }]}>
          <View
            style={[
              styles.progressFill,
              { width: progressWidth, backgroundColor: c.lime },
            ]}
          />
        </View>
        <View style={styles.arrowRow}>
          <View style={[styles.arrowSlot, { left: progressWidth }]}>
            <Svg width={10} height={6} viewBox="0 0 10 6">
              <Polygon points="5,0 0,6 10,6" fill={arrowColor} />
            </Svg>
          </View>
        </View>
      </View>
    </>
  );

  if (!pressable) {
    return <View style={cardStyle}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={({ pressed }) => [cardStyle, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 12,
  },
  selectDot: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
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
  name: { marginTop: 10, fontSize: 17, fontWeight: '600' },
  meta: { marginTop: 4, fontSize: 12, fontWeight: '400' },
  footer: { flex: 1, justifyContent: 'flex-end' },
  costRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  daily: { fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'] },
  dailyUnit: { fontSize: 12 },
  progressValue: { fontSize: 11, fontWeight: '800', fontVariant: ['tabular-nums'] },
  progressTrack: { height: 6, marginTop: 7, borderRadius: 999 },
  progressFill: { height: '100%', borderRadius: 999 },
  arrowRow: { height: 6, marginTop: 3 },
  arrowSlot: { position: 'absolute', top: 0, marginLeft: -5 },
});
