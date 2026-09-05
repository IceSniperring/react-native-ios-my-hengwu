import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PRODUCT_IMAGES } from '../images';
import type { ProductKey } from '../types';
import { useColors } from '../useColors';

type Props = {
  imageKey?: ProductKey;
  imageUri?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

/**
 * Sticker presentation: transparent surround + white outline ring.
 * Cutout PNGs (from Vision) already include the outline; templates get a soft white stroke frame.
 */
export function StickerImage({ imageKey, imageUri, size = 88, style, radius = 16 }: Props) {
  const c = useColors();
  const source = imageUri ? { uri: imageUri } : imageKey ? PRODUCT_IMAGES[imageKey] : undefined;
  const isCutout = Boolean(imageUri);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Soft white outline halo for non-cutout templates */}
      {!isCutout && source ? (
        <View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              borderRadius: radius + 2,
              borderColor: '#FFFFFF',
              shadowColor: '#000',
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.wrap,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: isCutout ? 'transparent' : c.imageBg,
            borderWidth: isCutout ? 0 : 3,
            borderColor: '#FFFFFF',
          },
        ]}>
        {source ? (
          <Image
            source={source}
            style={styles.img}
            contentFit="cover"
            recyclingKey={imageUri ?? imageKey}
          />
        ) : (
          <View style={[styles.fallback, { backgroundColor: c.chip }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%' },
  fallback: { flex: 1, width: '100%' },
  halo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 0,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
