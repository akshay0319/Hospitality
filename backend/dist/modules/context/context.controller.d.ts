import { ContextService } from './context.service';
export declare class ContextController {
    private readonly service;
    constructor(service: ContextService);
    getSnapshot(propertyId: string): Promise<{
        generatedAt: string;
        date: string;
        property: {
            name: string | undefined;
            city: string | undefined;
            currency: string | undefined;
            starRating: number | undefined;
            totalRooms: number;
        };
        occupancy: {
            checkedIn: number;
            occupancyPct: number;
            availableRooms: number;
        };
        today: {
            arrivals: number;
            departures: number;
            revenue: number;
        };
        rooms: {
            [k: string]: number;
        };
        housekeeping: {
            pending: number;
            inProgress: number;
            inspecting: number;
            completed: number;
        };
        maintenance: {
            open: number;
            critical: number;
        };
        topGuests: {
            name: string;
            tier: import(".prisma/client").$Enums.LoyaltyTier;
            lifetimeValue: number;
            vip: boolean;
        }[];
        upcomingArrivals: {
            guest: string;
            roomType: string;
            checkIn: string;
        }[];
        alerts: {
            title: string;
            severity: import(".prisma/client").$Enums.AlertSeverity;
            module: string;
        }[];
    }>;
}
