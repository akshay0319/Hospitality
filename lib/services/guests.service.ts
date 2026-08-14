import { api, unwrap, unwrapWithMeta } from '@/lib/api';

export const guestsService = {
  async findAll(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get('/guests', { params });
    return unwrapWithMeta(res);
  },

  async findOne(id: string) {
    const res = await api.get(`/guests/${id}`);
    return unwrap(res);
  },

  async segments(): Promise<{ total: number; segments: { key: string; label: string; count: number; description: string }[] }> {
    const res = await api.get('/guests/segments');
    return unwrap(res);
  },

  async create(dto: Record<string, unknown>) {
    const res = await api.post('/guests', dto);
    return unwrap(res);
  },

  async update(id: string, dto: Record<string, unknown>) {
    const res = await api.patch(`/guests/${id}`, dto);
    return unwrap(res);
  },

  async upsertPreferences(id: string, prefs: Record<string, unknown>) {
    const res = await api.put(`/guests/${id}/preferences`, prefs);
    return unwrap(res);
  },

  async addLoyaltyPoints(id: string, points: number, description: string) {
    const res = await api.post(`/guests/${id}/loyalty`, { points, description });
    return unwrap(res);
  },
};
