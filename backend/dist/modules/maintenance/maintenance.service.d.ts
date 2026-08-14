import { MaintenanceStatus, MaintenancePriority } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
export declare class CreateMaintenanceDto {
    title: string;
    description: string;
    priority?: MaintenancePriority;
    roomId?: string;
    category?: string;
    assignedToId?: string;
    estimatedCost?: number;
    dueDate?: string;
}
export declare class UpdateMaintenanceStatusDto {
    status: MaintenanceStatus;
    actualCost?: number;
}
export declare class MaintenanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(propertyId: string, status?: string, priority?: string): Promise<({
        room: {
            number: string;
            floor: number;
        } | null;
        assignedTo: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        photoUrls: string | null;
        description: string;
        title: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        roomId: string | null;
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        assignedToId: string | null;
        category: string | null;
        estimatedCost: import("@prisma/client/runtime/library").Decimal | null;
        dueDate: Date | null;
        actualCost: import("@prisma/client/runtime/library").Decimal | null;
        reportedById: string | null;
        resolvedAt: Date | null;
    })[]>;
    findOne(id: string, propertyId: string): Promise<{
        room: {
            number: string;
            floor: number;
        } | null;
        assignedTo: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        photoUrls: string | null;
        description: string;
        title: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        roomId: string | null;
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        assignedToId: string | null;
        category: string | null;
        estimatedCost: import("@prisma/client/runtime/library").Decimal | null;
        dueDate: Date | null;
        actualCost: import("@prisma/client/runtime/library").Decimal | null;
        reportedById: string | null;
        resolvedAt: Date | null;
    }>;
    create(propertyId: string, reportedById: string | null, dto: CreateMaintenanceDto): Promise<{
        room: {
            number: string;
            floor: number;
        } | null;
        assignedTo: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        photoUrls: string | null;
        description: string;
        title: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        roomId: string | null;
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        assignedToId: string | null;
        category: string | null;
        estimatedCost: import("@prisma/client/runtime/library").Decimal | null;
        dueDate: Date | null;
        actualCost: import("@prisma/client/runtime/library").Decimal | null;
        reportedById: string | null;
        resolvedAt: Date | null;
    }>;
    updateStatus(id: string, propertyId: string, dto: UpdateMaintenanceStatusDto): Promise<{
        room: {
            number: string;
            floor: number;
        } | null;
        assignedTo: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        photoUrls: string | null;
        description: string;
        title: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        roomId: string | null;
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        assignedToId: string | null;
        category: string | null;
        estimatedCost: import("@prisma/client/runtime/library").Decimal | null;
        dueDate: Date | null;
        actualCost: import("@prisma/client/runtime/library").Decimal | null;
        reportedById: string | null;
        resolvedAt: Date | null;
    }>;
    assign(id: string, propertyId: string, assignedToId: string): Promise<{
        room: {
            number: string;
            floor: number;
        } | null;
        assignedTo: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        photoUrls: string | null;
        description: string;
        title: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MaintenanceStatus;
        roomId: string | null;
        priority: import(".prisma/client").$Enums.MaintenancePriority;
        assignedToId: string | null;
        category: string | null;
        estimatedCost: import("@prisma/client/runtime/library").Decimal | null;
        dueDate: Date | null;
        actualCost: import("@prisma/client/runtime/library").Decimal | null;
        reportedById: string | null;
        resolvedAt: Date | null;
    }>;
    getDashboard(propertyId: string): Promise<{
        open: number;
        inProgress: number;
        onHold: number;
        resolved: number;
        critical: number;
        byCategory: {
            category: string;
            count: number;
        }[];
    }>;
}
