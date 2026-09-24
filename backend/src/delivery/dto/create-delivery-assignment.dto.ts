import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateDeliveryAssignmentDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  riderId!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
