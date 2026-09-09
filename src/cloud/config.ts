export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export function assertCloudConfig() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn('[cloud] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY missing');
  }
  if (!API_URL) {
    console.warn('[cloud] EXPO_PUBLIC_API_URL missing');
  }
}
