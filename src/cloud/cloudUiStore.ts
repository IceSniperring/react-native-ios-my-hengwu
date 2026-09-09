import { create } from 'zustand';

export type PendingCloudWrite =
  | { kind: 'create'; asset: Record<string, unknown> }
  | { kind: 'update'; id: string; patch: Record<string, unknown> }
  | { kind: 'delete'; id: string }
  | { kind: 'migrate' };

type State = {
  writeError: string | null;
  pending: PendingCloudWrite | null;
  migrating: boolean;
  migrateError: string | null;
  migrated: boolean | null;
  setMigrated: (v: boolean | null) => void;
  setMigrating: (v: boolean) => void;
  setMigrateError: (msg: string | null) => void;
  setWriteFailure: (pending: PendingCloudWrite, message?: string) => void;
  clearWriteError: () => void;
};

export const WRITE_FAIL_MSG = '未能保存到云端，本机仍保留草稿';

export const useCloudUiStore = create<State>((set) => ({
  writeError: null,
  pending: null,
  migrating: false,
  migrateError: null,
  migrated: null,
  setMigrated: (v) => set({ migrated: v }),
  setMigrating: (v) => set({ migrating: v }),
  setMigrateError: (msg) => set({ migrateError: msg }),
  setWriteFailure: (pending, message = WRITE_FAIL_MSG) =>
    set({ writeError: message, pending }),
  clearWriteError: () => set({ writeError: null, pending: null }),
}));
