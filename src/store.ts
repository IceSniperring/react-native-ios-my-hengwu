import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ColorScheme } from './theme';

const safeStorage = {
  getItem: async (name: string) => {
    if (typeof window === 'undefined') return null;
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    if (typeof window === 'undefined') return;
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    if (typeof window === 'undefined') return;
    await AsyncStorage.removeItem(name);
  },
};

import { demoAssets, demoPlans, demoWishes } from './seed';
import { isBuiltinCategory, mergeCategories, type Asset, type CatalogItem, type SavingsPlan, type WishItem } from './types';

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

type State = {
  hydrated: boolean;
  colorScheme: ColorScheme;
  assets: Asset[];
  wishes: WishItem[];
  plans: SavingsPlan[];
  customCategories: CatalogItem[];
  tagLibrary: string[];
  setHydrated: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  addAsset: (asset: Omit<Asset, 'id'> & { id?: string }) => string;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  addWish: (wish: Omit<WishItem, 'id'> & { id?: string }) => string;
  updateWish: (id: string, patch: Partial<WishItem>) => void;
  removeWish: (id: string) => void;
  addPlan: (plan: Omit<SavingsPlan, 'id'> & { id?: string }) => string;
  updatePlan: (id: string, patch: Partial<SavingsPlan>) => void;
  contributePlan: (id: string, amount: number) => void;
  restoreDemo: () => void;
  clearAll: () => void;
  addCategory: (label: string) => string | null;
  renameCategory: (id: string, label: string) => void;
  removeCategory: (id: string) => void;
  addTag: (label: string) => string | null;
  removeTag: (label: string) => void;
  tagPickerSeed: string[];
  tagPickerResult: string[] | null;
  beginTagPicker: (selected: string[]) => void;
  commitTagPicker: (selected: string[]) => void;
  clearTagPickerResult: () => void;
  categoryPickerSeed: string;
  categoryPickerResult: string | null;
  beginCategoryPicker: (selected: string) => void;
  commitCategoryPicker: (selected: string) => void;
  clearCategoryPickerResult: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      colorScheme: 'light',
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      assets: demoAssets(),
      wishes: demoWishes(),
      plans: demoPlans(),
      customCategories: [],
      tagLibrary: ['主力', '配件', '礼物'],
      setHydrated: () => set({ hydrated: true }),
      addAsset: (asset) => {
        const id = asset.id ?? uid('a');
        set({ assets: [{ ...asset, id }, ...get().assets] });
        return id;
      },
      updateAsset: (id, patch) =>
        set({
          assets: get().assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }),
      removeAsset: (id) => set({ assets: get().assets.filter((a) => a.id !== id) }),
      addWish: (wish) => {
        const id = wish.id ?? uid('w');
        set({ wishes: [{ ...wish, id }, ...get().wishes] });
        return id;
      },
      updateWish: (id, patch) =>
        set({
          wishes: get().wishes.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        }),
      removeWish: (id) => set({ wishes: get().wishes.filter((w) => w.id !== id) }),
      addPlan: (plan) => {
        const id = plan.id ?? uid('s');
        set({ plans: [{ ...plan, id }, ...get().plans] });
        return id;
      },
      updatePlan: (id, patch) =>
        set({
          plans: get().plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),
      contributePlan: (id, amount) =>
        set({
          plans: get().plans.map((p) =>
            p.id === id ? { ...p, currentAmount: Math.max(0, p.currentAmount + amount) } : p,
          ),
        }),
      restoreDemo: () =>
        set({
          assets: demoAssets(),
          wishes: demoWishes(),
          plans: demoPlans(),
          customCategories: [],
          tagLibrary: ['主力', '配件', '礼物'],
        }),
      clearAll: () => set({ assets: [], wishes: [], plans: [], customCategories: [], tagLibrary: [] }),
      addCategory: (label) => {
        const name = label.trim();
        if (!name) return null;
        const cats = mergeCategories(get().customCategories).selectable;
        if (cats.some((c) => c.label === name)) return cats.find((c) => c.label === name)!.id;
        const id = uid('cat');
        set({ customCategories: [...get().customCategories, { id, label: name }] });
        return id;
      },
      renameCategory: (id, label) => {
        const name = label.trim();
        if (!name || isBuiltinCategory(id)) return;
        set({
          customCategories: get().customCategories.map((c) => (c.id === id ? { ...c, label: name } : c)),
        });
      },
      removeCategory: (id) => {
        if (isBuiltinCategory(id)) return;
        set({
          customCategories: get().customCategories.filter((c) => c.id !== id),
          assets: get().assets.map((a) => (a.category === id ? { ...a, category: 'uncategorized' } : a)),
          wishes: get().wishes.map((w) => (w.category === id ? { ...w, category: 'uncategorized' } : w)),
        });
      },
      addTag: (label) => {
        const name = label.trim();
        if (!name) return null;
        const exists = get().tagLibrary.some((t) => t === name);
        if (!exists) set({ tagLibrary: [...get().tagLibrary, name] });
        return name;
      },
      removeTag: (label) => {
        set({
          tagLibrary: get().tagLibrary.filter((t) => t !== label),
          assets: get().assets.map((a) => ({ ...a, tags: (a.tags ?? []).filter((t) => t !== label) })),
          wishes: get().wishes.map((w) => ({ ...w, tags: (w.tags ?? []).filter((t) => t !== label) })),
        });
      },
      tagPickerSeed: [],
      tagPickerResult: null,
      beginTagPicker: (selected) => set({ tagPickerSeed: selected, tagPickerResult: null }),
      commitTagPicker: (selected) => set({ tagPickerResult: selected }),
      clearTagPickerResult: () => set({ tagPickerResult: null }),
      categoryPickerSeed: 'digital',
      categoryPickerResult: null,
      beginCategoryPicker: (selected) => set({ categoryPickerSeed: selected, categoryPickerResult: null }),
      commitCategoryPicker: (selected) => set({ categoryPickerResult: selected }),
      clearCategoryPickerResult: () => set({ categoryPickerResult: null }),
    }),
    {
      name: 'hengwu-db',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        assets: s.assets,
        wishes: s.wishes,
        plans: s.plans,
        colorScheme: s.colorScheme,
        customCategories: s.customCategories,
        tagLibrary: s.tagLibrary,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          customCategories: p.customCategories ?? [],
          tagLibrary: p.tagLibrary ?? [],
        };
      },
      onRehydrateStorage: () => () => useStore.getState().setHydrated(),
    },
  ),
);
