import { Platform, Pressable, StyleSheet } from 'react-native';

import { PlatformIcon, type AppIconName } from '../native/PlatformIcon';
import { useColors } from '../useColors';

type Props = {
  name: AppIconName | string;
  onPress: () => void;
  accessibilityLabel?: string;
  size?: number;
};

/** iOS-style circular icon button (chip fill; no glass dependency). */
export function GlassIconButton({
  name,
  onPress,
  accessibilityLabel,
  size = 36,
}: Props) {
  const c = useColors();
  const iconSize = size >= 40 ? 18 : 17;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={
        Platform.OS === 'android'
          ? { color: 'rgba(128,128,128,0.24)', borderless: true, radius: size / 2 }
          : undefined
      }
      style={({ pressed }) => [
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.chip,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <PlatformIcon name={name} size={iconSize} color={c.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
