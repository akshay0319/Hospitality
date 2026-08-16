import { GroupsService, CreateGroupDto } from './groups.service';
export declare class GroupsController {
    private readonly groups;
    constructor(groups: GroupsService);
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
    cancel(id: string, propertyId: string): Promise<{
        cancelled: number;
    }>;
}
