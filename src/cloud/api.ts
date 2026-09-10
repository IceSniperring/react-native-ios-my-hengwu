import { API_URL } from './config';

export class CloudApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(body || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export type TokenGetter = () => Promise<string | null>;

export async function cloudFetch<T = unknown>(
  path: string,
  getToken: TokenGetter,
  init: RequestInit = {},
): Promise<T> {
  if (!API_URL) {
    throw new CloudApiError(0, 'EXPO_PUBLIC_API_URL is not configured');
  }
  const token = await getToken();
  if (!token) {
    throw new CloudApiError(401, 'not signed in');
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new CloudApiError(res.status, text || res.statusText);
  }
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
