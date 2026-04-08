/**
 * API client - Replace baseUrl with your API endpoint
 * Ready for fetch/axios integration
 */
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:5001/api';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get token from localStorage in client-side
  const token = typeof window !== 'undefined' ? localStorage.getItem('sasms_token') : null;

  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options?.body instanceof FormData) ? {} : { 'Content-Type': 'application/json' }),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}
