import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma.module.js';

import { DeliveryController } from './delivery.controller.js';
import { DeliveryService } from './delivery.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
