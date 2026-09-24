import {
  IsEnum,
} from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum([
    'NEW',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ])
  status!: string;
}
