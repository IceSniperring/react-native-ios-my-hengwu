import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab';

import { AssetCard } from '../components/AssetCard';
import { useColors } from '../useColors';
import type { Asset } from '../types';

export const CategoryPage = memo(function CategoryPage({
  rows,
  cardW,
  gap,
  pad,
  bottomPad,
}: {
  rows: Asset[][];
  cardW: number;
  gap: number;
  pad: number;
  bottomPad: number;
}) {
  const c = useColors();

  return (
    <Tabs.ScrollView
      style={styles.fill}
      bounces
      alwaysBounceVertical
      directionalLockEnabled
      nestedScrollEnabled
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      scrollIndicatorInsets={{ bottom: bottomPad }}
      contentContainerStyle={styles.content}
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
      {/* Clears the floating tab bar for long lists. Short lists still only
          scroll far enough to collapse the overview — extra space is empty,
          not extra offset, so the last card cannot be pushed under the tabs. */}
      <View style={{ height: bottomPad }} />
    </Tabs.ScrollView>
  );
});

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1 },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
