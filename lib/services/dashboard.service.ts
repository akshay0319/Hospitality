import { api, unwrap } from '@/lib/api';

export interface KpiValue {
  value: number;
  unit?: string;
  currency?: string;
  trend?: number | null;
  isPositive?: boolean;
}

export interface DashboardKPIs {
  occupancy: KpiValue;
  availableRooms: KpiValue;
  arrivalsToday: KpiValue;
  departuresToday: KpiValue;
  revenueToday: KpiValue;
  roomStatus: Record<string, number>;
  totalRooms: number;
  inHouse: number;
}

export const dashboardService = {
  async getKPIs(): Promise<DashboardKPIs> {
    const res = await api.get('/dashboard/kpis');
    return unwrap<DashboardKPIs>(res);
  },
};
