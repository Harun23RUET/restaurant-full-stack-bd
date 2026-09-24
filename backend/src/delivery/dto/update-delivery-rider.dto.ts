import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryRiderDto } from './create-delivery-rider.dto.js';

export class UpdateDeliveryRiderDto extends PartialType(
  CreateDeliveryRiderDto,
) {}
