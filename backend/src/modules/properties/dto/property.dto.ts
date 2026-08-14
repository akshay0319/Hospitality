import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chain?: string;
  @ApiProperty() @IsInt() @Min(1) @Max(7) starRating: number;
  @ApiProperty() @IsString() address: string;
  @ApiProperty() @IsString() city: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() timezone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() checkInTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() checkOutTime?: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class CreateRoomTypeDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsInt() @Min(1) maxOccupancy: number;
  @ApiProperty() @IsInt() @Min(0) baseRate: number;
  @ApiProperty() @IsInt() @Min(0) totalCount: number;
}
export class UpdateRoomTypeDto extends PartialType(CreateRoomTypeDto) {}
