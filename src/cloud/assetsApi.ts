import type { Asset } from '../types';
import { cloudFetch, type TokenGetter } from './api';

export type CloudAsset = Asset & {
  updatedAt?: string;
};

export async function listAssets(getToken: TokenGetter) {
  const res = await cloudFetch<{ assets: CloudAsset[] }>('/api/assets', getToken);
  return res.assets ?? [];
}

export async function createAsset(
  getToken: TokenGetter,
  body: Omit<Asset, 'id'> & { id?: string },
) {
  return cloudFetch<CloudAsset>('/api/assets', getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function patchAsset(
  getToken: TokenGetter,
  id: string,
  patch: Partial<Asset>,
) {
  return cloudFetch<CloudAsset>(`/api/assets/${encodeURIComponent(id)}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteAsset(getToken: TokenGetter, id: string) {
  await cloudFetch(`/api/assets/${encodeURIComponent(id)}`, getToken, { method: 'DELETE' });
}
