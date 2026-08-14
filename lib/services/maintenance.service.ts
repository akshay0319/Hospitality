import { api, unwrap } from '@/lib/api';

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED';
  category?: string | null;
  estimatedCost?: string | number | null;
  actualCost?: string | number | null;
  dueDate?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  room?: { number: string; floor: number } | null;
  assignedTo?: { firstName: string; lastName: string } | null;
}

export interface MaintenanceDashboard {
  open: number; inProgress: number; onHold: number; resolved: number; critical: number;
  byCategory: { category: string; count: number }[];
}

export const maintenanceService = {
  async findAll(params?: { status?: string; priority?: string }): Promise<MaintenanceTicket[]> {
    const res = await api.get('/maintenance', { params });
    return unwrap<MaintenanceTicket[]>(res);
  },
  async getDashboard(): Promise<MaintenanceDashboard> {
    const res = await api.get('/maintenance/dashboard');
    return unwrap<MaintenanceDashboard>(res);
  },
  async create(dto: Record<string, unknown>): Promise<MaintenanceTicket> {
    const res = await api.post('/maintenance', dto);
    return unwrap<MaintenanceTicket>(res);
  },
  async updateStatus(id: string, status: string, actualCost?: number): Promise<MaintenanceTicket> {
    const res = await api.patch(`/maintenance/${id}/status`, { status, ...(actualCost !== undefined && { actualCost }) });
    return unwrap<MaintenanceTicket>(res);
  },
  async assign(id: string, assignedToId: string): Promise<MaintenanceTicket> {
    const res = await api.patch(`/maintenance/${id}/assign`, { assignedToId });
    return unwrap<MaintenanceTicket>(res);
  },
};
