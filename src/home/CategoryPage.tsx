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

// ── One memo'd page per category ──────────────────────────────────────────
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
  const { ca, da } = anchor; // frozen during vertical scrolling
  // Layout-correct glue: paddingTop shrinks as da rises so the first row
  // sits under the sticky tabs without a transform that desyncs scroll size.
  const glueTop = Math.max(0, heroH + tabsH - da);

  // Birth anchor: a freshly (re)mounted page starts pristine (y = 0) glued
  // to the current chrome state.
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
      // The chrome zone above the list is a hard boundary: no rubber-banding
      // may pull content or background into the region under the tabs.
      bounces={false}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        // maxScroll = heroH - ca — exactly the travel needed to (un)collapse
        // from the anchored state; short pages stop right at the pin.
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
