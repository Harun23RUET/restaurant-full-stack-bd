import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodOptionDto } from './create-food-option.dto.js';

export class UpdateFoodOptionDto extends PartialType(CreateFoodOptionDto) {}
