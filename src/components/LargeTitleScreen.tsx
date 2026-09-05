import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '../useColors';

type Props = {
  title: string;
  subtitle?: string;
  accessory?: ReactNode;
  header?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
};

/** iOS 26-style large title: scrolls away, compact 17pt title fades in centered. */
export function LargeTitleScreen({ title, subtitle, accessory, header, overlay, children }: Props) {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const y = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const bottomPad = Platform.OS === 'ios' ? insets.bottom + 120 : 32;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
    },
  });

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [8, 32], [0, 1], Extrapolation.CLAMP),
  }));

  const hairlineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [8, 32], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={[styles.chrome, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <View style={styles.chromeRow}>
          <Pressable
            hitSlop={12}
            onPress={() => scrollTo(scrollRef, 0, 0, true)}
            style={styles.compactHit}>
            <Animated.Text style={[styles.compact, { color: c.text }, compactStyle]} numberOfLines={1}>
              {title}
            </Animated.Text>
          </Pressable>
          {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
        </View>
        <Animated.View style={[styles.hairline, { backgroundColor: c.line }, hairlineStyle]} />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={header ? [1] : undefined}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}>
        <View style={styles.largeBlock}>
          <Text style={[styles.large, { color: c.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text> : null}
        </View>
        {header ? (
          <View collapsable={false} style={[styles.sticky, { backgroundColor: c.bg }]}>
            {header}
            <View style={[styles.stickyLine, { backgroundColor: c.line }]} />
          </View>
        ) : null}
        <View>{children}</View>
      </Animated.ScrollView>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chrome: {
    zIndex: 20,
    paddingHorizontal: 16,
  },
  chromeRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  compactHit: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    fontSize: 17,
    fontWeight: '700',
  },
  accessory: {
    zIndex: 1,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -16,
  },
  sticky: {
    paddingBottom: 8,
    zIndex: 4,
  },
  stickyLine: {
    height: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  largeBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  large: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
});
