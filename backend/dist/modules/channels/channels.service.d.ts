import { PrismaService } from '@/prisma/prisma.service';
import { ReservationsService } from '@/modules/reservations/reservations.service';
export declare class ChannelsService {
    private readonly prisma;
    private readonly reservations;
    constructor(prisma: PrismaService, reservations: ReservationsService);
    private find;
    private requireConnected;
    private log;
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
    setConnected(propertyId: string, id: string, isConnected: boolean): Promise<{
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
    push(propertyId: string, id: string): Promise<{
        channel: string;
        roomTypes: number;
        days: number;
        count: number;
    }>;
    pull(propertyId: string, id: string): Promise<{
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
    syncLog(propertyId: string): Promise<{
        id: string;
        direction: import(".prisma/client").$Enums.SyncDirection;
        summary: string;
        count: number;
        createdAt: Date;
        channel: string;
    }[]>;
}
