export declare class CreateGuestDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    nationality?: string;
    dateOfBirth?: string;
    idType?: string;
    idNumber?: string;
    tags?: string[];
    notes?: string;
    isVip?: boolean;
    marketingOptIn?: boolean;
}
declare const UpdateGuestDto_base: import("@nestjs/common").Type<Partial<CreateGuestDto>>;
export declare class UpdateGuestDto extends UpdateGuestDto_base {
}
export declare class GuestPreferenceDto {
    preferredRoomType?: string;
    preferredFloor?: string;
    pillowType?: string;
    dietaryRestrictions?: string[];
    smokingRoom?: boolean;
    earlyCheckIn?: boolean;
    lateCheckOut?: boolean;
    noDisturbance?: boolean;
    communicationChannel?: string;
}
export {};
