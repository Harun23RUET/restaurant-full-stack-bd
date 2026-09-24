import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodAddonDto } from './create-food-addon.dto.js';

export class UpdateFoodAddonDto extends PartialType(CreateFoodAddonDto) {}
