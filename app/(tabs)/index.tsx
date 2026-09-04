import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import PagerView, { type PagerViewOnPageScrollEvent } from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '../../src/components/GlassIconButton';
import { OverviewCard } from '../../src/components/OverviewCard';
import { filterAssets, useOverview } from '../../src/hooks';
import { CategoryPage } from '../../src/home/CategoryPage';
import { styles } from '../../src/home/homeStyles';
import { useDualAnchorHome, useMeasuredHeight } from '../../src/home/useDualAnchorHome';
import { FilterTabs } from '../../src/native/FilterTabs';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';
import {
  CATEGORIES,
  STATUS_FILTERS,
  type Asset,
  type AssetStatus,
} from '../../src/types';

/** Dual-anchor home: ca/da glued at discrete moments; chrome follows selected page. */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { width } = useWindowDimensions();
  const assets = useStore((s) => s.assets);
  const overview = useOverview();

  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const gap = 10;
  const pad = 16;
  const cardW = (width - pad * 2 - gap) / 2;
  const statusIndex = Math.max(0, STATUS_FILTERS.findIndex((s) => s.id === status));

  const cats = useMemo(() => {
    return CATEGORIES.filter(
      (cat) => cat.id === 'all' || assets.some((a) => a.category === cat.id),
    );
  }, [assets]);

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

  const [heroH, onHeroLayout] = useMeasuredHeight();
  const [tabsH, onTabsLayout] = useMeasuredHeight();
  const [frameH, onFrameLayout] = useMeasuredHeight();
  const ready = heroH > 0 && tabsH > 0 && frameH > 0;

  const home = useDualAnchorHome(cats, heroH);
  const {
    selectedId,
    setSelectedId,
    selectedRef,
    anchors,
    handlePageY,
    getValue,
    pageOffset,
    pagerRef,
    currentC,
    anchorPage,
    absorbAt,
    ensureBirthAnchor,
    chromeTranslateY,
    titleOpacity,
    titleA11yHidden,
    expandHeader,
    applyExpand,
    expandQueuedRef,
    pendingResetRef,
    nativeIndexRef,
  } = home;

  const heroBlock = (
    <View
      onLayout={onHeroLayout}
      style={{ paddingHorizontal: pad, paddingTop: 4, backgroundColor: c.bg }}>
      <Text style={[styles.brand, { color: c.text }]}>有数</Text>
      <View style={{ paddingTop: 12 }}>
        <OverviewCard
          total={overview.total}
          daily={overview.daily}
          active={overview.active}
          retired={overview.retired}
          sold={overview.sold}
        />
      </View>
      <View style={{ height: 14 }} />
    </View>
  );

  return (
    <View collapsable={false} style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={[styles.topChrome, { paddingTop: insets.top, backgroundColor: c.bg }]}>
        <View style={styles.topRow}>
          <Pressable hitSlop={12} onPress={expandHeader} style={styles.titlePress}>
            <Animated.Text
              accessibilityElementsHidden={titleA11yHidden}
              style={[styles.compactTitle, { color: c.text, opacity: titleOpacity }]}>
              有数
            </Animated.Text>
          </Pressable>
          <View style={styles.topActions}>
            <GlassIconButton
              name="magnifyingglass"
              accessibilityLabel="搜索"
              onPress={() => router.push('/search')}
            />
            <GlassIconButton
              name="calendar"
              accessibilityLabel="购入日历"
              onPress={() => router.push('/calendar')}
            />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.pagerFrame} collapsable={false} onLayout={onFrameLayout}>
          {ready ? (
            <PagerView
              ref={pagerRef}
              style={StyleSheet.absoluteFill}
              initialPage={Math.max(0, cats.findIndex((cat) => cat.id === selectedId))}
              offscreenPageLimit={Math.max(1, cats.length - 1)}
              onPageScroll={(e: PagerViewOnPageScrollEvent) => {
                const { position, offset } = e.nativeEvent;
                pageOffset.value = position + offset;
                absorbAt(position - 1);
                absorbAt(position + 1);
              }}
              onPageSelected={(e) => {
                const pos = e.nativeEvent.position;
                const id = cats[pos]?.id;
                if (!id) return;
                const pending = pendingResetRef.current;
                if (pending) {
                  if (id !== pending) return;
                  pendingResetRef.current = null;
                }
                nativeIndexRef.current = pos;
                selectedRef.current = id;
                anchorPage(id, true);
                setSelectedId(id);
              }}
              onPageScrollStateChanged={(e) => {
                const s = e.nativeEvent.pageScrollState;
                if (s === 'dragging') {
                  const i = Math.round(pageOffset.value);
                  absorbAt(i - 1);
                  absorbAt(i + 1);
                } else if (s === 'idle') {
                  pageOffset.value = Math.round(pageOffset.value);
                  if (expandQueuedRef.current) {
                    expandQueuedRef.current = false;
                    applyExpand();
                  }
                }
              }}>
              {cats.map((cat) => (
                <View key={cat.id} collapsable={false} style={StyleSheet.absoluteFill}>
                  <CategoryPage
                    id={cat.id}
                    rows={rowsByCat[cat.id] ?? []}
                    anchor={anchors[cat.id] ?? { ca: currentC(), da: currentC() }}
                    heroH={heroH}
                    tabsH={tabsH}
                    frameH={frameH}
                    pageValue={getValue(cat.id)}
                    onY={handlePageY}
                    onMount={ensureBirthAnchor}
                    cardW={cardW}
                    gap={gap}
                    pad={pad}
                    bottomPad={insets.bottom + 88}
                  />
                </View>
              ))}
            </PagerView>
          ) : null}
        </View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.chrome, { backgroundColor: c.bg }, { transform: [{ translateY: chromeTranslateY }] }]}>
          {heroBlock}
          <View onLayout={onTabsLayout} style={[styles.stickyBlock, { backgroundColor: c.bg }]}>
            <FilterTabs
              items={cats}
              selected={selectedId}
              onSelect={(id) => {
                const i = cats.findIndex((cat) => cat.id === id);
                if (i >= 0) pagerRef.current?.setPage(i);
              }}
              pageOffset={pageOffset}
              onRequestPage={(index) => pagerRef.current?.setPage(index)}
            />
            <NativeSegmented
              values={STATUS_FILTERS.map((s) => s.label)}
              selectedIndex={statusIndex}
              onChange={(i) => setStatus(STATUS_FILTERS[i]?.id ?? 'all')}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
