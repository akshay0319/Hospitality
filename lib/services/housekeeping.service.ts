import { api, unwrap, unwrapWithMeta } from '@/lib/api';

export const housekeepingService = {
  async findAll(params?: { date?: string; status?: string; assignedTo?: string }) {
    const res = await api.get('/housekeeping', { params });
    return unwrapWithMeta(res);
  },

  async create(dto: Record<string, unknown>) {
    const res = await api.post('/housekeeping', dto);
    return unwrap(res);
  },

  async updateStatus(id: string, status: string) {
    const res = await api.patch(`/housekeeping/${id}/status`, { status });
    return unwrap(res);
  },

  async assign(id: string, assignedToId: string) {
    const res = await api.patch(`/housekeeping/${id}/assign`, { assignedToId });
    return unwrap(res);
  },

  async getDashboard() {
    const res = await api.get('/housekeeping/dashboard');
    return unwrap(res);
  },

  async runAIOptimizer() {
    const res = await api.get('/housekeeping/ai-optimize');
    return unwrap(res);
  },

  async acceptAIPlan(): Promise<{ assigned: number; alreadyAssigned: number; perStaff: { name: string; minutes: number }[] }> {
    return unwrap(await api.post('/housekeeping/accept-ai-plan', {}));
  },
};
