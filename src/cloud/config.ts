/** Public Expo env — never put secret keys here. */
export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

/** True only when a real Clerk key is present (placeholder is invalid). */
export function isClerkConfigured(): boolean {
  const k = CLERK_PUBLISHABLE_KEY;
  return k.startsWith('pk_test_') || k.startsWith('pk_live_');
}

/** Vercel production API — override with EXPO_PUBLIC_API_URL if needed. */
const DEFAULT_API_URL = 'https://hengwu-api-chanjtts-projects.vercel.app';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '');

export function assertCloudConfig() {
  if (!isClerkConfigured()) {
    console.warn('[cloud] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY missing/invalid — cloud auth disabled');
  }
  if (!API_URL) {
    console.warn('[cloud] EXPO_PUBLIC_API_URL is missing');
  }
}
