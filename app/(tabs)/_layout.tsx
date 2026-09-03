import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { router } from 'expo-router';

import { useColors } from '../../src/useColors';
import { useStore } from '../../src/store';

/**
 * Avoid DynamicColorIOS on NativeTabs tint/iconColor — iOS 26 liquid glass +
 * dynamic colors are buggy, and opaque objects in native tab props have also
 * been linked to awkward prop freezes in Fabric DEV. Resolve colors from the
 * app scheme instead (Appearance.setColorScheme already keeps UIKit in sync).
 */
export default function TabLayout() {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const screenBg = { backgroundColor: c.bg };
  const selected = c.tabSelected;
  const inactive = c.tabInactive;

  return (
    <NativeTabs
      tintColor={selected}
      minimizeBehavior="never"
      disableTransparentOnScrollEdge
      backgroundColor={scheme === 'dark' ? '#000000' : '#F2F2F7'}
      labelStyle={{
        default: { fontSize: 10, color: inactive },
        selected: { fontSize: 10, fontWeight: '700', color: selected },
      }}
      iconColor={{ default: inactive, selected }}>
      <NativeTabs.Trigger name="index" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: selected }}>资产</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'shippingbox', selected: 'shippingbox.fill' }}
          md="inventory_2"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: selected }}>洞悉</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }}
          md="pie_chart"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wishlist" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: selected }}>心愿</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          md="favorite"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: selected }}>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="person"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      {/*
        role="search" → trailing liquid-glass accessory.
        Do not use `disabled` + mutate listeners; preventDefault keeps the add
        route from focusing while still firing the press handler.
      */}
      <NativeTabs.Trigger
        name="add"
        role="search"
        contentStyle={screenBg}
        accessibilityLabel="添加物品"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/asset/form');
          },
        }}>
        <NativeTabs.Trigger.Label hidden>添加</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus" md="add" selectedColor={selected} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
