import { NextRequest } from 'next/server';

import { deleteAsset, patchAsset } from '@/lib/assets-repo';
import { jsonError, requireUserId } from '@/lib/auth';
import { ensureUser } from '@/lib/db';
import type { Asset } from '@/lib/types';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const userId = await requireUserId(req);
    await ensureUser(userId);
    const { id } = await ctx.params;
    const patch = (await req.json()) as Partial<Asset>;
    delete (patch as { id?: string }).id;
    const asset = await patchAsset(userId, id, patch);
    if (!asset) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }
    return Response.json({ asset });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const userId = await requireUserId(req);
    await ensureUser(userId);
    const { id } = await ctx.params;
    const ok = await deleteAsset(userId, id);
    if (!ok) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
