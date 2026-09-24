import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferDto } from './create-offer.dto.js';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {}
