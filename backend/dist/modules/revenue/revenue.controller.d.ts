import { RevenueService, CreateRatePlanDto, SetRateDto, BulkRateDto } from './revenue.service';
export declare class RevenueController {
    private readonly revenueService;
    constructor(revenueService: RevenueService);
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
    setRate(ratePlanId: string, propertyId: string, dto: SetRateDto): Promise<{
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
    setBulkRates(ratePlanId: string, propertyId: string, dto: BulkRateDto): Promise<{
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
    runAutopilot(propertyId: string): Promise<{
        applied: number;
        skippedLocked: number;
        skippedSmall: number;
        total: number;
        summary: string;
    }>;
    autopilotStatus(propertyId: string): Promise<{
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
    toggleAutopilot(propertyId: string, body: {
        enabled: boolean;
    }): Promise<{
        enabled: boolean;
    }>;
    getForecast(propertyId: string, days?: string): Promise<{
        day: string;
        occupancy: number;
        onBooks: number;
    }[]>;
    acceptRecommendation(propertyId: string, body: {
        ratePlanId: string;
        roomTypeId: string;
        date: string;
        rate: number;
    }): Promise<{
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
}
