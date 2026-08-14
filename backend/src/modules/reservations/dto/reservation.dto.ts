import {
  IsString, IsOptional, IsInt, IsDateString, IsEnum, IsArray, Min, ValidateNested, IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BookingChannel, ReservationStatus } from '@prisma/client';

export class CreateReservationExtraDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() price: number;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
}

export class CreateReservationDto {
  @ApiProperty() @IsString() guestId: string;
  @ApiProperty() @IsString() roomTypeId: string;
  @ApiProperty() @IsString() ratePlanId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() roomId?: string;
  @ApiProperty() @IsDateString() checkIn: string;
  @ApiProperty() @IsDateString() checkOut: string;
  @ApiProperty() @IsInt() @Min(1) adults: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) children?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() specialRequests?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(BookingChannel) channel?: BookingChannel;
  @ApiPropertyOptional() @IsOptional() @IsString() otaConfirmationNo?: string;
  @ApiPropertyOptional({ type: [CreateReservationExtraDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReservationExtraDto)
  extras?: CreateReservationExtraDto[];
}

export class UpdateReservationDto extends PartialType(CreateReservationDto) {}

export class CheckInDto {
  @ApiPropertyOptional() @IsOptional() @IsString() roomId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idDocumentUrl?: string;
}

export class CheckOutDto {
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class AvailabilityQueryDto {
  @ApiProperty() @IsDateString() checkIn: string;
  @ApiProperty() @IsDateString() checkOut: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) adults?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) children?: number;
}

export class ReservationFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsEnum(ReservationStatus) status?: ReservationStatus;
  @ApiPropertyOptional() @IsOptional() @IsDateString() checkInFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() checkInTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(BookingChannel) channel?: BookingChannel;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() limit?: number;
  get skip() { return ((this.page ?? 1) - 1) * (this.limit ?? 20); }
}
