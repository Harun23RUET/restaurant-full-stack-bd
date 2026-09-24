import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma.module.js';
import { MenuModule } from './menu/menu.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { DeliveryModule } from './delivery/delivery.module.js';
import { OffersModule } from './offers/offers.module.js';
import { CoreModule } from './core/core.module.js';
import { CartModule } from './cart/cart.module.js';
@Module({imports:[PrismaModule,MenuModule,SettingsModule,OrdersModule,AuthModule,CustomersModule,PaymentsModule,DeliveryModule,OffersModule,CoreModule,CartModule],controllers:[AppController],providers:[]})
export class AppModule{}

