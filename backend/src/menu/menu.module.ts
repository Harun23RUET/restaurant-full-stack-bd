import { AuthModule } from '../auth/auth.module.js';
import { Module } from '@nestjs/common';

import { MenuController } from './menu.controller.js';
import { MenuService } from './menu.service.js';

import { MenuOptionsController } from './menu-options.controller.js';
import { MenuOptionsService } from './menu-options.service.js';

@Module({
  controllers: [
    MenuController,
    MenuOptionsController,
  ],
  providers: [
    MenuService,
    MenuOptionsService,
  ],
})
export class MenuModule {}

