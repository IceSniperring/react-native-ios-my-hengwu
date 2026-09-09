import { useEffect, useState, type ReactNode } from 'react';
import {
  BackHandler,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { CardSourceFrame } from '../ui/sharedHero';

type Props = {
  source: CardSourceFrame | null;
  onClose: () => void;
  cardColor: string;
  pageColor: string;
  children: (requestClose: () => void) => ReactNode;
};

const CARD_RADIUS = 18;
const IOS_OPEN = Easing.bezier(0.32, 0.72, 0, 1);
const OPEN_MS = 480;
const CLOSE_MS = 380;

/**
 * Same-layer app-icon zoom. Not a navigation route — the list stays mounted
 * underneath; this overlay expands from the card and shrinks back on close.
 */
export function AssetZoomOverlay({
  source,
  onClose,
  cardColor,
  pageColor,
  children,
}: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [mounted, setMounted] = useState(source != null);
  const [frame, setFrame] = useState<CardSourceFrame | null>(source);
  const progress = useSharedValue(source ? 0 : 1);

  useEffect(() => {
    if (!source) return;
    setFrame(source);
    setMounted(true);
    progress.value = 0;
    progress.value = withTiming(1, { duration: OPEN_MS, easing: IOS_OPEN });
  }, [source, progress]);

  const finishClose = () => {
    setMounted(false);
    onClose();
  };

  const requestClose = () => {
    progress.value = withTiming(
      0,
      { duration: CLOSE_MS, easing: IOS_OPEN },
      (finished) => {
        if (finished) runOnJS(finishClose)();
      },
    );
  };

  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      requestClose();
      return true;
    });
    return () => sub.remove();
  });

  const zoomStyle = useAnimatedStyle(() => {
    const f = frame;
    if (!f) return {};
    const t = progress.value;
    const s0 = f.width / winW;
    const scale = s0 + (1 - s0) * t;
    const tx = (f.x + f.width / 2 - winW / 2) * (1 - t);
    const ty = (f.y + f.height / 2 - winH / 2) * (1 - t);
    const radius = (f.radius ?? CARD_RADIUS) * (1 - t);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale }],
      borderRadius: radius,
      overflow: 'hidden' as const,
      backgroundColor: t < 0.5 ? cardColor : pageColor,
    };
  });

  if (!mounted || !frame) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents="auto">
      <Animated.View style={[styles.full, zoomStyle]}>
        {children(requestClose)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
