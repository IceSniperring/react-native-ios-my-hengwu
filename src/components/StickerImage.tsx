import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PRODUCT_IMAGES } from '../images';
import type { ProductKey } from '../types';
import { shadow } from '../theme';
import { useColors } from '../useColors';

type Props = {
  imageKey?: ProductKey;
  imageUri?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export function StickerImage({ imageKey, imageUri, size = 88, style, radius = 16 }: Props) {
  const c = useColors();
  const source = imageUri ? { uri: imageUri } : imageKey ? PRODUCT_IMAGES[imageKey] : undefined;
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: radius, backgroundColor: c.card },
        shadow.card,
        style,
      ]}>
      {source ? (
        <Image source={source} style={[styles.img, { borderRadius: radius - 2, backgroundColor: c.imageBg }]} contentFit="contain" />
      ) : (
        <View style={[styles.fallback, { borderRadius: radius - 2, backgroundColor: c.chip }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 3, overflow: 'hidden' },
  img: { flex: 1 },
  fallback: { flex: 1 },
});
