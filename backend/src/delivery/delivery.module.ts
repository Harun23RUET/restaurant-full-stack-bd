import { Module } from '@nestjs/common';

import { DeliveryController } from './delivery.controller.js';
import { DeliveryService } from './delivery.service.js';

import { PrismaModule } from '../prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}

