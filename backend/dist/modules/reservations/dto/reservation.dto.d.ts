import { BookingChannel, ReservationStatus, CancellationPenaltyType } from '@prisma/client';
export declare class UpdateCancellationPolicyDto {
    name?: string;
    freeCancellationHours?: number;
    penaltyType?: CancellationPenaltyType;
    penaltyValue?: number;
}
export declare class CreateReservationExtraDto {
    name: string;
    description?: string;
    price: number;
    quantity: number;
}
export declare class CreateReservationDto {
    guestId: string;
    roomTypeId: string;
    ratePlanId: string;
    roomId?: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children?: number;
    specialRequests?: string;
    channel?: BookingChannel;
    otaConfirmationNo?: string;
    extras?: CreateReservationExtraDto[];
}
declare const UpdateReservationDto_base: import("@nestjs/common").Type<Partial<CreateReservationDto>>;
export declare class UpdateReservationDto extends UpdateReservationDto_base {
}
export declare class CheckInDto {
    roomId?: string;
    idDocumentUrl?: string;
}
export declare class CheckOutDto {
    notes?: string;
}
export declare class AvailabilityQueryDto {
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number;
}
export declare class ReservationFilterDto {
    status?: ReservationStatus;
    checkInFrom?: string;
    checkInTo?: string;
    channel?: BookingChannel;
    search?: string;
    page?: number;
    limit?: number;
    get skip(): number;
}
export {};
