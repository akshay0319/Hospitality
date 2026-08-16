import { api, unwrap } from '@/lib/api';

export interface GroupSummary {
  id: string; name: string; contactName: string; contactEmail: string | null;
  checkIn: string; checkOut: string; status: string;
  rooms: number; activeRooms: number; totalValue: number;
}
export interface GroupMember {
  id: string; confirmationNumber: string; roomType?: string; room: string | null; status: string; total: number;
}
export interface GroupDetail {
  id: string; name: string; contactName: string; contactEmail: string | null; contactPhone: string | null;
  checkIn: string; checkOut: string; status: string; notes: string | null;
  reservations: GroupMember[];
}
export interface CreateGroupInput {
  name: string; contactName: string; contactEmail?: string; contactPhone?: string;
  checkIn: string; checkOut: string; notes?: string;
  blocks: { roomTypeId: string; quantity: number }[];
}

export const groupsService = {
  async list(): Promise<GroupSummary[]> {
    return unwrap<GroupSummary[]>(await api.get('/groups'));
  },
  async get(id: string): Promise<GroupDetail> {
    return unwrap<GroupDetail>(await api.get(`/groups/${id}`));
  },
  async create(dto: CreateGroupInput): Promise<{ group: GroupDetail; roomsCreated: number; roomsFailed: number }> {
    return unwrap(await api.post('/groups', dto));
  },
  async cancel(id: string): Promise<{ cancelled: number }> {
    return unwrap(await api.post(`/groups/${id}/cancel`, {}));
  },
};
