import { Platform, Pressable, StyleSheet } from 'react-native';

import { PlatformIcon } from '../native/PlatformIcon';
import { LIME } from '../theme';

export function AddFab({
  onPress,
  accessibilityLabel = '添加',
}: {
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  if (Platform.OS !== 'android') return null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: 'rgba(0,0,0,0.12)', foreground: true }}
      style={styles.fab}>
      <PlatformIcon name="plus" size={26} color="#1C1C1E" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: LIME,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 30,
  },
});
