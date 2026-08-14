import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

// ── Token helpers ─────────────────────────────────────────────────────────────

export const tokenStore = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null),
  set: (t: string) => localStorage.setItem('access_token', t),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null),
  setRefresh: (t: string) => localStorage.setItem('refresh_token', t),
  clear: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); },
};

// ── Axios instance ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers!.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = data.data;

      tokenStore.set(accessToken);
      tokenStore.setRefresh(newRefreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      original.headers!.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStore.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Typed response unwrapper ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export function unwrapWithMeta<T>(response: { data: ApiResponse<T> }) {
  return { data: response.data.data, meta: response.data.meta };
}
