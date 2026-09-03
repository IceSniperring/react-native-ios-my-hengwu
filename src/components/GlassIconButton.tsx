import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ComponentType, ReactNode } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { useColors } from '../useColors';

type Props = {
  name: SFSymbol;
  onPress: () => void;
  accessibilityLabel?: string;
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

export function GlassIconButton({ name, onPress, accessibilityLabel }: Props) {
  const c = useColors();
  const glass = loadGlass();
  const glassOn = canUseGlass(glass);
  // Monochrome — follow primary text, not system blue tint.
  const icon = <SymbolView name={name} size={18} tintColor={c.text} />;

  if (glassOn && glass) {
    const { GlassView } = glass;
    return (
      <Pressable onPress={onPress} hitSlop={8} accessibilityLabel={accessibilityLabel}>
        <GlassView style={styles.btn} glassEffectStyle="regular" isInteractive>
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
      style={[styles.btn, { backgroundColor: c.chip }]}>
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
