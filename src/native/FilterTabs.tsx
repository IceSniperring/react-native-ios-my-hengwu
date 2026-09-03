import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { LIME } from '../theme';
import { useColors } from '../useColors';

type Item = { id: string; label: string };

type TabLayout = { x: number; width: number };

type Props = {
  items: Item[];
  selected: string;
  onSelect: (id: string) => void;
  /** Fractional page index while swiping (position + offset) */
  pageOffset?: SharedValue<number>;
};

const SPRING = { damping: 18, stiffness: 220 };

export function FilterTabs({ items, selected, onSelect, pageOffset }: Props) {
  const c = useColors();
  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const scrollRef = useRef<ScrollView>(null);
  const underlineX = useSharedValue(0);
  const underlineW = useSharedValue(24);
  // Parallel arrays for worklet interpolation while paging
  const xs = useSharedValue<number[]>([]);
  const ws = useSharedValue<number[]>([]);

  useEffect(() => {
    const nextX: number[] = [];
    const nextW: number[] = [];
    for (const item of items) {
      const L = layouts[item.id];
      if (!L) {
        xs.value = [];
        ws.value = [];
        return;
      }
      const strokeW = Math.max(18, L.width * 0.92);
      nextX.push(L.x + (L.width - strokeW) / 2);
      nextW.push(strokeW);
    }
    xs.value = nextX;
    ws.value = nextW;
  }, [items, layouts, xs, ws]);

  useEffect(() => {
    const layout = layouts[selected];
    if (!layout) return;
    const w = Math.max(18, layout.width * 0.92);
    const x = layout.x + (layout.width - w) / 2;
    underlineX.value = withSpring(x, SPRING);
    underlineW.value = withSpring(w, SPRING);
    scrollRef.current?.scrollTo({ x: Math.max(0, layout.x - 40), animated: true });
  }, [selected, layouts, underlineX, underlineW]);

  const underlineStyle = useAnimatedStyle(() => {
    const listX = xs.value;
    const listW = ws.value;
    if (pageOffset && listX.length > 0 && listX.length === listW.length) {
      const raw = Math.min(Math.max(pageOffset.value, 0), Math.max(listX.length - 1, 0));
      const i = Math.floor(raw);
      const t = raw - i;
      const j = Math.min(i + 1, listX.length - 1);
      const x = listX[i]! + (listX[j]! - listX[i]!) * t;
      const w = listW[i]! + (listW[j]! - listW[i]!) * t;
      return { transform: [{ translateX: x }], width: w };
    }
    return {
      transform: [{ translateX: underlineX.value }],
      width: underlineW.value,
    };
  });

  const onTabLayout = (id: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const cur = prev[id];
      if (cur && cur.x === x && cur.width === width) return prev;
      return { ...prev, [id]: { x, width } };
    });
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {items.map((item) => {
          const on = item.id === selected;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              onLayout={onTabLayout(item.id)}
              style={styles.tab}
              hitSlop={6}>
              <Text
                style={[
                  styles.label,
                  {
                    color: on ? c.text : c.textSecondary,
                    fontWeight: on ? '700' : '500',
                  },
                ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        <Animated.View style={[styles.underlineSlot, underlineStyle]} pointerEvents="none">
          <ComicUnderline />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ComicUnderline() {
  return (
    <Svg width="100%" height={7} viewBox="0 0 100 7" preserveAspectRatio="none">
      <Path
        d="M2 4.2 C 18 1.2, 32 5.8, 48 3.4 S 78 1.6, 98 4.5"
        stroke={LIME}
        strokeWidth={4.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  row: {
    flexGrow: 0,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 18,
    position: 'relative',
  },
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  label: { fontSize: 15 },
  underlineSlot: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    height: 7,
  },
});
