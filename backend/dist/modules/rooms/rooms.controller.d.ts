import { RoomsService, UpdateRoomStatusDto } from './rooms.service';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    findAll(propertyId: string, status?: string, roomTypeId?: string): Promise<({
        roomType: {
            name: string;
            id: string;
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
    })[]>;
    getCalendar(propertyId: string, startDate: string, endDate: string): Promise<{
        rooms: ({
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
        })[];
        reservations: ({
            guest: {
                firstName: string;
                lastName: string;
            };
        } & {
            channel: import(".prisma/client").$Enums.BookingChannel;
            id: string;
            propertyId: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            status: import(".prisma/client").$Enums.ReservationStatus;
            confirmationNumber: string;
            guestId: string;
            roomId: string | null;
            ratePlanId: string;
            checkIn: Date;
            checkOut: Date;
            nights: number;
            adults: number;
            children: number;
            ratePerNight: import("@prisma/client/runtime/library").Decimal;
            subTotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal;
            balanceDue: import("@prisma/client/runtime/library").Decimal;
            otaConfirmationNo: string | null;
            specialRequests: string | null;
            internalNotes: string | null;
            checkedInAt: Date | null;
            checkedOutAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
            noShowAt: Date | null;
            groupId: string | null;
        })[];
    }>;
    findOne(id: string, propertyId: string): Promise<{
        roomType: {
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
    }>;
    create(propertyId: string, dto: {
        number: string;
        roomTypeId: string;
        floor: number;
        features?: string[];
    }): Promise<{
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
    }>;
    updateStatus(id: string, propertyId: string, dto: UpdateRoomStatusDto): Promise<{
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
    }>;
    block(id: string, propertyId: string, body: {
        reason?: string;
        until?: string;
    }): Promise<{
        roomType: {
            name: string;
            id: string;
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
    }>;
    unblock(id: string, propertyId: string): Promise<{
        roomType: {
            name: string;
            id: string;
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
    }>;
}
