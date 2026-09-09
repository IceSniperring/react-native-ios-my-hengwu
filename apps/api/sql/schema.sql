-- 有数上云 · first-cut schema (Neon / Vercel Postgres)
-- users.id = Clerk userId (string)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'uncategorized',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'retired', 'sold')),
  purchase_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  purchase_date TEXT NOT NULL DEFAULT '',
  target_daily_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  expected_days INTEGER NOT NULL DEFAULT 0,
  image_key TEXT,
  image_uri TEXT,
  starred BOOLEAN NOT NULL DEFAULT FALSE,
  sold_price DOUBLE PRECISION,
  sold_date TEXT,
  retired_date TEXT,
  note TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  cost_mode TEXT CHECK (cost_mode IS NULL OR cost_mode IN ('day', 'count', 'custom')),
  target_mode TEXT CHECK (target_mode IS NULL OR target_mode IN ('none', 'price', 'date', 'custom')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS wishes (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  saved DOUBLE PRECISION NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'uncategorized',
  image_key TEXT,
  image_uri TEXT,
  note TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  current_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  deadline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id),
  UNIQUE (user_id, label)
);

CREATE INDEX IF NOT EXISTS idx_assets_user_updated ON assets (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_user_updated ON wishes (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_user_updated ON plans (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories (user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user ON tags (user_id);
