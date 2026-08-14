import { PrismaService } from '@/prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getKPIs(propertyId: string): Promise<{
        occupancy: {
            value: number;
            unit: string;
            trend: number;
            isPositive: boolean;
        };
        availableRooms: {
            value: number;
            trend: null;
            isPositive: boolean;
        };
        arrivalsToday: {
            value: number;
            trend: null;
            isPositive: boolean;
        };
        departuresToday: {
            value: number;
            trend: null;
            isPositive: boolean;
        };
        revenueToday: {
            value: number;
            currency: string;
            trend: number;
            isPositive: boolean;
        };
        roomStatus: {
            [k: string]: number | {
                id?: number;
            };
        };
        totalRooms: number;
        inHouse: number;
    }>;
}
