import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab';

import { AssetCard } from '../components/AssetCard';
import { AssetContextMenu } from './AssetContextMenu';
import { useColors } from '../useColors';
import type { Asset } from '../types';
import { NextStepPlaceholder } from './NextStepPlaceholder';

function AssetRow({
  asset,
  cardW,
  selectMode,
  selected,
  onToggleSelect,
  onEnterSelect,
}: {
  asset: Asset;
  cardW: number;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEnterSelect: (id: string) => void;
}) {
  const box = { width: cardW, height: cardW };

  if (selectMode) {
    return (
      <AssetContextMenu
        asset={asset}
        size={cardW}
        selectMode
        onEnterSelect={onEnterSelect}>
        <AssetCard
          asset={asset}
          size={cardW}
          selectMode
          selected={selected}
          onPress={() => onToggleSelect(asset.id)}
        />
      </AssetContextMenu>
    );
  }

  return (
    <AssetContextMenu
      asset={asset}
      size={cardW}
      selectMode={false}
      onEnterSelect={onEnterSelect}>
      <Link href={`/asset/${asset.id}`} asChild>
        <Pressable style={box}>
          <Link.AppleZoom>
            <View collapsable={false} style={styles.zoomHost}>
              <AssetCard asset={asset} size={cardW} pressable={false} />
            </View>
          </Link.AppleZoom>
        </Pressable>
      </Link>
    </AssetContextMenu>
  );
}

export const CategoryPage = memo(function CategoryPage({
  rows,
  cardW,
  gap,
  pad,
  bottomPad,
  showNextStep,
  selectMode,
  selectedIds,
  onToggleSelect,
  onEnterSelect,
}: {
  rows: Asset[][];
  cardW: number;
  gap: number;
  pad: number;
  bottomPad: number;
  /** Only the "全部" tab shows the next-step actions strip (PR③ Sheet). */
  showNextStep?: boolean;
  selectMode: boolean;
  selectedIds: ReadonlySet<string>;
  onToggleSelect: (id: string) => void;
  onEnterSelect: (id: string) => void;
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
                <AssetRow
                  key={a.id}
                  asset={a}
                  cardW={cardW}
                  selectMode={selectMode}
                  selected={selectedIds.has(a.id)}
                  onEnterSelect={onEnterSelect}
                  onToggleSelect={onToggleSelect}
                />
              ))}
              {row.length === 1 ? <View style={{ width: cardW }} /> : null}
            </View>
          ))}
          {showNextStep ? (
            <View style={{ marginTop: 12 }}>
              <NextStepPlaceholder />
            </View>
          ) : null}
        </View>
      )}
      <View style={{ height: bottomPad }} />
    </Tabs.ScrollView>
  );
});

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1 },
  zoomHost: {
    width: '100%',
    height: '100%',
  },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
