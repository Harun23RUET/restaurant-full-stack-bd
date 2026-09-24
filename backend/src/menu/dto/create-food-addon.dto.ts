import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFoodAddonDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
