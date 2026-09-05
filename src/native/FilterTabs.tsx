import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { swipeCategory } from '../homeUi';
import { useStore } from '../store';

type Item = { id: string; label: string };
type TabLayout = { x: number; y: number; width: number; height: number };

type Props = {
  items: Item[];
  selected: string;
  onSelect: (id: string) => void;
  /** Drives the marker while the grid pager follows the finger. */
  pageOffset?: SharedValue<number>;
  onRequestPage?: (index: number) => void;
};

const SPRING = { damping: 24, stiffness: 320, mass: 0.6 };
/** Stiff tracker: masks JS event jitter without adding visible lag. */
const TRACK_SPRING = {
  damping: 50,
  stiffness: 900,
  mass: 0.25,
  overshootClamping: true,
};

/** Highlighter stroke sitting across the glyph feet of the active label. */
const MARKER_FILL = 'rgba(169, 214, 46, 0.85)';
const MARKER_HEIGHT = 12;
/**
 * Hand-drawn chisel stroke in a 100 × 12 design space: puffy bowed edges and
 * slanted ends. The marker view keeps this aspect locked while its width is
 * animated, so `preserveAspectRatio="none"` stretches the drawing with the
 * bar and swipes read like comic ink spreading across the tabs.
 */
const MARKER_PATH =
  'M10,1.6 Q52,-1 95,1.6 Q99.2,6 90,10.4 Q48,13 5,10.4 Q0.8,6 10,1.6 Z';

