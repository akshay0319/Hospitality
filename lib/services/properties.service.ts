import { api, unwrap } from '@/lib/api';

export interface Property {
  id: string; name: string; brand?: string | null; starRating: number;
  address: string; city: string; state?: string | null; country?: string | null;
  phone?: string | null; email?: string | null; gstNumber?: string | null;
  currency: string; timezone: string; checkInTime: string; checkOutTime: string;
  totalRooms: number;
}

export const propertiesService = {
  async get(id: string): Promise<Property> {
    return unwrap<Property>(await api.get(`/properties/${id}`));
  },
  async update(id: string, dto: Record<string, unknown>): Promise<Property> {
    return unwrap<Property>(await api.patch(`/properties/${id}`, dto));
  },
};
