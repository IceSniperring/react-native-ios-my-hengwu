import { router } from 'expo-router';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import PagerView, { type PagerViewOnPageScrollEvent } from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetCard } from '../../src/components/AssetCard';
import { GlassIconButton } from '../../src/components/GlassIconButton';
import { OverviewCard } from '../../src/components/OverviewCard';
import { filterAssets, useOverview } from '../../src/hooks';
import { FilterTabs } from '../../src/native/FilterTabs';
import { NativeSegmented } from '../../src/native/NativeSegmented';
import { useStore } from '../../src/store';
import { useColors } from '../../src/useColors';
import {
  CATEGORIES,
  STATUS_FILTERS,
  type Asset,
  type AssetStatus,
  type CategoryId,
} from '../../src/types';

/**
 * Dual-Anchor Absorption home.
 *
 * Model (see the v8-final spec): each category page carries two discrete
 * anchors — `ca` (chrome anchor: chrome reading = clamp(ca + y, 0, heroH))
 * and `da` (content anchor: content visual = L - da - y). Anchoring happens
 * only at discrete moments (drag start, swipe, settle, mount); the per-frame
 * path is pure native-driver interpolation. The chrome is a single opaque
 * overlay driven by the selected page's Animated.Value, so the header tracks
 * the finger with zero JS involvement and swaps sources with zero jump.
 */

type Overview = {
  total: number;
  daily: number;
  active: number;
  retired: number;
  sold: number;
};

type Anchor = { ca: number; da: number };
const EMPTY_ANCHOR: Anchor = { ca: 0, da: 0 };

