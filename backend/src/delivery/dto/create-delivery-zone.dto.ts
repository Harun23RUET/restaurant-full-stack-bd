import {
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDeliveryZoneDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  deliveryFee!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
