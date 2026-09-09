# hengwu cloud API（有数上云 · 第一刀）

独立 Next.js App Router 包，挂在 `apps/api`，方便单独部署到 Vercel。  
本刀只做**服务端**：Clerk 登录必选 + Neon/Vercel Postgres + 全量 migrate + assets CRUD。  
离线同步、日均/总览仍由端上计算，**不做** `/overview`。

## Env

在 Vercel Project → Settings → Environment Variables（或本地 `.env.local`）配置：

| 变量 | 必填 | 说明 |
|------|------|------|
| `CLERK_SECRET_KEY` | 是 | Clerk Dashboard → API Keys（`sk_...`） |
| `DATABASE_URL` | 是（生产） | Neon / Vercel Postgres 连接串 |
| `CLERK_JWT_ISSUER` | 否 | Clerk Frontend API URL，用于收紧 JWT issuer 校验 |

本地若未设 `CLERK_SECRET_KEY`，可用开发口令：`Authorization: Bearer dev:<userId>`。  
未设 `DATABASE_URL` 时走进程内 memory stub（route 形状不变，重启丢失）。

复制示例：

```bash
cp .env.example .env.local
```

## Schema

在 Neon SQL Editor（或 `psql "$DATABASE_URL"`）执行：

```bash
# 从本目录
psql "$DATABASE_URL" -f sql/schema.sql
```

表：`users`（id = Clerk userId）、`assets`、`wishes`、`plans`、`categories`、`tags`。  
均含 `user_id`、`updated_at`。行主键为 `(user_id, id)`。

## 本地开发

```bash
cd apps/api
npm install
npm run dev   # http://localhost:3001
```

Root 的 Expo `package-lock.json` **不会**被改动；本包自有 `package-lock`（首次 `npm install` 生成）。

## Vercel 部署

1. Import 本仓库到 Vercel。
2. **Root Directory** 设为 `apps/api`。
3. Framework Preset：Next.js（自动）。
4. 填入 `CLERK_SECRET_KEY`、`DATABASE_URL`。
5. Deploy。在 Neon 跑一次 `sql/schema.sql`。
6. （可选）把该 Vercel 项目与 Neon 集成，自动注入 `DATABASE_URL`。

生产 URL 形如：`https://<project>.vercel.app`。

## 从 Expo 调用

客户端用 Clerk `getToken()` 拿 JWT，带在 `Authorization`：

```ts
import { useAuth } from '@clerk/clerk-expo';

const API_BASE = process.env.EXPO_PUBLIC_API_URL; // e.g. https://xxx.vercel.app

async function api(path: string, init: RequestInit = {}) {
  const { getToken } = useAuth(); // 或从 auth 上下文取出
  const token = await getToken();
  if (!token) throw new Error('not signed in');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 全量上云（zustand persist 名 hengwu-db 的 partialize 形状）
await api('/api/migrate', {
  method: 'POST',
  body: JSON.stringify({
    assets,
    wishes,
    plans,
    customCategories,
    tagLibrary,
  }),
});

// assets CRUD
const { assets: remote } = await api('/api/assets');
await api('/api/assets', { method: 'POST', body: JSON.stringify(newAsset) });
await api(`/api/assets/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
await api(`/api/assets/${id}`, { method: 'DELETE' });
```

所有数据挂在已登录 Clerk `userId`（JWT `sub`）下；migrate 为**该用户全量替换**。

## Routes

| Method | Path | 说明 |
|--------|------|------|
| `POST` | `/api/migrate` | body = 本地 hengwu-db 形状；写入 assets+wishes+plans+categories+tags |
| `GET` | `/api/assets` | 当前用户资产列表 |
| `POST` | `/api/assets` | 创建/ upsert 单条资产 |
| `PATCH` | `/api/assets/[id]` | 部分更新 |
| `DELETE` | `/api/assets/[id]` | 删除 |

## 依赖

- `@clerk/backend` — Bearer JWT 校验  
- `@neondatabase/serverless` — Neon HTTP SQL  
- `next` 15 App Router  

端上离线、wishes/plans CRUD、增量 sync 留后续刀。
