import { create } from 'zustand';

type CloudUiState = {
  migrated: boolean;
  migrating: boolean;
  migrateError: string | null;
  writeError: string | null;
  pendingRetry: (() => Promise<void>) | null;
  setMigrated: (v: boolean) => void;
  setMigrating: (v: boolean) => void;
  setMigrateError: (e: string | null) => void;
  setWriteError: (e: string | null, retry?: (() => Promise<void>) | null) => void;
  clearWriteError: () => void;
};

export const useCloudUiStore = create<CloudUiState>((set) => ({
  migrated: false,
  migrating: false,
  migrateError: null,
  writeError: null,
  pendingRetry: null,
  setMigrated: (v) => set({ migrated: v }),
  setMigrating: (v) => set({ migrating: v }),
  setMigrateError: (e) => set({ migrateError: e }),
  setWriteError: (e, retry = null) => set({ writeError: e, pendingRetry: retry }),
  clearWriteError: () => set({ writeError: null, pendingRetry: null }),
}));
