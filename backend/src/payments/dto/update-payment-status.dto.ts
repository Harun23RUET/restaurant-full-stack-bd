import {
  IsEnum,
} from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsEnum([
    'PENDING',
    'AUTHORIZED',
    'PAID',
    'FAILED',
    'REFUNDED',
    'CANCELLED',
  ])
  status!: string;
}
