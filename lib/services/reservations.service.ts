import { api, unwrap, unwrapWithMeta } from '@/lib/api';

export interface ReservationListParams {
  page?: number; limit?: number; search?: string;
  status?: string; checkIn?: string; checkOut?: string;
}

export interface CancellationPolicy {
  name: string; freeCancellationHours: number;
  penaltyType: 'NONE' | 'FIRST_NIGHT' | 'PERCENT' | 'FULL'; penaltyValue: number;
}

export const reservationsService = {
  async findAll(params?: ReservationListParams) {
    const res = await api.get('/reservations', { params });
    return unwrapWithMeta(res);
  },

  async findOne(id: string) {
    const res = await api.get(`/reservations/${id}`);
    return unwrap(res);
  },

  async checkAvailability(params: { checkIn: string; checkOut: string; roomTypeId?: string }) {
    const res = await api.get('/reservations/availability', { params });
    return unwrap(res);
  },

  async create(dto: Record<string, unknown>) {
    const res = await api.post('/reservations', dto);
    return unwrap(res);
  },

  async update(id: string, dto: Record<string, unknown>) {
    const res = await api.patch(`/reservations/${id}`, dto);
    return unwrap(res);
  },

  async checkIn(id: string, roomId: string) {
    const res = await api.patch(`/reservations/${id}/check-in`, { roomId });
    return unwrap(res);
  },

  async checkOut(id: string, dto?: Record<string, unknown>) {
    const res = await api.patch(`/reservations/${id}/check-out`, dto ?? {});
    return unwrap(res);
  },

  async cancel(id: string, reason?: string) {
    const res = await api.patch(`/reservations/${id}/cancel`, { reason });
    return unwrap(res);
  },

  async getTodaySummary() {
    const res = await api.get('/reservations/today');
    return unwrap(res);
  },

  async getCancellationPolicy(): Promise<CancellationPolicy> {
    const res = await api.get('/reservations/cancellation-policy');
    return unwrap(res);
  },

  async updateCancellationPolicy(dto: Partial<CancellationPolicy>): Promise<CancellationPolicy> {
    const res = await api.patch('/reservations/cancellation-policy', dto);
    return unwrap(res);
  },
};
