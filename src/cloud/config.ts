/** Public Expo env — never put secret keys here. */
export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

/** Vercel production API — override with EXPO_PUBLIC_API_URL if needed. */
const DEFAULT_API_URL = 'https://hengwu-api-chanjtts-projects.vercel.app';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '');

export function assertCloudConfig() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn('[cloud] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
  }
  if (!API_URL) {
    console.warn('[cloud] EXPO_PUBLIC_API_URL is missing');
  }
}