/** Fabric can deliver onLayout with a null nativeEvent; never trust the shape. */
function safeLayoutH(e: LayoutChangeEvent | null): number | null {
  const h = e?.nativeEvent?.layout?.height;
  return typeof h === 'number' && Number.isFinite(h) && h > 0 ? h : null;
}

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
  const statusIndex = Math.max(
    0,
    STATUS_FILTERS.findIndex((s) => s.id === status),
  );

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

  // ── Measurements (guarded; written once, then frozen) ──────────────────
  const [heroH, setHeroH] = useState(0);
  const [tabsH, setTabsH] = useState(0);
  const [frameH, setFrameH] = useState(0);
  const heroHRef = useRef(0);
  heroHRef.current = heroH;
  const setH = (setter: (updater: (current: number) => number) => void) =>
    (e: LayoutChangeEvent | null) => {
      const h = safeLayoutH(e);
      if (h !== null) setter((current) => (current === h ? current : h));
    };
  const onHeroLayout = setH(setHeroH);
  const onTabsLayout = setH(setTabsH);
  const onFrameLayout = setH(setFrameH);
  const ready = heroH > 0 && tabsH > 0 && frameH > 0;

  // ── Selection ────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<CategoryId>('all');
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  // ── Dual anchors, written ONLY by anchorPage() ────────────────────────
  const [anchors, setAnchors] = useState<Record<string, Anchor>>({});
  const anchorsRef = useRef(anchors);
  anchorsRef.current = anchors;
  const yRef = useRef<Record<string, number>>({});
  // Guards against two native-side races: iOS PagerView (SwiftUI TabView)
  // clamps its index and emits a stray onPageSelected when children shrink,
  // and children inserted/removed before the current index shift the native
  // page silently. Both are reconciled explicitly in the cats effect.
  const pendingResetRef = useRef<string | null>(null);
  const nativeIndexRef = useRef(0);
  const expandQueuedRef = useRef(false);
  const [titleA11yHidden, setTitleA11yHidden] = useState(true);
  const handlePageY = useCallback((id: string, y: number) => {
    yRef.current[id] = y;
    if (id !== selectedRef.current) return;
    // Live chrome reading drives the compact title's a11y visibility so it
    // always matches what is actually on screen (at most one state flip per
    // gesture; same-value setters bail out).
    const caLocal = anchorsRef.current[id]?.ca ?? 0;
    const reading = Math.min(Math.max(caLocal + y, 0), heroHRef.current);
    const hidden = reading < 56;
    setTitleA11yHidden((prev) => (prev === hidden ? prev : hidden));
  }, []);

  // Native per-page scroll values (UI thread). Chrome + title interpolate the
  // selected page's value — no JS in the per-frame path.
  const pageValues = useRef<Record<string, Animated.Value>>({}).current;
  const getValue = useCallback((id: string) => {
    let value = pageValues[id];
    if (!value) {
      value = new Animated.Value(0);
      pageValues[id] = value;
    }
    return value;
  }, [pageValues]);
  cats.forEach((cat) => getValue(cat.id));

  const pageOffset = useSharedValue(0);
  const pagerRef = useRef<PagerView>(null);

  /** The single source of truth for the current collapse amount C. */
  const currentC = useCallback(() => {
    const id = selectedRef.current;
    const a = anchorsRef.current[id]?.ca ?? 0;
    return Math.min(Math.max(a + (yRef.current[id] ?? 0), 0), heroHRef.current);
  }, []);

  /**
   * Anchor a page to the current chrome state.
   * - chrome anchor ca := C - y  → the chrome reads exactly C on the new
   *   source (zero-jump swap, shared collapse across categories).
   * - content anchor da := max(da_prev, C - y) → shallow pages lift so their
   *   first row glues under the chrome; deep pages keep their visual memory.
   * Never touches the selected driving page unless force=true.
   */
  const anchorPage = useCallback(
    (id: string | undefined, force = false) => {
      if (!id) return;
      if (!force && id === selectedRef.current) return;
      const y = yRef.current[id] ?? 0;
      const C = currentC();
      const ca = C - y;
      const da = Math.max(anchorsRef.current[id]?.da ?? C, C - y);
      const prev = anchorsRef.current[id];
      if (prev && prev.ca === ca && prev.da === da) return;
      if (__DEV__) {
        if (ca > heroHRef.current + 0.5) throw new Error('anchor: ca > heroH');
        if (da < ca - 0.5) throw new Error('anchor: no-gap invariant (da >= ca) broken');
        if (y > heroHRef.current - ca + 0.5)
          throw new Error('anchor: floor would clamp offset (C7)');
        if (Math.abs(Math.min(Math.max(ca + y, 0), heroHRef.current) - C) > 0.5)
          throw new Error('anchor: chrome discontinuity');
      }
      setAnchors((prevMap) =>
        prevMap[id] && prevMap[id].ca === ca && prevMap[id].da === da
          ? prevMap
          : { ...prevMap, [id]: { ca, da } },
      );
    },
    [currentC],
  );

  const absorbAt = useCallback(
    (pos: number) => {
      anchorPage(cats[pos]?.id);
    },
    [anchorPage, cats],
  );

  /** Birth anchor for freshly mounted pages (pristine y = 0). */
  const ensureBirthAnchor = useCallback(
    (id: string) => {
      if (!anchorsRef.current[id]) anchorPage(id, true);
    },
    [anchorPage],
  );

  // ── Chrome + title: native interpolation of the selected page's value ───
  const ca = (anchors[selectedId] ?? EMPTY_ANCHOR).ca;
  const chromeTranslateY = useMemo(() => {
    const h = Math.max(heroH, 1);
    return getValue(selectedId).interpolate({
      // -clamp(ca + y, 0, h)
      inputRange: [-ca, h - ca],
      outputRange: [0, -h],
      extrapolate: 'clamp',
      extrapolateRight: 'clamp',
    });
  }, [selectedId, ca, heroH, getValue]);
  const titleOpacity = useMemo(() => {
    return getValue(selectedId).interpolate({
      // Compact title fades in as the chrome collapse passes 56px.
      inputRange: [56 - ca, 80 - ca],
      outputRange: [0, 1],
      extrapolate: 'clamp',
      extrapolateRight: 'clamp',
    });
  }, [selectedId, ca, getValue]);

  /** Escape hatch: a fully collapsed fresh page has no scroll room to expand
      itself — tapping the compact title expands the shared chrome in place.
      Mid-deceleration the y bookkeeping lags by a few px, so the expansion is
      re-applied exactly once at the next idle with the settled offset. */
  const applyExpand = useCallback(() => {
    const id = selectedRef.current;
    const y = yRef.current[id] ?? 0;
    setAnchors((prev) => ({ ...prev, [id]: { ca: -y, da: -y } }));
  }, []);
  const expandHeader = useCallback(() => {
    if (currentC() <= 8) return;
    expandQueuedRef.current = true;
    applyExpand();
  }, [applyExpand, currentC]);

  // ── Category-set changes: materialize values, prune dead pages, reset ──
  useEffect(() => {
    cats.forEach((cat) => getValue(cat.id));
    const alive = new Set<string>(cats.map((cat) => cat.id));
    setAnchors((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of Object.keys(prev)) {
        if (!alive.has(id)) {
          delete next[id];
          delete yRef.current[id];
          delete pageValues[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    if (!alive.has(selectedRef.current) && cats[0]) {
      const first = cats[0].id;
      selectedRef.current = first;
      setSelectedId(first);
      // Arm the guard BEFORE the native command: iOS clamps a shrinking
      // children list and emits its own onPageSelected — that stray event
      // must not be treated as a real switch (avoids a double chrome jump).
      pendingResetRef.current = first;
      pageOffset.value = 0;
      nativeIndexRef.current = 0;
      pagerRef.current?.setPageWithoutAnimation(0);
      anchorPage(first, true);
    } else {
      // Insertions/removals BEFORE the current index shift the native
      // SwiftUI page silently (no onPageSelected fires) — realign the native
      // index to the still-alive selection.
      const idx = cats.findIndex((cat) => cat.id === selectedRef.current);
      if (idx >= 0 && idx !== nativeIndexRef.current) {
        pageOffset.value = idx;
        nativeIndexRef.current = idx;
        pagerRef.current?.setPageWithoutAnimation(idx);
      }
    }
  }, [cats, getValue, anchorPage, pageValues]);

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
        <View
          style={styles.pagerFrame}
          collapsable={false}
          onLayout={onFrameLayout}>
          {ready ? (
            <PagerView
              ref={pagerRef}
              style={StyleSheet.absoluteFill}
              initialPage={Math.max(
                0,
                cats.findIndex((cat) => cat.id === selectedId),
              )}
              offscreenPageLimit={Math.max(1, cats.length - 1)}
              onPageScroll={(e: PagerViewOnPageScrollEvent) => {
                const { position, offset } = e.nativeEvent;
                pageOffset.value = position + offset;
                // Idempotent double-neighbour absorption keeps cached pages
                // glued for the incoming frames; no direction heuristics.
                absorbAt(position - 1);
                absorbAt(position + 1);
              }}
              onPageSelected={(e) => {
                const pos = e.nativeEvent.position;
                const id = cats[pos]?.id;
                if (!id) return;
                const pending = pendingResetRef.current;
                if (pending) {
                  // Stray native children-clamp event — only the page the
                  // reset armed is allowed through.
                  if (id !== pending) return;
                  pendingResetRef.current = null;
                }
                nativeIndexRef.current = pos;
                // ref first so the forced anchor computes C from the new
                // source (which the drag-phase absorption already synced).
                selectedRef.current = id;
                anchorPage(id, true);
                setSelectedId(id);
              }}
              onPageScrollStateChanged={(e) => {
                const s = e.nativeEvent.pageScrollState;
                if (s === 'dragging') {
                  // Pre-anchor both neighbours BEFORE any displacement, so
                  // correctness never depends on per-frame onPageScroll
                  // delivery (JS-thread stalls become invisible).
                  const i = Math.round(pageOffset.value);
                  absorbAt(i - 1);
                  absorbAt(i + 1);
                } else if (s === 'idle') {
                  // Snap the tab marker to an exact page boundary at rest.
                  pageOffset.value = Math.round(pageOffset.value);
                  if (expandQueuedRef.current) {
                    // Re-apply the escape-hatch expansion with the settled
                    // offset (the tap may have landed mid-deceleration).
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
                  />
                </View>
              ))}
            </PagerView>
          ) : null}
        </View>

        {/* Single shared chrome, fully opaque, painted after the pager: lists
            can never show through it, and horizontal swipes can never move it. */}
        <Animated.View
          pointerEvents="box-none"
          style={[styles.chrome, { backgroundColor: c.bg }, { transform: [{ translateY: chromeTranslateY }] }]}>
          {heroBlock}
          <View
            onLayout={onTabsLayout}
            style={[styles.stickyBlock, { backgroundColor: c.bg }]}>
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

// ── One memo'd page per category ───────────────────────────────────
const CategoryPage = memo(function CategoryPage({
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
}) {
  const c = useColors();
  const { ca, da } = anchor; // frozen during vertical scrolling

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
      contentContainerStyle={{
        // maxScroll = heroH - ca — exactly the travel needed to (un)collapse
        // from the anchored state; short pages stop right at the pin. No
        // bottom padding: the floor alone defines the scroll domain.
        minHeight: frameH > 0 && heroH > 0 ? frameH + heroH - ca : undefined,
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}>
      {/* Purely visual translate; never touches contentOffset. */}
      <View style={{ transform: [{ translateY: -da }] }}>
        {/* Constant glue spacer matching the expanded chrome exactly. */}
        <View style={{ height: heroH + tabsH }} />
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
      </View>
    </Animated.ScrollView>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  topChrome: {
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  topRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titlePress: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  brand: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  body: { flex: 1, overflow: 'hidden' },
  pagerFrame: { flex: 1, overflow: 'hidden' },
  chrome: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  stickyBlock: { paddingBottom: 4 },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