export function FilterTabs({ items, selected, onSelect, pageOffset, onRequestPage }: Props) {
  const scheme = useStore((s) => s.colorScheme);
  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const scrollRef = useRef<ScrollView>(null);
  const chipX = useSharedValue(0);
  const chipW = useSharedValue(16);
  const chipY = useSharedValue(0);
  const chipH = useSharedValue(MARKER_HEIGHT);
  // Pager events arrive on the JS thread; when it is busy the raw stream drops
  // frames and the marker stutters with it. `pos` follows the raw value with a
  // stiff spring so the stroke keeps gliding on the UI thread instead.
  const pos = useSharedValue(0);
  // Per-index geometry used to place the marker during pager interpolation.
  const xs = useSharedValue<number[]>([]);
  const ws = useSharedValue<number[]>([]);
  const ys = useSharedValue<number[]>([]);
  const hs = useSharedValue<number[]>([]);

  useEffect(() => {
    const X: number[] = [];
    const W: number[] = [];
    const Y: number[] = [];
    const H: number[] = [];
    for (const item of items) {
      const layout = layouts[item.id];
      if (!layout) return;
      X.push(layout.x - 3);
      W.push(layout.width + 6);
      // Bar top so the ink band lands across the glyph feet.
      Y.push(layout.y + layout.height - 17);
      H.push(MARKER_HEIGHT);
    }
    xs.value = X;
    ws.value = W;
    ys.value = Y;
    hs.value = H;
  }, [items, layouts, xs, ws, ys, hs]);

  useEffect(() => {
    const layout = layouts[selected];
    if (!layout) return;
    const w = layout.width + 6;
    const x = layout.x - 3;
    const y = layout.y + layout.height - 17;
    const h = MARKER_HEIGHT;
    chipX.value = withSpring(x, SPRING);
    chipW.value = withSpring(w, SPRING);
    chipY.value = withSpring(y, SPRING);
    chipH.value = withSpring(h, SPRING);
    scrollRef.current?.scrollTo({ x: Math.max(0, layout.x - 48), animated: true });
  }, [selected, layouts, chipX, chipW, chipY, chipH]);

  useAnimatedReaction(
    () => pageOffset?.value ?? 0,
    (raw) => {
      pos.value = withSpring(raw, TRACK_SPRING);
    },
  );

  const barStyle = useAnimatedStyle(() => {
    const LX = xs.value;
    const LW = ws.value;
    const LY = ys.value;
    const LH = hs.value;
    const ready = LX.length > 0 && LX.length === LW.length && LX.length === LY.length;
    if (pageOffset && ready) {
      const raw = Math.min(Math.max(pos.value, 0), LX.length - 1);
      const i = Math.floor(raw);
      const j = Math.min(i + 1, LX.length - 1);
      const t = raw - i;
      const li = LX[i]!;
      const ri = li + LW[i]!;
      const lj = LX[j]!;
      const rj = lj + LW[j]!;
      // Rubber band: the right edge eases out ahead while the left edge eases
      // in behind, so the stroke stretches over the gap mid-swipe and lands
      // exactly on the target rect when the page settles (t = 0 or 1).
      const eo = 1 - (1 - t) * (1 - t);
      const ei = t * t;
      const left = li + (lj - li) * ei;
      const right = ri + (rj - ri) * eo;
      return {
        width: Math.max(right - left, 0),
        height: LH[i]!,
        transform: [{ translateX: left }, { translateY: LY[i]! }],
      };
    }
    return {
      width: chipW.value,
      height: chipH.value,
      transform: [{ translateX: chipX.value }, { translateY: chipY.value }],
    };
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          const ids = items.map((item) => item.id);
          const next = swipeCategory(ids, selected, gesture.dx, gesture.dy);
          if (next === selected) return;
          const index = items.findIndex((item) => item.id === next);
          if (onRequestPage && index >= 0) onRequestPage(index);
          else onSelect(next);
        },
      }),
    [items, onRequestPage, onSelect, selected],
  );

  const onTabLayout = (id: string) => (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const cur = prev[id];
      if (cur && cur.x === x && cur.y === y && cur.width === width && cur.height === height)
        return prev;
      return { ...prev, [id]: { x, y, width, height } };
    });
  };

  return (
    <View style={styles.wrap} {...panResponder.panHandlers}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {/* Rendered before the labels so the active text paints over the highlighter. */}
        <Animated.View pointerEvents="none" style={[styles.marker, barStyle]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 12" preserveAspectRatio="none">
            <Path d={MARKER_PATH} fill={MARKER_FILL} />
          </Svg>
        </Animated.View>
        {items.map((item, index) => {
          const on = item.id === selected;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                const index = items.findIndex((tab) => tab.id === item.id);
                if (onRequestPage && index >= 0) onRequestPage(index);
                else onSelect(item.id);
              }}
              onLayout={onTabLayout(item.id)}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              hitSlop={6}>
              <TabLabel
                label={item.label}
                on={on}
                scheme={scheme}
                index={index}
                pos={pageOffset ? pos : undefined}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TabLabel({
  label,
  on,
  scheme,
  index,
  pos,
}: {
  label: string;
  on: boolean;
  scheme: 'light' | 'dark';
  index: number;
  pos?: SharedValue<number>;
}) {
  const selectedColor = scheme === 'dark' ? '#F2F2F7' : '#111111';
  const idleColor = scheme === 'dark' ? '#A1A1A6' : 'rgba(60,60,67,0.55)';
  const color = on ? selectedColor : idleColor;

  // With a pager, two stacked copies crossfade on the UI thread so weight and
  // colour follow the finger (activation = 1 − |pos − index|). Both layers are
  // opacity-only styles off one shared value, which is far cheaper than the
  // per-tab Animated.Value crossfade that stuttered before.
  if (pos) {
    return (
      <CrossfadeLabel
        label={label}
        index={index}
        pos={pos}
        selectedColor={selectedColor}
        idleColor={idleColor}
      />
    );
  }

  return (
    <Text numberOfLines={1} style={[styles.label, { color, fontWeight: on ? '900' : '600' }]}>
      {label}
    </Text>
  );
}

function CrossfadeLabel({
  label,
  index,
  pos,
  selectedColor,
  idleColor,
}: {
  label: string;
  index: number;
  pos: SharedValue<number>;
  selectedColor: string;
  idleColor: string;
}) {
  const boldStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - Math.abs(pos.value - index)),
  }));
  const baseStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, 1 - Math.abs(pos.value - index)),
  }));
  return (
    <View style={styles.labelBox}>
      <Animated.Text
        numberOfLines={1}
        style={[styles.label, { color: idleColor, fontWeight: '600' }, baseStyle]}>
        {label}
      </Animated.Text>
      <Animated.Text
        numberOfLines={1}
        accessibilityElementsHidden
        style={[styles.label, styles.labelBold, { color: selectedColor, fontWeight: '900' }, boldStyle]}>
        {label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 2,
  },
  row: {
    flexGrow: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 7,
    gap: 22,
    position: 'relative',
    overflow: 'visible',
  },
  tab: {
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 0,
    zIndex: 1,
  },
  tabPressed: { opacity: 0.7 },
  label: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  labelBox: { justifyContent: 'center' },
  labelBold: { position: 'absolute', left: 0, right: 0, top: 0 },
  marker: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: MARKER_HEIGHT,
  },
});
