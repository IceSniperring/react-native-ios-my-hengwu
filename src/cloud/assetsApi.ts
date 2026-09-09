import type { Asset } from '../types';
import { cloudFetch, type TokenGetter } from './api';

export async function fetchRemoteAssets(getToken: TokenGetter): Promise<Asset[]> {
  const data = await cloudFetch<{ assets: Asset[] }>('/api/assets', getToken);
  return data?.assets ?? [];
}

export async function createRemoteAsset(
  getToken: TokenGetter,
  asset: Asset,
): Promise<Asset> {
  const data = await cloudFetch<{ asset: Asset }>('/api/assets', getToken, {
    method: 'POST',
    body: JSON.stringify(asset),
  });
  return data.asset;
}

export async function patchRemoteAsset(
  getToken: TokenGetter,
  id: string,
  patch: Partial<Asset>,
): Promise<Asset> {
  const data = await cloudFetch<{ asset: Asset }>(`/api/assets/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data.asset;
}

export async function deleteRemoteAsset(getToken: TokenGetter, id: string): Promise<void> {
  await cloudFetch(`/api/assets/${id}`, getToken, { method: 'DELETE' });
}

export async function postMigrate(
  getToken: TokenGetter,
  body: {
    assets: unknown[];
    wishes: unknown[];
    plans: unknown[];
    customCategories: unknown[];
    tagLibrary: string[];
  },
) {
  return cloudFetch<{ ok: boolean }>('/api/migrate', getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
