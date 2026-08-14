import { PrismaService } from '@/prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRevenueTrend(propertyId: string, days?: number): Promise<{
        date: string;
        revenue: number;
        occupancy: number;
        adr: number;
        revpar: number;
        roomsSold: number;
    }[]>;
    getChannelBreakdown(propertyId: string, days?: number): Promise<{
        channel: string;
        bookings: number;
        revenue: number;
    }[]>;
    getOccupancyHeatmap(propertyId: string, year?: number): Promise<{
        date: string;
        count: number;
        occupancy: number;
    }[]>;
    getGuestStats(propertyId: string): Promise<{
        total: number;
        vip: number;
        returning: number;
        newGuests: number;
        loyaltyBreakdown: {
            tier: string;
            count: number;
        }[];
    }>;
}
