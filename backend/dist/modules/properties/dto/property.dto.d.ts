export declare class CreatePropertyDto {
    name: string;
    brand?: string;
    chain?: string;
    starRating: number;
    address: string;
    city: string;
    state?: string;
    phone?: string;
    email?: string;
    timezone?: string;
    currency?: string;
    gstNumber?: string;
    checkInTime?: string;
    checkOutTime?: string;
}
declare const UpdatePropertyDto_base: import("@nestjs/common").Type<Partial<CreatePropertyDto>>;
export declare class UpdatePropertyDto extends UpdatePropertyDto_base {
}
export declare class CreateRoomTypeDto {
    name: string;
    code: string;
    description?: string;
    maxOccupancy: number;
    baseRate: number;
    totalCount: number;
}
declare const UpdateRoomTypeDto_base: import("@nestjs/common").Type<Partial<CreateRoomTypeDto>>;
export declare class UpdateRoomTypeDto extends UpdateRoomTypeDto_base {
}
export {};
