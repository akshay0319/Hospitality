import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getRevenueTrend(propertyId: string, days?: string): Promise<{
        date: string;
        revenue: number;
        occupancy: number;
        adr: number;
        revpar: number;
        roomsSold: number;
    }[]>;
    getChannelBreakdown(propertyId: string, days?: string): Promise<{
        channel: string;
        bookings: number;
        revenue: number;
    }[]>;
    getOccupancyHeatmap(propertyId: string, year?: string): Promise<{
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
