import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { OffersService } from './offers.service.js';

import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { ValidateCouponDto } from './dto/validate-coupon.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
  ) {}

  // Public active offers
  @Get('public')
  findPublic() {
    return this.offersService.findPublic();
  }

  // Public coupon validation
  @Post('validate-coupon')
  validateCoupon(
    @Body() dto: ValidateCouponDto,
  ) {
    return this.offersService.validateCoupon(dto);
  }

  // Admin
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.offersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }

  @Get(':id/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  findCoupons(@Param('id') id: string) {
    return this.offersService.findCoupons(id);
  }

  @Post(':id/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  createCoupon(
    @Param('id') id: string,
    @Body() dto: CreateCouponDto,
  ) {
    return this.offersService.createCoupon({
      ...dto,
      offerId: id,
    });
  }

  @Delete('coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  deleteCoupon(@Param('id') id: string) {
    return this.offersService.deleteCoupon(id);
  }
}
