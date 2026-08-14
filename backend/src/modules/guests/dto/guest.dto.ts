import { IsString, IsOptional, IsEmail, IsBoolean, IsDateString, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LoyaltyTier } from '@prisma/client';

export class CreateGuestDto {
  @ApiPropertyOptional() @IsString() firstName: string;
  @ApiPropertyOptional() @IsString() lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nationality?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVip?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() marketingOptIn?: boolean;
}
export class UpdateGuestDto extends PartialType(CreateGuestDto) {}

export class GuestPreferenceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() preferredRoomType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredFloor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pillowType?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() dietaryRestrictions?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() smokingRoom?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() earlyCheckIn?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() lateCheckOut?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() noDisturbance?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() communicationChannel?: string;
}
