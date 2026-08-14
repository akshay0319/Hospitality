import { BookingService, BookDto, OrderDto, CancelBookingDto } from './booking.service';
export declare class BookingController {
    private readonly booking;
    constructor(booking: BookingService);
    property(propertyId: string): Promise<{
        paymentLive: boolean;
        name: string;
        starRating: number;
        city: string;
        state: string | null;
        country: string;
        currency: string;
        id: string;
        brand: string | null;
        checkInTime: string;
        checkOutTime: string;
    }>;
    availability(propertyId: string, checkIn: string, checkOut: string, adults?: string): Promise<{
        roomType: {
            rooms: {
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
            }[];
            ratePlanItems: ({
                ratePlan: {
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
        } & {
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
        available: number;
        nights: number;
        ratePerNight: number;
        totalRate: number;
    }[]>;
    promo(propertyId: string, code: string, roomTypeId: string, checkIn: string, checkOut: string): Promise<{
        valid: false;
        code?: undefined;
        discount?: undefined;
        label?: undefined;
    } | {
        valid: true;
        code: string;
        discount: number;
        label: string;
    }>;
    order(propertyId: string, dto: OrderDto): Promise<{
        mock: true;
        amount: number;
        orderId?: undefined;
        keyId?: undefined;
        currency?: undefined;
    } | {
        mock: false;
        orderId: string;
        amount: number;
        keyId: string;
        currency: string;
    }>;
    book(propertyId: string, dto: BookDto): Promise<{
        confirmationNumber: string;
        guest: string;
        checkIn: string;
        checkOut: string;
        nights: number;
        total: number;
        paid: boolean;
    }>;
    getReservation(propertyId: string, confirmationNumber: string, email: string): Promise<{
        confirmationNumber: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        guest: string;
        email: string | null;
        roomType: string;
        room: string | null;
        checkIn: string;
        checkOut: string;
        nights: number;
        adults: number;
        children: number;
        total: number;
        paid: number;
        balanceDue: number;
        extras: {
            name: string;
            price: number;
            quantity: number;
        }[];
        cancellable: boolean;
    }>;
    cancelReservation(propertyId: string, confirmationNumber: string, dto: CancelBookingDto): Promise<{
        confirmationNumber: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        guest: string;
        email: string | null;
        roomType: string;
        room: string | null;
        checkIn: string;
        checkOut: string;
        nights: number;
        adults: number;
        children: number;
        total: number;
        paid: number;
        balanceDue: number;
        extras: {
            name: string;
            price: number;
            quantity: number;
        }[];
        cancellable: boolean;
    }>;
}
