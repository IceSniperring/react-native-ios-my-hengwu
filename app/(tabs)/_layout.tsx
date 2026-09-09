import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { router, usePathname } from 'expo-router';
import { useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { LIME } from '../../src/theme';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';

export default function TabLayout() {
  const c = useColors();
  const scheme = useStore((s) => s.colorScheme);
  const pathname = usePathname();
  const onWishlist = pathname.includes('wishlist');
  const onWishlistRef = useRef(onWishlist);
  onWishlistRef.current = onWishlist;
  const selected = c.tabSelected;
  const inactive = c.tabInactive;

  const screenBg = useMemo(() => ({ backgroundColor: c.bg }), [c.bg]);
  const blurEffect = useMemo(
    () => (scheme === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'),
    [scheme],
  );
  const labelStyle = useMemo(
    () => ({
      default: { fontSize: 10, color: inactive },
      selected: { fontSize: 10, fontWeight: '600' as const, color: selected },
    }),
    [inactive, selected],
  );
  const iconColor = useMemo(() => ({ default: inactive, selected }), [inactive, selected]);
  const selectedStyle = useMemo(() => ({ color: selected }), [selected]);
  const addListener = useMemo(
    () => ({
      tabPress: () => {
        if (onWishlistRef.current) router.push('/asset/form?kind=wish');
        else router.push('/asset/form');
      },
    }),
    [],
  );

  return (
    <NativeTabs
      tintColor={selected}
      minimizeBehavior="onScrollDown"
      backgroundColor="transparent"
      disableTransparentOnScrollEdge
      blurEffect={blurEffect}
      labelVisibilityMode={Platform.OS === 'android' ? 'labeled' : undefined}
      indicatorColor={Platform.OS === 'android' ? LIME : undefined}
      rippleColor={Platform.OS === 'android' ? 'rgba(169,214,46,0.24)' : undefined}
      labelStyle={labelStyle}
      iconColor={iconColor}>
      <NativeTabs.Trigger name="index" contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={selectedStyle}>资产</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'archivebox', selected: 'archivebox.fill' }}
          md="inventory_2"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights" disableAutomaticContentInsets contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={selectedStyle}>洞悉</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }}
          md="pie_chart"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wishlist" disableAutomaticContentInsets contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={selectedStyle}>心愿</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          md="favorite"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" disableAutomaticContentInsets contentStyle={screenBg}>
        <NativeTabs.Trigger.Label selectedStyle={selectedStyle}>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="person"
          selectedColor={selected}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="add"
        role="search"
        hidden={Platform.OS !== 'ios'}
        disabled
        contentStyle={screenBg}
        accessibilityLabel={onWishlist ? '添加心愿' : '添加物品'}
        listeners={addListener}>
        <NativeTabs.Trigger.Label hidden>添加</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus" md="add" selectedColor={selected} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
