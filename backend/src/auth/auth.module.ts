import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../prisma.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_SECRET ||
        'restaurant-full-stack-bd-change-this-secret',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}

