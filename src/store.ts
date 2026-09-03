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
import type { Asset, SavingsPlan, WishItem } from './types';

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

type State = {
  hydrated: boolean;
  colorScheme: ColorScheme;
  assets: Asset[];
  wishes: WishItem[];
  plans: SavingsPlan[];
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
        }),
      clearAll: () => set({ assets: [], wishes: [], plans: [] }),
    }),
    {
      name: 'youshu-db',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        assets: s.assets,
        wishes: s.wishes,
        plans: s.plans,
        colorScheme: s.colorScheme,
      }),
      onRehydrateStorage: () => () => useStore.getState().setHydrated(),
    },
  ),
);
