import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * True only where the OS can render Liquid Glass (iOS 26+).
 *
 * `Platform.OS` is checked first because `isLiquidGlassAvailable` is an
 * iOS-only native call.
 */
export const GLASS_AVAILABLE = Platform.OS === 'ios' && isLiquidGlassAvailable();

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Applied in addition to `style` when glass is unavailable. */
  fallbackStyle?: StyleProp<ViewStyle>;
  /** `'clear'` is the thinner, more transparent material. */
  glassStyle?: 'clear' | 'regular';
  interactive?: boolean;
};

/**
 * iOS 26 Liquid Glass surface with a graceful fallback.
 *
 * Do NOT pass a `backgroundColor` for the glass path — an opaque fill would
 * paint over the material and defeat it. Use `fallbackStyle` for the fill that
 * only applies when glass is unavailable.
 */
export function GlassSurface({
  children,
  style,
  fallbackStyle,
  glassStyle = 'regular',
  interactive,
}: Props) {
  if (GLASS_AVAILABLE) {
    return (
      <GlassView glassEffectStyle={glassStyle} isInteractive={interactive} style={style}>
        {children}
      </GlassView>
    );
  }
  return <View style={[style, fallbackStyle]}>{children}</View>;
}
