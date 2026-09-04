import { View } from 'react-native';
import type { TabBarRenderProps } from 'react-native-collapsible-tab';

import { FilterTabs } from '../native/FilterTabs';
import { NativeSegmented } from '../native/NativeSegmented';
import { STATUS_FILTERS, type CategoryId } from '../types';
import { useColors } from '../useColors';

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

  return (
    <View style={{ backgroundColor: c.bg, paddingBottom: 4 }}>
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
    </View>
  );
}
