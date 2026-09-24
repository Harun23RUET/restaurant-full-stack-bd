import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryZoneDto } from './create-delivery-zone.dto.js';

export class UpdateDeliveryZoneDto extends PartialType(
  CreateDeliveryZoneDto,
) {}
