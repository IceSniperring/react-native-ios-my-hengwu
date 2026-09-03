import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { router } from 'expo-router';
import { DynamicColorIOS, Platform } from 'react-native';

import { useColors } from '../../src/useColors';
import { useStore } from '../../src/store';

const iosTabInactive = DynamicColorIOS({ light: '#8E8E93', dark: '#98989D' });
const iosTabSelected = DynamicColorIOS({ light: '#007AFF', dark: '#0A84FF' });

export default function TabLayout() {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const screenBg = { backgroundColor: c.bg };
  const selected = Platform.OS === 'ios' ? iosTabSelected : c.tabSelected;
  const inactive = Platform.OS === 'ios' ? iosTabInactive : c.tabInactive;

  return (
    <NativeTabs
      // Force native chrome to match app scheme; Liquid Glass samples this.
      tintColor={selected}
      minimizeBehavior="never"
      disableTransparentOnScrollEdge
      // Opaque enough on older iOS; iOS 26 still benefits from consistent icon colors.
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
        <NativeTabs.Trigger.Icon sf="plus" md="add" selectedColor={selected} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
