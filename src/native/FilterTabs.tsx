import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useStore } from '../store';
import { LIME } from '../theme';

type Item = { id: string; label: string };
type TabLayout = { x: number; width: number };

type Props = {
  items: Item[];
  selected: string;
  onSelect: (id: string) => void;
  pageOffset?: SharedValue<number>;
};

const SPRING = { damping: 18, stiffness: 220 };
const UNSELECTED_LIGHT = 'rgba(60,60,67,0.55)';

export function FilterTabs({ items, selected, onSelect, pageOffset }: Props) {
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
        {/* Sits up into the glyph feet (~3–4px overlap) */}
        <Animated.View style={[styles.underlineSlot, underlineStyle]} pointerEvents="none">
          <ComicUnderline />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ComicUnderline() {
  return (
    <Svg width="100%" height={5} viewBox="0 0 100 5" preserveAspectRatio="none">
      <Path
        d="M1.5 3.2 C 16 0.6, 30 4.4, 48 2.4 S 76 0.5, 98.5 3.5"
        stroke={LIME}
        strokeWidth={5}
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
    paddingTop: 4,
    // underline overlaps text: only 2px below the 20px line box
    paddingBottom: 2,
    gap: 20,
    position: 'relative',
  },
  tab: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
  },
  underlineSlot: {
    position: 'absolute',
    // Designer: overlap text feet by 2.5
    bottom: -2.5,
    left: 0,
    height: 5,
  },
});
