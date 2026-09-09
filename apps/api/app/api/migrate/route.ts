import { NextRequest } from 'next/server';

import { jsonError, requireUserId } from '@/lib/auth';
import { runMigrate } from '@/lib/migrate';
import type { MigrateBody } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const body = (await req.json()) as MigrateBody;
    const result = await runMigrate(userId, body ?? {});
    return Response.json({ ok: true, userId, ...result });
  } catch (err) {
    return jsonError(err);
  }
}
