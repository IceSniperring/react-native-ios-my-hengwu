import { verifyToken } from '@clerk/backend';
import { NextRequest } from 'next/server';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Require Authorization: Bearer <Clerk JWT>.
 * Returns Clerk userId (sub).
 */
export async function requireUserId(req: NextRequest): Promise<string> {
  const header = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization Bearer token');
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new AuthError('Empty Bearer token');
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    // Dev escape hatch: accept `Bearer dev:<userId>` when no Clerk key configured.
    if (token.startsWith('dev:')) {
      const uid = token.slice(4).trim();
      if (!uid) throw new AuthError('Invalid dev token');
      return uid;
    }
    throw new AuthError('CLERK_SECRET_KEY not configured', 500);
  }

  try {
    const payload = await verifyToken(token, {
      secretKey,
      ...(process.env.CLERK_JWT_ISSUER
        ? { issuer: process.env.CLERK_JWT_ISSUER }
        : {}),
    });
    const sub = payload.sub;
    if (!sub) throw new AuthError('JWT missing sub');
    return sub;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError('Invalid or expired token');
  }
}

export function jsonError(err: unknown) {
  if (err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
