import { router } from 'expo-router';
import { memo, useLayoutEffect, useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { AssetCard } from '../components/AssetCard';
import { useColors } from '../useColors';
import type { Asset } from '../types';

type Anchor = { ca: number; da: number };

export const CategoryPage = memo(function CategoryPage({
  id,
  rows,
  anchor,
  heroH,
  tabsH,
  frameH,
  pageValue,
  onY,
  onMount,
  cardW,
  gap,
  pad,
  bottomPad,
}: {
  id: string;
  rows: Asset[][];
  anchor: Anchor;
  heroH: number;
  tabsH: number;
  frameH: number;
  pageValue: Animated.Value;
  onY: (id: string, y: number) => void;
  onMount: (id: string) => void;
  cardW: number;
  gap: number;
  pad: number;
  bottomPad: number;
}) {
  const c = useColors();
  const { ca, da } = anchor;
  const glueTop = Math.max(0, heroH + tabsH - da);

  useLayoutEffect(() => {
    onMount(id);
  }, [id, onMount]);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: pageValue } } }], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          onY(id, e.nativeEvent.contentOffset.y);
        },
      }),
    [id, pageValue, onY],
  );

  return (
    <Animated.ScrollView
      bounces={false}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        minHeight: frameH > 0 && heroH > 0 ? frameH + heroH - ca : undefined,
        paddingTop: glueTop,
        paddingBottom: bottomPad,
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}>
      {rows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>还没有这类资产</Text>
          <Text style={[styles.emptySub, { color: c.textSecondary }]}>
            点底部加号，把物品变成资产
          </Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: pad }}>
          {rows.map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                gap,
                marginBottom: i === rows.length - 1 ? 0 : gap,
              }}>
              {row.map((a) => (
                <AssetCard
                  key={a.id}
                  asset={a}
                  size={cardW}
                  onPress={() => router.push(`/asset/${a.id}`)}
                />
              ))}
              {row.length === 1 ? <View style={{ width: cardW }} /> : null}
            </View>
          ))}
        </View>
      )}
    </Animated.ScrollView>
  );
});

const styles = StyleSheet.create({
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
