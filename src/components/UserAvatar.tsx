import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { LIME } from '../theme';
import { FONT } from '../typography';

type Props = {
  /** Avatar URL (Clerk CDN or a locally cached file). */
  uri?: string | null;
  /** Rendered when there is no image — the brand glyph or an initial. */
  glyph: string;
  size?: number;
};

/**
 * Circular user avatar. Falls back to the brand lime well with a glyph when the
 * user has no profile image.
 */
export function UserAvatar({ uri, glyph, size = 60 }: Props) {
  const radius = Math.round(size * 0.34);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
        transition={150}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius },
      ]}>
      <Text style={[styles.glyph, { fontSize: Math.round(size * 0.44) }]}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: LIME, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: FONT.extrabold, color: '#1C1C1E' },
});
