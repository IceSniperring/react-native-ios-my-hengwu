import type { Asset } from './types';
import { getMem, getSql, isMemoryMode } from './db';

function rowToAsset(row: Record<string, unknown>): Asset {
  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category ?? 'uncategorized'),
    status: (row.status as Asset['status']) ?? 'active',
    purchasePrice: Number(row.purchase_price ?? 0),
    purchaseDate: String(row.purchase_date ?? ''),
    targetDailyCost: Number(row.target_daily_cost ?? 0),
    expectedDays: Number(row.expected_days ?? 0),
    imageKey: row.image_key != null ? String(row.image_key) : undefined,
    imageUri: row.image_uri != null ? String(row.image_uri) : undefined,
    starred: Boolean(row.starred),
    soldPrice: row.sold_price != null ? Number(row.sold_price) : undefined,
    soldDate: row.sold_date != null ? String(row.sold_date) : undefined,
    retiredDate: row.retired_date != null ? String(row.retired_date) : undefined,
    note: row.note != null ? String(row.note) : undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    costMode: (row.cost_mode as Asset['costMode']) ?? undefined,
    targetMode: (row.target_mode as Asset['targetMode']) ?? undefined,
  };
}

function assetToMem(a: Asset) {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    status: a.status,
    purchase_price: a.purchasePrice,
    purchase_date: a.purchaseDate,
    target_daily_cost: a.targetDailyCost,
    expected_days: a.expectedDays,
    image_key: a.imageKey ?? null,
    image_uri: a.imageUri ?? null,
    starred: a.starred ?? false,
    sold_price: a.soldPrice ?? null,
    sold_date: a.soldDate ?? null,
    retired_date: a.retiredDate ?? null,
    note: a.note ?? null,
    tags: a.tags ?? [],
    cost_mode: a.costMode ?? null,
    target_mode: a.targetMode ?? null,
  };
}

export async function listAssets(userId: string): Promise<Asset[]> {
  const db = getSql();
  if (!db || isMemoryMode()) {
    const rows = getMem().assets.get(userId) ?? [];
    return rows.map(rowToAsset);
  }
  const rows = await db`
    SELECT * FROM assets WHERE user_id = ${userId} ORDER BY updated_at DESC
  `;
  return (rows as Record<string, unknown>[]).map(rowToAsset);
}

export async function createAsset(userId: string, asset: Asset): Promise<Asset> {
  const db = getSql();
  if (!db || isMemoryMode()) {
    const list = getMem().assets.get(userId) ?? [];
    const row = assetToMem(asset);
    getMem().assets.set(userId, [row, ...list.filter((r) => r.id !== asset.id)]);
    return asset;
  }
  await db`
    INSERT INTO assets (
      id, user_id, name, category, status,
      purchase_price, purchase_date, target_daily_cost, expected_days,
      image_key, image_uri, starred, sold_price, sold_date, retired_date,
      note, tags, cost_mode, target_mode, updated_at
    ) VALUES (
      ${asset.id}, ${userId}, ${asset.name}, ${asset.category}, ${asset.status},
      ${asset.purchasePrice}, ${asset.purchaseDate}, ${asset.targetDailyCost}, ${asset.expectedDays},
      ${asset.imageKey ?? null}, ${asset.imageUri ?? null}, ${asset.starred ?? false},
      ${asset.soldPrice ?? null}, ${asset.soldDate ?? null}, ${asset.retiredDate ?? null},
      ${asset.note ?? null}, CAST(${JSON.stringify(asset.tags ?? [])} AS jsonb),
      ${asset.costMode ?? null}, ${asset.targetMode ?? null}, NOW()
    )
    ON CONFLICT (user_id, id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      status = EXCLUDED.status,
      purchase_price = EXCLUDED.purchase_price,
      purchase_date = EXCLUDED.purchase_date,
      target_daily_cost = EXCLUDED.target_daily_cost,
      expected_days = EXCLUDED.expected_days,
      image_key = EXCLUDED.image_key,
      image_uri = EXCLUDED.image_uri,
      starred = EXCLUDED.starred,
      sold_price = EXCLUDED.sold_price,
      sold_date = EXCLUDED.sold_date,
      retired_date = EXCLUDED.retired_date,
      note = EXCLUDED.note,
      tags = EXCLUDED.tags,
      cost_mode = EXCLUDED.cost_mode,
      target_mode = EXCLUDED.target_mode,
      updated_at = NOW()
  `;
  return asset;
}

export async function patchAsset(
  userId: string,
  id: string,
  patch: Partial<Asset>,
): Promise<Asset | null> {
  const existing = (await listAssets(userId)).find((a) => a.id === id);
  if (!existing) return null;
  const next: Asset = { ...existing, ...patch, id };
  await createAsset(userId, next);
  return next;
}

export async function deleteAsset(userId: string, id: string): Promise<boolean> {
  const db = getSql();
  if (!db || isMemoryMode()) {
    const list = getMem().assets.get(userId) ?? [];
    const next = list.filter((r) => r.id !== id);
    if (next.length === list.length) return false;
    getMem().assets.set(userId, next);
    return true;
  }
  const rows = await db`
    DELETE FROM assets WHERE user_id = ${userId} AND id = ${id} RETURNING id
  `;
  return rows.length > 0;
}
