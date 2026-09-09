import { NextRequest } from 'next/server';

import { createAsset, listAssets } from '@/lib/assets-repo';
import { jsonError, requireUserId } from '@/lib/auth';
import { ensureUser } from '@/lib/db';
import type { Asset } from '@/lib/types';

export const runtime = 'nodejs';

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    await ensureUser(userId);
    const assets = await listAssets(userId);
    return Response.json({ assets });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    await ensureUser(userId);
    const body = (await req.json()) as Partial<Asset> & { name?: string };
    if (!body?.name || typeof body.name !== 'string') {
      return Response.json({ error: 'name is required' }, { status: 400 });
    }
    const asset: Asset = {
      id: body.id ?? uid('a'),
      name: body.name,
      category: body.category ?? 'uncategorized',
      status: body.status ?? 'active',
      purchasePrice: Number(body.purchasePrice ?? 0),
      purchaseDate: body.purchaseDate ?? new Date().toISOString().slice(0, 10),
      targetDailyCost: Number(body.targetDailyCost ?? 0),
      expectedDays: Number(body.expectedDays ?? 0),
      imageKey: body.imageKey,
      imageUri: body.imageUri,
      starred: body.starred,
      soldPrice: body.soldPrice,
      soldDate: body.soldDate,
      retiredDate: body.retiredDate,
      note: body.note,
      tags: body.tags ?? [],
      costMode: body.costMode,
      targetMode: body.targetMode,
    };
    const saved = await createAsset(userId, asset);
    return Response.json({ asset: saved }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
