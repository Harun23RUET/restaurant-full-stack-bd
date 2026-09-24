import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFoodOptionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  priceModifier!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
