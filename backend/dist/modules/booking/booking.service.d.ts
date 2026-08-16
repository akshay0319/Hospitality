import { PrismaService } from '@/prisma/prisma.service';
import { ReservationsService } from '@/modules/reservations/reservations.service';
export declare class BookDto {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialRequests?: string;
    addons?: {
        name: string;
        price: number;
        quantity: number;
    }[];
    promoCode?: string;
    paymentToken?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
}
export declare class CancelBookingDto {
    email: string;
    reason?: string;
}
export declare class OrderDto {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    addons?: {
        name: string;
        price: number;
        quantity: number;
    }[];
    promoCode?: string;
}
export declare class BookingService {
    private readonly prisma;
    private readonly reservations;
    constructor(prisma: PrismaService, reservations: ReservationsService);
    private property;
    getProperty(propertyId: string): Promise<{
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
    private get rzpKeys();
    private quoteAmount;
    createOrder(propertyId: string, dto: OrderDto): Promise<{
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
    private verifySignature;
    availability(propertyId: string, checkIn: string, checkOut: string, adults: number): Promise<{
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
    private nights;
    private findPromo;
    private discountFor;
    previewPromo(propertyId: string, code: string, roomTypeId: string, checkIn: string, checkOut: string): Promise<{
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
    book(propertyId: string, dto: BookDto): Promise<{
        confirmationNumber: string;
        guest: string;
        checkIn: string;
        checkOut: string;
        nights: number;
        total: number;
        paid: boolean;
    }>;
    private findGuarded;
    private publicView;
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
    cancelQuote(propertyId: string, confirmationNumber: string, email: string): Promise<{
        free: boolean;
        fee: number;
        refund: number;
        hoursUntil: number;
        paid: number;
        policy: {
            name: string;
            freeCancellationHours: number;
            penaltyType: import(".prisma/client").$Enums.CancellationPenaltyType;
            penaltyValue: number;
        };
    }>;
    cancelReservation(propertyId: string, confirmationNumber: string, email: string, reason?: string): Promise<{
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
