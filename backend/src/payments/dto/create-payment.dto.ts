import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsEnum([
    'CASH',
    'CASH_ON_DELIVERY',
    'BKASH',
    'NAGAD',
    'VISA',
    'MASTERCARD',
    'AMERICAN_EXPRESS',
    'BANK_TRANSFER',
    'QR_PAYMENT',
  ])
  method!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  gateway?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
