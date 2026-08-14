import { api, unwrap, unwrapWithMeta } from '@/lib/api';

export const roomsService = {
  async findAll(params?: { status?: string; roomTypeId?: string }) {
    const res = await api.get('/rooms', { params });
    return unwrapWithMeta(res);
  },

  async findOne(id: string) {
    const res = await api.get(`/rooms/${id}`);
    return unwrap(res);
  },

  async create(dto: Record<string, unknown>) {
    const res = await api.post('/rooms', dto);
    return unwrap(res);
  },

  async updateStatus(id: string, status: string) {
    const res = await api.patch(`/rooms/${id}/status`, { status });
    return unwrap(res);
  },

  async getCalendar(startDate: string, endDate: string) {
    const res = await api.get('/rooms/calendar', { params: { startDate, endDate } });
    return unwrap(res);
  },

  async block(id: string, reason: string, until?: string) {
    const res = await api.patch(`/rooms/${id}/block`, { reason, until });
    return unwrap(res);
  },

  async unblock(id: string) {
    const res = await api.patch(`/rooms/${id}/unblock`, {});
    return unwrap(res);
  },
};
