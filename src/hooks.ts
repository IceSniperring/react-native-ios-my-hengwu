import { useMemo } from 'react';

import { dailyCost } from './calc';
import { useStore } from './store';
import type { AssetStatus, CategoryId } from './types';

export function useAsset(id?: string) {
  return useStore((s) => s.assets.find((a) => a.id === id));
}

export function useFilteredAssets(category: CategoryId, status: AssetStatus | 'all', q = '') {
  const assets = useStore((s) => s.assets);
  return useMemo(() => {
    const query = q.trim().toLowerCase();
    return assets.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (query && !a.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [assets, category, status, q]);
}

export function useOverview() {
  const assets = useStore((s) => s.assets);
  return useMemo(() => {
    const active = assets.filter((a) => a.status === 'active');
    const retired = assets.filter((a) => a.status === 'retired');
    const sold = assets.filter((a) => a.status === 'sold');
    const total = [...active, ...retired].reduce((s, a) => s + a.purchasePrice, 0);
    const daily = active.reduce((s, a) => s + dailyCost(a), 0);
    const soldValue = sold.reduce((s, a) => s + (a.soldPrice ?? 0), 0);
    const idleValue = retired.reduce((s, a) => s + a.purchasePrice, 0);
    const activeValue = active.reduce((s, a) => s + a.purchasePrice, 0);
    return {
      assets,
      active: active.length,
      retired: retired.length,
      sold: sold.length,
      total,
      daily,
      activeValue,
      idleValue,
      soldValue,
    };
  }, [assets]);
}
