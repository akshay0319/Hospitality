import { PrismaService } from '@/prisma/prisma.service';
import { RatePlanType } from '@prisma/client';
export declare class CreateRatePlanDto {
    name: string;
    code: string;
    type: RatePlanType;
    description?: string;
    minStay?: number;
    maxStay?: number;
}
export declare class SetRateDto {
    roomTypeId: string;
    date: string;
    ratePerNight: number;
    isLocked?: boolean;
}
export declare class BulkRateDto {
    roomTypeId: string;
    startDate: string;
    endDate: string;
    ratePerNight: number;
}
export declare class RevenueService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findRatePlans(propertyId: string): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.RatePlanType;
        description: string | null;
        id: string;
        propertyId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        minStay: number | null;
        maxStay: number | null;
    }[]>;
    createRatePlan(propertyId: string, dto: CreateRatePlanDto): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.RatePlanType;
        description: string | null;
        id: string;
        propertyId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        minStay: number | null;
        maxStay: number | null;
    }>;
    getRateGrid(propertyId: string, startDate: string, endDate: string): Promise<{
        ratePlans: {
            name: string;
            type: import(".prisma/client").$Enums.RatePlanType;
            description: string | null;
            id: string;
            propertyId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            minStay: number | null;
            maxStay: number | null;
        }[];
        roomTypes: {
            amenities: string | null;
            imageUrls: string | null;
            name: string;
            description: string | null;
            id: string;
            propertyId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            code: string;
            maxOccupancy: number;
            baseRate: import("@prisma/client/runtime/library").Decimal;
            totalCount: number;
            maxAdults: number;
            maxChildren: number;
        }[];
        rateItems: ({
            roomType: {
                name: string;
                id: string;
                code: string;
            };
            ratePlan: {
                name: string;
                id: string;
                code: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            ratePlanId: string;
            ratePerNight: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            isLocked: boolean;
            lockedAt: Date | null;
        })[];
    }>;
    setRate(propertyId: string, ratePlanId: string, dto: SetRateDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roomTypeId: string;
        ratePlanId: string;
        ratePerNight: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        isLocked: boolean;
        lockedAt: Date | null;
    }>;
    setBulkRates(propertyId: string, ratePlanId: string, dto: BulkRateDto): Promise<{
        updated: number;
        startDate: string;
        endDate: string;
    }>;
    getAIRecommendations(propertyId: string): Promise<{
        date: string;
        roomTypeId: string;
        roomTypeName: string;
        currentRate: number;
        recommendedRate: number;
        variance: number;
        variancePercent: number;
        occupancyPct: number;
        demandScore: number;
        isLocked: boolean;
    }[]>;
    acceptRecommendation(propertyId: string, ratePlanId: string, roomTypeId: string, date: string, rate: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roomTypeId: string;
        ratePlanId: string;
        ratePerNight: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        isLocked: boolean;
        lockedAt: Date | null;
    }>;
    runAutopilot(propertyId: string, trigger?: 'MANUAL' | 'SCHEDULED'): Promise<{
        applied: number;
        skippedLocked: number;
        skippedSmall: number;
        total: number;
        summary: string;
    }>;
    getAutopilotStatus(propertyId: string): Promise<{
        enabled: boolean;
        lastRunAt: Date | null;
        runs: {
            id: string;
            propertyId: string;
            createdAt: Date;
            summary: string;
            applied: number;
            skipped: number;
            trigger: import(".prisma/client").$Enums.AutopilotTrigger;
        }[];
    }>;
    toggleAutopilot(propertyId: string, enabled: boolean): Promise<{
        enabled: boolean;
    }>;
    runScheduledAutopilot(): Promise<number>;
    nightlyAutopilot(): Promise<void>;
    getForecast(propertyId: string, days?: number): Promise<{
        day: string;
        occupancy: number;
        onBooks: number;
    }[]>;
}
