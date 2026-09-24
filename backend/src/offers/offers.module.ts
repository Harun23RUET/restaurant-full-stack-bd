import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
