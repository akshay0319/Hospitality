import {
  IsEmail, IsString, MinLength, IsOptional, IsInt, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  // ── Account (owner user) ──────────────────────────────────────────────────
  @ApiProperty({ example: 'Aarav' })
  @IsString() @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString() @MinLength(1)
  lastName: string;

  @ApiProperty({ example: 'owner@sunrisehotels.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @IsString() @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional() @IsString()
  phone?: string;

  // ── Company / tenant ──────────────────────────────────────────────────────
  @ApiProperty({ example: 'Sunrise Hospitality Group' })
  @IsString() @MinLength(2)
  companyName: string;

  // ── Property (first hotel) ────────────────────────────────────────────────
  @ApiProperty({ example: 'Sunrise Grand' })
  @IsString() @MinLength(2)
  propertyName: string;

  @ApiPropertyOptional({ example: 'Hotel' })
  @IsOptional() @IsString()
  propertyType?: string;

  @ApiProperty({ example: 4 })
  @IsInt() @Min(1) @Max(7)
  starRating: number;

  @ApiProperty({ example: 60 })
  @IsInt() @Min(1)
  totalRooms: number;

  @ApiProperty({ example: '221 Marine Drive' })
  @IsString() @MinLength(2)
  address: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString() @MinLength(1)
  city: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional() @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional() @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional() @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '+91 22 1234 5678' })
  @IsOptional() @IsString()
  propertyPhone?: string;
}
