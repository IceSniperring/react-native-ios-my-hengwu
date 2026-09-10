import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Tabs, type CollapsingTabsRef, type TabBarRenderProps } from 'react-native-collapsible-tab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddFab } from '../../src/components/AddFab';
import { CloudWriteBanner } from '../../src/cloud/CloudWriteBanner';
import { useCloudAssets } from '../../src/cloud/useCloudAssets';
import { GlassIconButton } from '../../src/components/GlassIconButton';
import { filterAssets, useOverview } from '../../src/hooks';
import { CategoryPage } from '../../src/home/CategoryPage';
import { HomeHeader } from '../../src/home/HomeHeader';
import { HomeTabBar } from '../../src/home/HomeTabBar';
import { styles } from '../../src/home/homeStyles';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';
import { useSelectableCategories } from '../../src/catalog';
import { STATUS_FILTERS, type Asset, type AssetStatus } from '../../src/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { width } = useWindowDimensions();
  const assets = useStore((s) => s.assets);
  const catalog = useSelectableCategories();
  const overview = useOverview();
  const tabsRef = useRef<CollapsingTabsRef>(null);
  const collapseProgress = useSharedValue(0);
  const { updateAsset, removeAsset, refreshFromCloud, loadMigrated } = useCloudAssets();
  const menuPickerAssetId = useStore((s) => s.menuPickerAssetId);
  const setMenuPickerAssetId = useStore((s) => s.setMenuPickerAssetId);
  const categoryPickerResult = useStore((s) => s.categoryPickerResult);
  const tagPickerResult = useStore((s) => s.tagPickerResult);
  const clearCategoryPickerResult = useStore((s) => s.clearCategoryPickerResult);
  const clearTagPickerResult = useStore((s) => s.clearTagPickerResult);
  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const gap = 10;
  const pad = 16;
  const cardW = (width - pad * 2 - gap) / 2;
  const bottomPad = Platform.OS === 'ios' ? insets.bottom + 120 : 96;
  const statusIndex = Math.max(0, STATUS_FILTERS.findIndex((s) => s.id === status));

  useEffect(() => { void loadMigrated(); void refreshFromCloud(); }, [loadMigrated, refreshFromCloud]);
  const cats = useMemo(() => [{ id: 'all', label: '全部' }, ...catalog.filter((cat) => assets.some((a) => a.category === cat.id))], [assets, catalog]);
  const rowsByCat = useMemo(() => {
    const map: Record<string, Asset[][]> = {};
    for (const cat of cats) {
      const list = filterAssets(assets, cat.id, status);
      const rows: Asset[][] = [];
      for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
      map[cat.id] = rows;
    }
    return map;
  }, [assets, cats, status]);

  useEffect(() => {
    if (!categoryPickerResult || !menuPickerAssetId) return;
    void updateAsset(menuPickerAssetId, { category: categoryPickerResult });
    clearCategoryPickerResult(); setMenuPickerAssetId(null);
  }, [categoryPickerResult, menuPickerAssetId, updateAsset, clearCategoryPickerResult, setMenuPickerAssetId]);
  useEffect(() => {
    if (!tagPickerResult || !menuPickerAssetId) return;
    void updateAsset(menuPickerAssetId, { tags: tagPickerResult });
    clearTagPickerResult(); setMenuPickerAssetId(null);
  }, [tagPickerResult, menuPickerAssetId, updateAsset, clearTagPickerResult, setMenuPickerAssetId]);

  const expandHeader = useCallback(() => tabsRef.current?.scrollToTop(true), []);
  const onStatusChange = useCallback((i: number) => setStatus(STATUS_FILTERS[i]?.id ?? 'all'), []);
  const exitSelect = useCallback(() => { setSelectMode(false); setSelectedIds(new Set()); }, []);
  const enterSelect = useCallback((id: string) => { setSelectMode(true); setSelectedIds(new Set([id])); }, []);
  const toggleSelect = useCallback((id: string) => setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }), []);
  const deleteSelected = useCallback(() => {
    const count = selectedIds.size; if (!count) return;
    Alert.alert('删除资产', count === 1 ? '删除后无法恢复。' : `删除选中的 ${count} 项后无法恢复。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => { for (const id of selectedIds) void removeAsset(id); exitSelect(); } },
    ]);
  }, [selectedIds, removeAsset, exitSelect]);
  const compactTitleStyle = useAnimatedStyle(() => ({ opacity: interpolate(collapseProgress.value, [0.35, 0.75], [0, 1], Extrapolation.CLAMP) }));
  const renderHeader = useCallback(() => <HomeHeader overview={overview} collapseProgress={collapseProgress} />, [overview, collapseProgress]);
  const renderTabBar = useCallback((props: TabBarRenderProps) => <HomeTabBar {...props} cats={cats} statusIndex={statusIndex} onStatusChange={onStatusChange} />, [cats, statusIndex, onStatusChange]);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={[styles.topChrome, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <View style={styles.topRow}>
          <Pressable hitSlop={12} onPress={expandHeader} style={styles.titlePress}><Animated.Text style={[styles.compactTitle, { color: c.text }, compactTitleStyle]}>{selectMode ? `已选 ${selectedIds.size}` : '衡物'}</Animated.Text></Pressable>
          <View style={styles.topActions}>{selectMode ? <GlassIconButton name="xmark" accessibilityLabel="退出选择" onPress={exitSelect} /> : <><GlassIconButton name="magnifyingglass" accessibilityLabel="搜索" onPress={() => router.push('/search')} /><GlassIconButton name="calendar" accessibilityLabel="购入日历" onPress={() => router.push('/calendar')} /></>}</View>
        </View>
      </View>
      <CloudWriteBanner />
      <Tabs.Container ref={tabsRef} renderHeader={renderHeader} renderTabBar={renderTabBar} minHeaderHeight={0} headerBackgroundColor={c.bg} headerContainerStyle={styles.headerOverflow} containerStyle={styles.body} initialTabName="all" pagerProps={{ offscreenPageLimit: Math.max(1, cats.length - 1) }}>
        {cats.map((cat) => <Tabs.Tab key={cat.id} name={cat.id} label={cat.label}><CategoryPage rows={rowsByCat[cat.id] ?? []} cardW={cardW} gap={gap} pad={pad} bottomPad={bottomPad} selectMode={selectMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} onEnterSelect={enterSelect} /></Tabs.Tab>)}
      </Tabs.Container>
      {selectMode && selectedIds.size > 0 ? <View pointerEvents="box-none" style={[selectBar.wrap, { bottom: insets.bottom + (Platform.OS === 'ios' ? 110 : 84) }]}><Pressable onPress={deleteSelected} style={({ pressed }) => [selectBar.btn, { backgroundColor: c.danger, opacity: pressed ? 0.88 : 1 }]}><Text style={[selectBar.btnText, { color: '#FFFFFF' }]}>删除 {selectedIds.size} 项</Text></Pressable></View> : null}
      {!selectMode ? <AddFab accessibilityLabel="添加物品" onPress={() => router.push('/asset/form')} /> : null}
    </GestureHandlerRootView>
  );
}

const selectBar = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  btn: { minHeight: 48, paddingHorizontal: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center', shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  btnText: { fontSize: 16, fontWeight: '700' },
});
