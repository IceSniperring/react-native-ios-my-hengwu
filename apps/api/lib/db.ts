import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<false, false> | null = null;
let memoryFallback = false;

/** In-memory fallback when DATABASE_URL is missing (local / CI smoke). */
type MemStore = {
  users: Set<string>;
  assets: Map<string, Record<string, unknown>[]>;
  wishes: Map<string, Record<string, unknown>[]>;
  plans: Map<string, Record<string, unknown>[]>;
  categories: Map<string, Record<string, unknown>[]>;
  tags: Map<string, Record<string, unknown>[]>;
};

const mem: MemStore = {
  users: new Set(),
  assets: new Map(),
  wishes: new Map(),
  plans: new Map(),
  categories: new Map(),
  tags: new Map(),
};

export function isMemoryMode() {
  return memoryFallback || !process.env.DATABASE_URL;
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    memoryFallback = true;
    return null;
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export function getMem() {
  return mem;
}

export async function ensureUser(userId: string) {
  const db = getSql();
  if (!db) {
    mem.users.add(userId);
    return;
  }
  await db`
    INSERT INTO users (id, updated_at)
    VALUES (${userId}, NOW())
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
  `;
}
