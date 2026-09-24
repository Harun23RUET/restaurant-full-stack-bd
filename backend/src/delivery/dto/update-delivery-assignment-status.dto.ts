import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateDeliveryAssignmentStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: string;
}
