import type { CatalogItem, MigrateBody, SavingsPlan, WishItem } from './types';
import { createAsset } from './assets-repo';
import { ensureUser, getMem, getSql, isMemoryMode } from './db';

function tagId(label: string) {
  // Stable-ish id from label (ASCII-safe for SQL primary key).
  const slug = encodeURIComponent(label).replace(/%/g, '').slice(0, 40);
  return `tag-${slug || 'x'}`;
}

export async function runMigrate(userId: string, body: MigrateBody) {
  await ensureUser(userId);

  const assets = body.assets ?? [];
  const wishes = body.wishes ?? [];
  const plans = body.plans ?? [];
  const categories = body.customCategories ?? [];
  const tagLibrary = body.tagLibrary ?? [];

  const db = getSql();

  if (!db || isMemoryMode()) {
    const mem = getMem();
    mem.assets.set(
      userId,
      assets.map((a) => ({
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
      })),
    );
    mem.wishes.set(userId, wishes as unknown as Record<string, unknown>[]);
    mem.plans.set(userId, plans as unknown as Record<string, unknown>[]);
    mem.categories.set(userId, categories as unknown as Record<string, unknown>[]);
    mem.tags.set(
      userId,
      tagLibrary.map((label) => ({ id: tagId(label), label })),
    );
    return {
      mode: 'memory' as const,
      counts: {
        assets: assets.length,
        wishes: wishes.length,
        plans: plans.length,
        categories: categories.length,
        tags: tagLibrary.length,
      },
    };
  }

  // Full replace for this user (first-cut: 全量 migrate).
  await db`DELETE FROM assets WHERE user_id = ${userId}`;
  await db`DELETE FROM wishes WHERE user_id = ${userId}`;
  await db`DELETE FROM plans WHERE user_id = ${userId}`;
  await db`DELETE FROM categories WHERE user_id = ${userId}`;
  await db`DELETE FROM tags WHERE user_id = ${userId}`;

  for (const a of assets) {
    await createAsset(userId, a);
  }

  for (const w of wishes) {
    await insertWish(userId, w);
  }
  for (const p of plans) {
    await insertPlan(userId, p);
  }
  for (const c of categories) {
    await insertCategory(userId, c);
  }
  for (const label of tagLibrary) {
    await insertTag(userId, label);
  }

  return {
    mode: 'neon' as const,
    counts: {
      assets: assets.length,
      wishes: wishes.length,
      plans: plans.length,
      categories: categories.length,
      tags: tagLibrary.length,
    },
  };
}

async function insertWish(userId: string, w: WishItem) {
  const db = getSql()!;
  await db`
    INSERT INTO wishes (
      id, user_id, name, target_price, saved, category,
      image_key, image_uri, note, tags, updated_at
    ) VALUES (
      ${w.id}, ${userId}, ${w.name}, ${w.targetPrice}, ${w.saved}, ${w.category},
      ${w.imageKey ?? null}, ${w.imageUri ?? null}, ${w.note ?? null},
      CAST(${JSON.stringify(w.tags ?? [])} AS jsonb), NOW()
    )
  `;
}

async function insertPlan(userId: string, p: SavingsPlan) {
  const db = getSql()!;
  await db`
    INSERT INTO plans (
      id, user_id, name, target_amount, current_amount, deadline, updated_at
    ) VALUES (
      ${p.id}, ${userId}, ${p.name}, ${p.targetAmount}, ${p.currentAmount},
      ${p.deadline ?? null}, NOW()
    )
  `;
}

async function insertCategory(userId: string, c: CatalogItem) {
  const db = getSql()!;
  await db`
    INSERT INTO categories (id, user_id, label, updated_at)
    VALUES (${c.id}, ${userId}, ${c.label}, NOW())
  `;
}

async function insertTag(userId: string, label: string) {
  const db = getSql()!;
  const id = tagId(label);
  await db`
    INSERT INTO tags (id, user_id, label, updated_at)
    VALUES (${id}, ${userId}, ${label}, NOW())
    ON CONFLICT (user_id, label) DO UPDATE SET updated_at = NOW()
  `;
}
