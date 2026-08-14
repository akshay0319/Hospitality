import { api, unwrap } from '@/lib/api';

export const analyticsService = {
  async getRevenueTrend(days = 30) {
    const res = await api.get('/analytics/revenue-trend', { params: { days } });
    return unwrap(res);
  },

  async getChannelBreakdown(days = 30) {
    const res = await api.get('/analytics/channel-breakdown', { params: { days } });
    return unwrap(res);
  },

  async getOccupancyHeatmap(year?: number) {
    const res = await api.get('/analytics/occupancy-heatmap', { params: year ? { year } : undefined });
    return unwrap(res);
  },

  async getGuestStats() {
    const res = await api.get('/analytics/guest-stats');
    return unwrap(res);
  },
};
