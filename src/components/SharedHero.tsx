import { useEffect, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  peekHeroSource,
  setHeroCloseHandler,
  type CardSourceFrame,
} from '../ui/sharedHero';

type Props = {
  children: ReactNode;
  cardColor: string;
  pageColor: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CARD_RADIUS = 18;
/** Apple app-icon zoom curve. */
const IOS_OPEN = Easing.bezier(0.32, 0.72, 0, 1);
const OPEN_MS = 480;
const CLOSE_MS = 380;

/**
 * Bidirectional app-icon zoom:
 * open = card → full screen, close = full screen → same card frame.
 */
export function SharedCardOpen({
  children,
  cardColor,
  pageColor,
  disabled,
  style,
}: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [source] = useState<CardSourceFrame | null>(() =>
    disabled ? null : peekHeroSource(),
  );
  const progress = useSharedValue(source ? 0 : 1);

  useEffect(() => {
    if (!source) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: OPEN_MS, easing: IOS_OPEN });
  }, [source, progress]);

  useEffect(() => {
    if (!source) return;
    setHeroCloseHandler(
      () =>
        new Promise<void>((resolve) => {
          progress.value = withTiming(
            0,
            { duration: CLOSE_MS, easing: IOS_OPEN },
            (finished) => {
              if (finished) runOnJS(resolve)();
              else runOnJS(resolve)();
            },
          );
        }),
    );
    return () => setHeroCloseHandler(null);
  }, [source, progress]);

  const openStyle = useAnimatedStyle(() => {
    if (!source) return {};
    const t = progress.value;
    const s0 = source.width / winW;
    const scale = s0 + (1 - s0) * t;
    const tx = (source.x + source.width / 2 - winW / 2) * (1 - t);
    const ty = (source.y + source.height / 2 - winH / 2) * (1 - t);
    const radius = (source.radius ?? CARD_RADIUS) * (1 - t);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale }],
      borderRadius: radius,
      overflow: 'hidden' as const,
      backgroundColor: t < 0.5 ? cardColor : pageColor,
    };
  });

  if (disabled || !source) {
    return (
      <View style={[styles.root, { backgroundColor: pageColor }, style]}>{children}</View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: pageColor }, style]}>
      <Animated.View style={[styles.root, openStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
