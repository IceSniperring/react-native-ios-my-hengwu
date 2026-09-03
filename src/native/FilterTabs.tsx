import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useStore } from '../store';
import { LIME } from '../theme';
import { useColors } from '../useColors';

type Item = { id: string; label: string };
type TabLayout = { x: number; width: number };

type Props = {
  items: Item[];
  selected: string;
  onSelect: (id: string) => void;
  /** Fractional page index (position + offset) while paging */
  pageOffset?: SharedValue<number>;
};

const SPRING = { damping: 18, stiffness: 220 };
const UNSELECTED_LIGHT = 'rgba(60,60,67,0.55)';

export function FilterTabs({ items, selected, onSelect, pageOffset }: Props) {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const scrollRef = useRef<ScrollView>(null);
  const underlineX = useSharedValue(0);
  const underlineW = useSharedValue(24);
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
      // width = text width + 2px each side
      const strokeW = L.width + 4;
      nextX.push(L.x - 2);
      nextW.push(strokeW);
    }
    xs.value = nextX;
    ws.value = nextW;
  }, [items, layouts, xs, ws]);

  useEffect(() => {
    const layout = layouts[selected];
    if (!layout) return;
    const w = layout.width + 4;
    const x = layout.x - 2;
    underlineX.value = withSpring(x, SPRING);
    underlineW.value = withSpring(w, SPRING);
    scrollRef.current?.scrollTo({ x: Math.max(0, layout.x - 48), animated: true });
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
          const color = on
            ? scheme === 'dark'
              ? '#FFFFFF'
              : '#111111'
            : scheme === 'dark'
              ? '#8E8E93'
              : UNSELECTED_LIGHT;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              onLayout={onTabLayout(item.id)}
              style={styles.tab}
              hitSlop={6}>
              <Text style={[styles.label, { color, fontWeight: on ? '700' : '400' }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        <Animated.View
          pointerEvents="none"
          style={[styles.underline, { backgroundColor: LIME }, underlineStyle]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  row: {
    flexGrow: 0,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 4,
    // label lineHeight 20 + gap 6 to underline + underline 5
    paddingBottom: 6 + 5,
    gap: 20,
    position: 'relative',
  },
  tab: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 5,
    borderRadius: 999,
  },
});
