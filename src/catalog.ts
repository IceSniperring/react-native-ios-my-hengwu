import { useMemo } from 'react';

import { useStore } from './store';
import { mergeCategories } from './types';

export function useSelectableCategories() {
  const custom = useStore((s) => s.customCategories);
  return useMemo(() => mergeCategories(custom).selectable, [custom]);
}

export function useCategoryLabel(id: string) {
  const cats = useSelectableCategories();
  return cats.find((c) => c.id === id)?.label ?? id;
}

export function useTagLibrary() {
  const stored = useStore((s) => s.tagLibrary);
  const assets = useStore((s) => s.assets);
  const wishes = useStore((s) => s.wishes);
  return useMemo(() => {
    const set = new Set(stored.map((t) => t.trim()).filter(Boolean));
    for (const a of assets) for (const t of a.tags ?? []) if (t.trim()) set.add(t.trim());
    for (const w of wishes) for (const t of w.tags ?? []) if (t.trim()) set.add(t.trim());
    return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [stored, assets, wishes]);
}
