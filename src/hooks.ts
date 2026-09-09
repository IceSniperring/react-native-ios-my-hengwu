import { useMemo } from 'react';

import { dailyCost } from './calc';
import { useStore } from './store';
import type { Asset, AssetStatus, CategoryId } from './types';

export function useAsset(id?: string) {
  return useStore((s) => s.assets.find((a) => a.id === id));
}

export function filterAssets(
  assets: Asset[],
  category: CategoryId,
  status: AssetStatus | 'all',
  q = '',
) {
  const query = q.trim().toLowerCase();
  return assets
    .filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (query && !a.name.toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => Number(!!b.starred) - Number(!!a.starred));
}

export function useFilteredAssets(category: CategoryId, status: AssetStatus | 'all', q = '') {
  const assets = useStore((s) => s.assets);
  return useMemo(() => filterAssets(assets, category, status, q), [assets, category, status, q]);
}

export type ShareBucketId = 'cash' | 'fund' | 'digital' | 'other';

const SHARE_LABEL: Record<ShareBucketId, string> = {
  cash: '现金',
  fund: '基金',
  digital: '数码',
  other: '其他',
};

/** Map existing category ids onto MVP share buckets (现金/基金/数码/其他). */
export function shareBucketForCategory(category: string): ShareBucketId {
  if (category === 'cash' || category === '现金') return 'cash';
  if (category === 'fund' || category === '基金') return 'fund';
  if (category === 'digital') return 'digital';
  return 'other';
}

export function computeCategoryShares(assets: Asset[]) {
  const held = assets.filter((a) => a.status !== 'sold');
  const buckets: Record<ShareBucketId, number> = {
    cash: 0,
    fund: 0,
    digital: 0,
    other: 0,
  };
  for (const a of held) {
    buckets[shareBucketForCategory(a.category)] += a.purchasePrice;
  }
  const sum = Object.values(buckets).reduce((s, v) => s + v, 0);
  const order: ShareBucketId[] = ['cash', 'fund', 'digital', 'other'];
  return order
    .map((id) => {
      const value = buckets[id];
      return {
        id,
        label: SHARE_LABEL[id],
        value,
        pct: sum > 0 ? Math.round((value / sum) * 100) : 0,
      };
    })
    .filter((row) => row.value > 0);
}

export function useOverview() {
  const assets = useStore((s) => s.assets);
  return useMemo(() => {
    const active = assets.filter((a) => a.status === 'active');
    const retired = assets.filter((a) => a.status === 'retired');
    const sold = assets.filter((a) => a.status === 'sold');
    const held = [...active, ...retired];
    const total = held.reduce((s, a) => s + a.purchasePrice, 0);
    const holdingCost = assets.reduce((s, a) => s + a.purchasePrice, 0);
    const daily = active.reduce((s, a) => s + dailyCost(a), 0);
    const soldValue = sold.reduce((s, a) => s + (a.soldPrice ?? 0), 0);
    const idleValue = retired.reduce((s, a) => s + a.purchasePrice, 0);
    const activeValue = active.reduce((s, a) => s + a.purchasePrice, 0);
    const shares = computeCategoryShares(assets);
    return {
      assets,
      active: active.length,
      retired: retired.length,
      sold: sold.length,
      total,
      holdingCost,
      daily,
      activeValue,
      idleValue,
      soldValue,
      shares,
    };
  }, [assets]);
}
