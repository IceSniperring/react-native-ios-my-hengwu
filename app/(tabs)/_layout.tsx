import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { router, usePathname } from 'expo-router';
import { useRef } from 'react';
import { Platform } from 'react-native';

import { LIME } from '../../src/theme';
import { useColors } from '../../src/useColors';

export default function TabLayout() {
  const c = useColors();
  const pathname = usePathname();
  const onWishlist = pathname.includes('wishlist');
  const onWishlistRef = useRef(onWishlist);
  onWishlistRef.current = onWishlist;
  const screenBg = { backgroundColor: c.bg };
  // Lime selected tint for the tab bar (not system blue).
  const selected = c.tabSelected;
  const inactive = c.tabInactive;

  return (
    <NativeTabs
      tintColor={selected}
      minimizeBehavior="never"
      disableTransparentOnScrollEdge
      backgroundColor={c.bg}
      labelVisibilityMode={Platform.OS === 'android' ? 'labeled' : undefined}
      indicatorColor={Platform.OS === 'android' ? LIME : undefined}
      rippleColor={Platform.OS === 'android' ? 'rgba(169,214,46,0.24)' : undefined}
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
      <NativeTabs.Trigger name="insights" disableAutomaticContentInsets contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: selected }}>洞悉</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }}
          md="pie_chart"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wishlist" disableAutomaticContentInsets contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: selected }}>心愿</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          md="favorite"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" disableAutomaticContentInsets contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={{ color: selected }}>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="person"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      {/*
        role="search" → trailing liquid-glass accessory.
        Native tabPress event often has no preventDefault — use `disabled`
        (maps to preventSelection) and open the form from the listener.
        add.tsx Redirect is a safety net if the route is ever focused.
      */}
      <NativeTabs.Trigger
        name="add"
        role="search"
        hidden={Platform.OS !== 'ios'}
        disabled
        contentStyle={screenBg}
        accessibilityLabel={onWishlist ? '添加心愿' : '添加物品'}
        listeners={{
          tabPress: () => {
            if (onWishlistRef.current) router.push('/asset/form?kind=wish');
            else router.push('/asset/form');
          },
        }}>
        <NativeTabs.Trigger.Label hidden>添加</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus" md="add" selectedColor={selected} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
