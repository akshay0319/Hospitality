import { ChannelsService } from './channels.service';
export declare class ChannelsController {
    private readonly channels;
    constructor(channels: ChannelsService);
    list(propertyId: string): Promise<{
        channels: {
            id: string;
            code: string;
            name: string;
            isConnected: boolean;
            commissionPct: number;
            autoSync: boolean;
            lastSyncAt: Date | null;
            ourRate: number;
            channelRate: number;
            parityOk: boolean;
        }[];
        summary: {
            total: number;
            connected: number;
            otaReservations: number;
            avgCommission: number;
        };
    }>;
    syncLog(propertyId: string): Promise<{
        id: string;
        direction: import(".prisma/client").$Enums.SyncDirection;
        summary: string;
        count: number;
        createdAt: Date;
        channel: string;
    }[]>;
    connect(id: string, propertyId: string): Promise<{
        commissionPct: number;
        name: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        code: string;
        isConnected: boolean;
        autoSync: boolean;
        lastSyncAt: Date | null;
    }>;
    disconnect(id: string, propertyId: string): Promise<{
        commissionPct: number;
        name: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        code: string;
        isConnected: boolean;
        autoSync: boolean;
        lastSyncAt: Date | null;
    }>;
    push(id: string, propertyId: string): Promise<{
        channel: string;
        roomTypes: number;
        days: number;
        count: number;
    }>;
    pull(id: string, propertyId: string): Promise<{
        channel: string;
        pulled: number;
        reservations: {
            confirmation: string;
            guest: string;
            checkIn: string;
            checkOut: string;
            total: number;
        }[];
    }>;
}
