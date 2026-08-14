import { api, unwrap, unwrapWithMeta } from '@/lib/api';

export type UserRole =
  | 'OWNER' | 'GENERAL_MANAGER' | 'REVENUE_MANAGER' | 'FRONT_DESK'
  | 'HOUSEKEEPING_SUPERVISOR' | 'HOUSEKEEPER' | 'MAINTENANCE' | 'FINANCE';

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  department?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  department?: string;
}

export const usersService = {
  async findAll(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get('/users', { params });
    return unwrapWithMeta(res);
  },
  async create(dto: CreateUserInput): Promise<StaffUser> {
    const res = await api.post('/users', dto);
    return unwrap<StaffUser>(res);
  },
  async update(id: string, dto: Partial<CreateUserInput> & { isActive?: boolean }): Promise<StaffUser> {
    const res = await api.patch(`/users/${id}`, dto);
    return unwrap<StaffUser>(res);
  },
  async setRole(id: string, role: UserRole): Promise<StaffUser> {
    return this.update(id, { role });
  },
  async deactivate(id: string): Promise<StaffUser> {
    const res = await api.delete(`/users/${id}`);
    return unwrap<StaffUser>(res);
  },
  async reactivate(id: string): Promise<StaffUser> {
    return this.update(id, { isActive: true });
  },
};
