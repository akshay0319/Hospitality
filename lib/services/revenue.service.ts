import { api, unwrap } from '@/lib/api';

export interface RatePlan { id: string; name: string; code: string; type: string }
export interface RoomTypeLite { id: string; name: string; code: string; baseRate: string | number }
export interface RateItem {
  id: string; ratePlanId: string; roomTypeId: string; date: string;
  ratePerNight: string | number; isLocked: boolean;
}
export interface RateGrid { ratePlans: RatePlan[]; roomTypes: RoomTypeLite[]; rateItems: RateItem[] }

export const revenueService = {
  async findRatePlans(): Promise<RatePlan[]> {
    const res = await api.get('/revenue/rate-plans');
    return unwrap<RatePlan[]>(res);
  },

  async getRateGrid(startDate: string, endDate: string): Promise<RateGrid> {
    const res = await api.get('/revenue/rate-grid', { params: { startDate, endDate } });
    return unwrap<RateGrid>(res);
  },

  async setRate(ratePlanId: string, roomTypeId: string, date: string, ratePerNight: number, isLocked?: boolean) {
    const res = await api.patch(`/revenue/rate-plans/${ratePlanId}/rates`, { roomTypeId, date, ratePerNight, isLocked });
    return unwrap(res);
  },

  async setBulkRates(ratePlanId: string, roomTypeId: string, startDate: string, endDate: string, ratePerNight: number) {
    const res = await api.patch(`/revenue/rate-plans/${ratePlanId}/bulk-rates`, { roomTypeId, startDate, endDate, ratePerNight });
    return unwrap(res);
  },

  async getAIRecommendations() {
    const res = await api.get('/revenue/ai-recommendations');
    return unwrap(res);
  },

  async acceptRecommendation(ratePlanId: string, roomTypeId: string, date: string, rate: number) {
    const res = await api.post('/revenue/ai-recommendations/accept', { ratePlanId, roomTypeId, date, rate });
    return unwrap(res);
  },

  async runAutopilot(): Promise<{ applied: number; skippedLocked: number; skippedSmall: number; total: number; summary?: string }> {
    const res = await api.post('/revenue/autopilot', {});
    return unwrap(res);
  },

  async getAutopilotStatus(): Promise<AutopilotStatus> {
    return unwrap<AutopilotStatus>(await api.get('/revenue/autopilot/status'));
  },

  async toggleAutopilot(enabled: boolean): Promise<{ enabled: boolean }> {
    return unwrap<{ enabled: boolean }>(await api.post('/revenue/autopilot/toggle', { enabled }));
  },

  async getForecast(days = 14): Promise<{ day: string; occupancy: number; onBooks: number }[]> {
    const res = await api.get('/revenue/forecast', { params: { days } });
    return unwrap(res);
  },
};

export interface AutopilotRun { id: string; applied: number; skipped: number; trigger: string; summary: string; createdAt: string }
export interface AutopilotStatus { enabled: boolean; lastRunAt: string | null; runs: AutopilotRun[] }
