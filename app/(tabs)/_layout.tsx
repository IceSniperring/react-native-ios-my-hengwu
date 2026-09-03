import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { router } from 'expo-router';

import { useColors } from '../../src/useColors';

export default function TabLayout() {
  const c = useColors();
  const screenBg = { backgroundColor: c.bg };

  return (
    <NativeTabs
      tintColor={c.tabSelected}
      minimizeBehavior="never"
      disableTransparentOnScrollEdge
      labelStyle={{
        default: { fontSize: 10, color: c.tabInactive },
        selected: { fontSize: 10, fontWeight: '700', color: c.tabSelected },
      }}
      iconColor={{ default: c.tabInactive, selected: c.tabSelected }}>
      <NativeTabs.Trigger name="index" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: c.tabSelected }}>资产</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'shippingbox', selected: 'shippingbox.fill' }}
          md="inventory_2"
          selectedColor={c.tabSelected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: c.tabSelected }}>洞悉</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }}
          md="pie_chart"
          selectedColor={c.tabSelected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wishlist" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: c.tabSelected }}>心愿</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          md="favorite"
          selectedColor={c.tabSelected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: c.tabSelected }}>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="person"
          selectedColor={c.tabSelected}
        />
      </NativeTabs.Trigger>
      {/*
        role="search" asks iOS to place this item outside the main tab capsule
        (trailing separate liquid-glass control), matching the split + button layout.
      */}
      <NativeTabs.Trigger
        name="add"
        role="search"
        disabled
        contentStyle={screenBg}
        accessibilityLabel="添加物品"
        listeners={{
          tabPress: () => {
            router.push('/asset/form');
          },
        }}>
        <NativeTabs.Trigger.Label hidden>添加</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus" md="add" selectedColor={c.tabSelected} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
