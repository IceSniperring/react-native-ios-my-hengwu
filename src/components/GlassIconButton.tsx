import type { SFSymbol } from 'expo-symbols';
import type { ComponentType, ReactNode } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { PlatformIcon } from '../native/PlatformIcon';
import { useColors } from '../useColors';

type Props = {
  name: SFSymbol;
  onPress: () => void;
  accessibilityLabel?: string;
  size?: number;
};

type GlassModule = {
  isLiquidGlassAvailable?: () => boolean;
  isGlassEffectAPIAvailable?: () => boolean;
  GlassView: ComponentType<{
    style?: object;
    glassEffectStyle?: string;
    isInteractive?: boolean;
    tintColor?: string;
    children?: ReactNode;
  }>;
};

function loadGlass(): GlassModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-glass-effect') as GlassModule;
  } catch {
    return null;
  }
}

function canUseGlass(mod: GlassModule | null): boolean {
  if (Platform.OS !== 'ios' || !mod) return false;
  const liquid = mod.isLiquidGlassAvailable?.() ?? false;
  const api = mod.isGlassEffectAPIAvailable?.() ?? liquid;
  return Boolean(liquid && api);
}

export function GlassIconButton({ name, onPress, accessibilityLabel, size = 36 }: Props) {
  const c = useColors();
  const glass = loadGlass();
  const glassOn = canUseGlass(glass);
  const icon = <PlatformIcon name={name} size={size >= 40 ? 18 : 17} color={c.text} />;
  const box = { width: size, height: size, borderRadius: size / 2 };

  if (Platform.OS === 'android') {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityLabel={accessibilityLabel}
        android_ripple={{ color: 'rgba(128,128,128,0.24)', borderless: true, radius: size / 2 }}
        style={[styles.btn, box]}>
        {icon}
      </Pressable>
    );
  }

  if (glassOn && glass) {
    const { GlassView } = glass;
    return (
      <Pressable onPress={onPress} hitSlop={8} accessibilityLabel={accessibilityLabel}>
        <GlassView style={[styles.btn, box]} glassEffectStyle="regular" isInteractive>
          {icon}
        </GlassView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      style={[styles.btn, box, { backgroundColor: c.chip }]}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
