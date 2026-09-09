/** Public Expo env — never put secret keys here. */
export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL?.trim() ?? '').replace(/\/$/, '');

export function assertCloudConfig() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn('[cloud] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
  }
  if (!API_URL) {
    console.warn('[cloud] EXPO_PUBLIC_API_URL is missing');
  }
}
