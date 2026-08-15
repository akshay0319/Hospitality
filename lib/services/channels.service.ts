import { api, unwrap } from '@/lib/api';

export interface Channel {
  id: string; code: string; name: string; isConnected: boolean;
  commissionPct: number; autoSync: boolean; lastSyncAt: string | null;
  ourRate: number; channelRate: number; parityOk: boolean;
}
export interface ChannelList {
  channels: Channel[];
  summary: { total: number; connected: number; otaReservations: number; avgCommission: number };
}
export interface SyncLogEntry {
  id: string; direction: 'PUSH' | 'PULL'; summary: string; count: number; createdAt: string; channel: string;
}
export interface PullResult {
  channel: string; pulled: number;
  reservations: { confirmation: string; guest: string; checkIn: string; checkOut: string; total: number }[];
}
export interface PushResult { channel: string; roomTypes: number; days: number; count: number }

export const channelsService = {
  async list(): Promise<ChannelList> {
    return unwrap<ChannelList>(await api.get('/channels'));
  },
  async syncLog(): Promise<SyncLogEntry[]> {
    return unwrap<SyncLogEntry[]>(await api.get('/channels/sync-log'));
  },
  async connect(id: string): Promise<Channel> {
    return unwrap<Channel>(await api.post(`/channels/${id}/connect`, {}));
  },
  async disconnect(id: string): Promise<Channel> {
    return unwrap<Channel>(await api.post(`/channels/${id}/disconnect`, {}));
  },
  async push(id: string): Promise<PushResult> {
    return unwrap<PushResult>(await api.post(`/channels/${id}/push`, {}));
  },
  async pull(id: string): Promise<PullResult> {
    return unwrap<PullResult>(await api.post(`/channels/${id}/pull`, {}));
  },
};
