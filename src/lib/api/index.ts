/**
 * API module - ready for integration
 *
 * When backend is ready:
 * 1. Set NEXT_PUBLIC_API_URL in .env.local
 * 2. Replace mock data in *Api.ts files with apiClient() calls
 * 3. Add auth headers from AuthContext token
 */

export { apiClient } from './client';
export * from './studentApi';
export * from './staffApi';
export * from './superadminApi';

