import { PrismaService } from '@/prisma/prisma.service';
import { ReservationsService } from '@/modules/reservations/reservations.service';
export declare class GroupBlockDto {
    roomTypeId: string;
    quantity: number;
}
export declare class CreateGroupDto {
    name: string;
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;
    checkIn: string;
    checkOut: string;
    notes?: string;
    blocks: GroupBlockDto[];
}
export declare class GroupsService {
    private readonly prisma;
    private readonly reservations;
    constructor(prisma: PrismaService, reservations: ReservationsService);
    private dateOnly;
    create(propertyId: string, dto: CreateGroupDto): Promise<{
        group: {
            name: string;
            id: string;
            propertyId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.GroupStatus;
            notes: string | null;
            checkIn: Date;
            checkOut: Date;
            contactName: string;
            contactEmail: string | null;
            contactPhone: string | null;
        };
        roomsCreated: number;
        roomsFailed: number;
    }>;
    list(propertyId: string): Promise<{
        id: string;
        name: string;
        contactName: string;
        contactEmail: string | null;
        checkIn: Date;
        checkOut: Date;
        status: import(".prisma/client").$Enums.GroupStatus;
        rooms: number;
        activeRooms: number;
        totalValue: number;
    }[]>;
    findOne(id: string, propertyId: string): Promise<{
        reservations: {
            id: string;
            confirmationNumber: string;
            roomType: string;
            room: string | null;
            status: import(".prisma/client").$Enums.ReservationStatus;
            total: number;
        }[];
        name: string;
        id: string;
        propertyId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.GroupStatus;
        notes: string | null;
        checkIn: Date;
        checkOut: Date;
        contactName: string;
        contactEmail: string | null;
        contactPhone: string | null;
    }>;
    cancel(id: string, propertyId: string): Promise<{
        cancelled: number;
    }>;
}
