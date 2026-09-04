import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent } from 'react-native';
import type PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';

import type { CategoryId } from '../types';

export type Anchor = { ca: number; da: number };
export const EMPTY_ANCHOR: Anchor = { ca: 0, da: 0 };

/** Guard null onLayout from Fabric. */
export function safeLayoutH(e: LayoutChangeEvent | null): number | null {
  const h = e?.nativeEvent?.layout?.height;
  return typeof h === 'number' && Number.isFinite(h) && h > 0 ? h : null;
}

export function useMeasuredHeight() {
  const [h, setH] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent | null) => {
    const next = safeLayoutH(e);
    if (next !== null) setH((current) => (current === next ? current : next));
  }, []);
  return [h, onLayout] as const;
}

export function useDualAnchorHome(cats: { id: CategoryId }[], heroH: number) {
  const heroHRef = useRef(0);
  heroHRef.current = heroH;

  const [selectedId, setSelectedId] = useState<CategoryId>('all');
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  const [anchors, setAnchors] = useState<Record<string, Anchor>>({});
  const anchorsRef = useRef(anchors);
  anchorsRef.current = anchors;
  const yRef = useRef<Record<string, number>>({});
  const pendingResetRef = useRef<string | null>(null);
  const nativeIndexRef = useRef(0);
  const expandQueuedRef = useRef(false);
  const [titleA11yHidden, setTitleA11yHidden] = useState(true);

  const handlePageY = useCallback((id: string, y: number) => {
    yRef.current[id] = y;
    if (id !== selectedRef.current) return;
    const caLocal = anchorsRef.current[id]?.ca ?? 0;
    const reading = Math.min(Math.max(caLocal + y, 0), heroHRef.current);
    const hidden = reading < 56;
    setTitleA11yHidden((prev) => (prev === hidden ? prev : hidden));
  }, []);

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

  const currentC = useCallback(() => {
    const id = selectedRef.current;
    const a = anchorsRef.current[id]?.ca ?? 0;
    return Math.min(Math.max(a + (yRef.current[id] ?? 0), 0), heroHRef.current);
  }, []);

  const anchorPage = useCallback(
    (id: string | undefined, force = false) => {
      if (!id) return;
      if (!force && id === selectedRef.current) return;
      const y = yRef.current[id] ?? 0;
      const C = currentC();
      const ca = C - y;
      const da = ca;
      const prev = anchorsRef.current[id];
      if (prev && prev.ca === ca && prev.da === da) return;
      if (__DEV__) {
        if (ca > heroHRef.current + 0.5) throw new Error('anchor: ca > heroH');
        if (Math.abs(da - ca) > 0.5) throw new Error('anchor: da must equal ca');
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

  const ensureBirthAnchor = useCallback(
    (id: string) => {
      if (!anchorsRef.current[id]) anchorPage(id, true);
    },
    [anchorPage],
  );

  const ca = (anchors[selectedId] ?? EMPTY_ANCHOR).ca;
  const chromeTranslateY = useMemo(() => {
    const h = Math.max(heroH, 1);
    return getValue(selectedId).interpolate({
      inputRange: [-ca, h - ca],
      outputRange: [0, -h],
      extrapolate: 'clamp',
      extrapolateRight: 'clamp',
    });
  }, [selectedId, ca, heroH, getValue]);
  const titleOpacity = useMemo(() => {
    return getValue(selectedId).interpolate({
      inputRange: [56 - ca, 80 - ca],
      outputRange: [0, 1],
      extrapolate: 'clamp',
      extrapolateRight: 'clamp',
    });
  }, [selectedId, ca, getValue]);

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
      pendingResetRef.current = first;
      pageOffset.value = 0;
      nativeIndexRef.current = 0;
      pagerRef.current?.setPageWithoutAnimation(0);
      anchorPage(first, true);
    } else {
      const idx = cats.findIndex((cat) => cat.id === selectedRef.current);
      if (idx >= 0 && idx !== nativeIndexRef.current) {
        pageOffset.value = idx;
        nativeIndexRef.current = idx;
        pagerRef.current?.setPageWithoutAnimation(idx);
      }
    }
  }, [cats, getValue, anchorPage, pageValues, pageOffset]);

  return {
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
  };
}
