import { api, unwrap, unwrapWithMeta } from '@/lib/api';

export interface ScoredGuest {
  id: string; name: string; email: string | null; tier: string; isVip: boolean;
  totalStays: number; lifetimeValue: number; lastStayAt: string | null;
  daysSince: number | null; churnRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEW'; churnReason: string; ltvProjection: number;
}
export interface CrmInsights {
  summary: { total: number; high: number; medium: number; low: number; new: number; currentLtv: number; projectedLtv: number };
  atRisk: ScoredGuest[];
  topValue: ScoredGuest[];
}
export interface CampaignCopy { subject: string; body: string; audienceCount: number; live: boolean }
export interface Campaign {
  id: string; name: string; segment: string; channel: string; subject: string | null;
  body: string; audienceCount: number; status: string; createdAt: string;
}

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

  async insights(): Promise<CrmInsights> {
    return unwrap<CrmInsights>(await api.get('/guests/insights'));
  },

  async generateCampaign(segment: string, goal?: string): Promise<CampaignCopy> {
    return unwrap<CampaignCopy>(await api.post('/guests/campaigns/generate', { segment, goal }));
  },

  async createCampaign(dto: { name: string; segment: string; subject?: string; body: string; audienceCount?: number }): Promise<Campaign> {
    return unwrap<Campaign>(await api.post('/guests/campaigns', dto));
  },

  async listCampaigns(): Promise<Campaign[]> {
    return unwrap<Campaign[]>(await api.get('/guests/campaigns'));
  },
};
