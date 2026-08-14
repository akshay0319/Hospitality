import { PrismaService } from '@/prisma/prisma.service';
import { TaskStatus, TaskPriority, TaskType } from '@prisma/client';
export declare class CreateTaskDto {
    roomId: string;
    taskType: TaskType;
    priority?: TaskPriority;
    assignedToId?: string;
    estimatedMinutes?: number;
    notes?: string;
    scheduledDate?: string;
}
export declare class UpdateTaskStatusDto {
    status: TaskStatus;
    notes?: string;
    supervisorNotes?: string;
}
export declare class HousekeepingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private dateOnly;
    findAll(propertyId: string, date?: string): Promise<({
        room: {
            roomType: {
                name: string;
                code: string;
            };
        } & {
            number: string;
            features: string | null;
            id: string;
            propertyId: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            status: import(".prisma/client").$Enums.RoomStatus;
            isBlocked: boolean;
            blockReason: string | null;
            blockedUntil: Date | null;
            floor: number;
            notes: string | null;
        };
        assignedTo: {
            firstName: string;
            lastName: string;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        photoUrls: string | null;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        roomId: string;
        taskType: import(".prisma/client").$Enums.TaskType;
        priority: import(".prisma/client").$Enums.TaskPriority;
        estimatedMinutes: number;
        startedAt: Date | null;
        completedAt: Date | null;
        nextCheckInTime: Date | null;
        supervisorNotes: string | null;
        scheduledDate: Date;
        assignedToId: string | null;
    })[]>;
    findOne(id: string, propertyId: string): Promise<{
        room: {
            number: string;
            features: string | null;
            id: string;
            propertyId: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            status: import(".prisma/client").$Enums.RoomStatus;
            isBlocked: boolean;
            blockReason: string | null;
            blockedUntil: Date | null;
            floor: number;
            notes: string | null;
        };
        assignedTo: {
            email: string;
            password: string;
            refreshToken: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
            tenantId: string;
            propertyId: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        photoUrls: string | null;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        roomId: string;
        taskType: import(".prisma/client").$Enums.TaskType;
        priority: import(".prisma/client").$Enums.TaskPriority;
        estimatedMinutes: number;
        startedAt: Date | null;
        completedAt: Date | null;
        nextCheckInTime: Date | null;
        supervisorNotes: string | null;
        scheduledDate: Date;
        assignedToId: string | null;
    }>;
    create(propertyId: string, dto: CreateTaskDto): Promise<{
        room: {
            number: string;
            features: string | null;
            id: string;
            propertyId: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            status: import(".prisma/client").$Enums.RoomStatus;
            isBlocked: boolean;
            blockReason: string | null;
            blockedUntil: Date | null;
            floor: number;
            notes: string | null;
        };
        assignedTo: {
            email: string;
            password: string;
            refreshToken: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
            tenantId: string;
            propertyId: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        photoUrls: string | null;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        roomId: string;
        taskType: import(".prisma/client").$Enums.TaskType;
        priority: import(".prisma/client").$Enums.TaskPriority;
        estimatedMinutes: number;
        startedAt: Date | null;
        completedAt: Date | null;
        nextCheckInTime: Date | null;
        supervisorNotes: string | null;
        scheduledDate: Date;
        assignedToId: string | null;
    }>;
    updateStatus(id: string, propertyId: string, dto: UpdateTaskStatusDto): Promise<{
        room: {
            number: string;
            features: string | null;
            id: string;
            propertyId: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            status: import(".prisma/client").$Enums.RoomStatus;
            isBlocked: boolean;
            blockReason: string | null;
            blockedUntil: Date | null;
            floor: number;
            notes: string | null;
        };
    } & {
        photoUrls: string | null;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        roomId: string;
        taskType: import(".prisma/client").$Enums.TaskType;
        priority: import(".prisma/client").$Enums.TaskPriority;
        estimatedMinutes: number;
        startedAt: Date | null;
        completedAt: Date | null;
        nextCheckInTime: Date | null;
        supervisorNotes: string | null;
        scheduledDate: Date;
        assignedToId: string | null;
    }>;
    assign(id: string, propertyId: string, assignedToId: string): Promise<{
        room: {
            number: string;
            features: string | null;
            id: string;
            propertyId: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            status: import(".prisma/client").$Enums.RoomStatus;
            isBlocked: boolean;
            blockReason: string | null;
            blockedUntil: Date | null;
            floor: number;
            notes: string | null;
        };
        assignedTo: {
            email: string;
            password: string;
            refreshToken: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
            tenantId: string;
            propertyId: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            department: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        photoUrls: string | null;
        id: string;
        propertyId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        roomId: string;
        taskType: import(".prisma/client").$Enums.TaskType;
        priority: import(".prisma/client").$Enums.TaskPriority;
        estimatedMinutes: number;
        startedAt: Date | null;
        completedAt: Date | null;
        nextCheckInTime: Date | null;
        supervisorNotes: string | null;
        scheduledDate: Date;
        assignedToId: string | null;
    }>;
    getDashboard(propertyId: string): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        staff: {
            firstName: string;
            lastName: string;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            _count: {
                hkTasks: number;
            };
        }[];
    }>;
    runAIOptimizer(propertyId: string): Promise<{
        optimizedTasks: {
            score: number;
            priority: string;
            nextCheckInTime?: Date | null;
        }[];
        insight: string;
    }>;
}
