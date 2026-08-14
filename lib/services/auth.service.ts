import { api, tokenStore, unwrap } from '@/lib/api';

export interface LoginPayload { email: string; password: string }

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  companyName: string;
  propertyName: string;
  propertyType?: string;
  starRating: number;
  totalRooms: number;
  address: string;
  city: string;
  state?: string;
  country?: string;
  currency?: string;
  propertyPhone?: string;
}

export interface AuthUser {
  id: string; email: string; firstName: string; lastName: string;
  role: string; tenantId: string; propertyId: string;
}

export interface AuthTokens {
  accessToken: string; refreshToken: string; user: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const res = await api.post('/auth/login', payload);
    const tokens = unwrap<AuthTokens>(res);
    tokenStore.set(tokens.accessToken);
    tokenStore.setRefresh(tokens.refreshToken);
    return tokens;
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const res = await api.post('/auth/register', payload);
    const tokens = unwrap<AuthTokens>(res);
    tokenStore.set(tokens.accessToken);
    tokenStore.setRefresh(tokens.refreshToken);
    return tokens;
  },

  async me(): Promise<AuthUser> {
    const res = await api.get('/auth/me');
    return unwrap<AuthUser>(res);
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout'); } finally { tokenStore.clear(); }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/auth/change-password', { currentPassword, newPassword });
  },
};
