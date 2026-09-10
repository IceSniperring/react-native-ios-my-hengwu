import { useAuth } from '@clerk/expo';
import { useCallback } from 'react';

import { useStore } from '../store';
import type { Asset } from '../types';
import {
  createRemoteAsset,
  deleteRemoteAsset,
  fetchRemoteAssets,
  patchRemoteAsset,
  postMigrate,
} from './assetsApi';
import { useCloudUiStore } from './cloudUiStore';
import { getMigratedFlag, setMigratedFlag } from './migrateFlag';

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Assets CRUD: local Zustand is the signed-in cache; when signed in, mutations
 * also hit the cloud API. Failures keep local drafts and surface a retry banner.
 */
export function useCloudAssets() {
  const { isSignedIn, getToken, userId } = useAuth();
  const addAssetLocal = useStore((s) => s.addAsset);
  const updateAssetLocal = useStore((s) => s.updateAsset);
  const removeAssetLocal = useStore((s) => s.removeAsset);
  const setWriteFailure = useCloudUiStore((s) => s.setWriteFailure);
  const clearWriteError = useCloudUiStore((s) => s.clearWriteError);
  const setMigrated = useCloudUiStore((s) => s.setMigrated);
  const setMigrating = useCloudUiStore((s) => s.setMigrating);
  const setMigrateError = useCloudUiStore((s) => s.setMigrateError);

  const token = useCallback(async () => getToken(), [getToken]);

  const refreshFromCloud = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const remote = await fetchRemoteAssets(token);
      useStore.setState({ assets: remote });
      clearWriteError();
    } catch {
      // Keep local cache; banner only for explicit writes.
    }
  }, [isSignedIn, token, clearWriteError]);

  const loadMigrated = useCallback(async () => {
    if (!userId) {
      setMigrated(null);
      return;
    }
    const v = await getMigratedFlag(userId);
    setMigrated(v);
  }, [userId, setMigrated]);

  const runMigrateInternal = useCallback(async () => {
    if (!userId) throw new Error('no user');
    const s = useStore.getState();
    await postMigrate(token, {
      assets: s.assets,
      wishes: s.wishes,
      plans: s.plans,
      customCategories: s.customCategories,
      tagLibrary: s.tagLibrary,
    });
    await setMigratedFlag(userId, true);
    setMigrated(true);
    await refreshFromCloud();
  }, [userId, token, setMigrated, refreshFromCloud]);

  const addAsset = useCallback(
    async (asset: Omit<Asset, 'id'> & { id?: string }) => {
      const id = asset.id ?? uid('a');
      const full = { ...asset, id } as Asset;
      addAssetLocal(full);
      if (!isSignedIn) return id;
      try {
        const saved = await createRemoteAsset(token, full);
        if (saved) updateAssetLocal(id, saved);
        clearWriteError();
      } catch {
        setWriteFailure({ kind: 'create', asset: full as unknown as Record<string, unknown> });
      }
      return id;
    },
    [addAssetLocal, updateAssetLocal, isSignedIn, token, setWriteFailure, clearWriteError],
  );

  const updateAsset = useCallback(
    async (id: string, patch: Partial<Asset>) => {
      updateAssetLocal(id, patch);
      if (!isSignedIn) return;
      try {
        const saved = await patchRemoteAsset(token, id, patch);
        if (saved) updateAssetLocal(id, saved);
        clearWriteError();
      } catch {
        setWriteFailure({ kind: 'update', id, patch: patch as Record<string, unknown> });
      }
    },
    [updateAssetLocal, isSignedIn, token, setWriteFailure, clearWriteError],
  );

  const removeAsset = useCallback(
    async (id: string) => {
      removeAssetLocal(id);
      if (!isSignedIn) return;
      try {
        await deleteRemoteAsset(token, id);
        clearWriteError();
      } catch {
        setWriteFailure({ kind: 'delete', id });
      }
    },
    [removeAssetLocal, isSignedIn, token, setWriteFailure, clearWriteError],
  );

  const retryPending = useCallback(async () => {
    const pending = useCloudUiStore.getState().pending;
    if (!pending || !isSignedIn) return;
    try {
      if (pending.kind === 'create') {
        await createRemoteAsset(token, pending.asset as unknown as Asset);
      } else if (pending.kind === 'update') {
        await patchRemoteAsset(token, pending.id, pending.patch as Partial<Asset>);
      } else if (pending.kind === 'delete') {
        await deleteRemoteAsset(token, pending.id);
      } else if (pending.kind === 'migrate') {
        await runMigrateInternal();
      }
      clearWriteError();
    } catch {
      setWriteFailure(pending);
    }
  }, [isSignedIn, token, clearWriteError, setWriteFailure, runMigrateInternal]);

  const migrateToCloud = useCallback(async () => {
    if (!isSignedIn || !userId) return false;
    setMigrating(true);
    setMigrateError(null);
    try {
      await runMigrateInternal();
      clearWriteError();
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '迁移失败';
      setMigrateError(msg);
      setWriteFailure({ kind: 'migrate' }, '未能保存到云端，本机仍保留草稿');
      return false;
    } finally {
      setMigrating(false);
    }
  }, [
    isSignedIn,
    userId,
    runMigrateInternal,
    setMigrating,
    setMigrateError,
    clearWriteError,
    setWriteFailure,
  ]);

  return {
    isSignedIn: !!isSignedIn,
    addAsset,
    updateAsset,
    removeAsset,
    refreshFromCloud,
    loadMigrated,
    migrateToCloud,
    retryPending,
  };
}
