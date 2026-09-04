import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  useActiveTabScrollY,
  useHeaderScrollY,
  type TabBarRenderProps,
} from 'react-native-collapsible-tab';

import { FilterTabs } from '../native/FilterTabs';
import { NativeSegmented } from '../native/NativeSegmented';
import { STATUS_FILTERS, type CategoryId } from '../types';
import { useColors } from '../useColors';

const FADE_HEIGHT = 28;

export function HomeTabBar({
  cats,
  statusIndex,
  onStatusChange,
  tabNames,
  indexDecimal,
  onTabPress,
  activeIndex,
}: TabBarRenderProps & {
  cats: { id: CategoryId; label: string }[];
  statusIndex: number;
  onStatusChange: (index: number) => void;
}) {
  const c = useColors();
  const selected = tabNames[activeIndex] ?? cats[0]?.id ?? 'all';
  const scrollY = useActiveTabScrollY();
  const headerY = useHeaderScrollY();
  // Only the item grid past the overview: header collapse does not count.
  const fadeStyle = useAnimatedStyle(() => {
    const listY = Math.max(0, scrollY.value - headerY.value);
    return {
      opacity: interpolate(listY, [0, 12], [0, 1], Extrapolation.CLAMP),
    };
  });

  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <FilterTabs
        items={cats}
        selected={selected}
        onSelect={onTabPress}
        pageOffset={indexDecimal}
        onRequestPage={(index) => {
          const name = tabNames[index];
          if (name) onTabPress(name);
        }}
      />
      <NativeSegmented
        values={STATUS_FILTERS.map((s) => s.label)}
        selectedIndex={statusIndex}
        onChange={onStatusChange}
      />
      <Animated.View pointerEvents="none" style={[styles.fade, fadeStyle]}>
        <LinearGradient
          colors={[c.bg, `${c.bg}00`]}
          locations={[0.15, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'visible',
    zIndex: 2,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -FADE_HEIGHT,
    height: FADE_HEIGHT,
  },
});
