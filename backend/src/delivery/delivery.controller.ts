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

import { DeliveryService } from './delivery.service.js';

import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto.js';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto.js';
import { CreateDeliveryRiderDto } from './dto/create-delivery-rider.dto.js';
import { UpdateDeliveryRiderDto } from './dto/update-delivery-rider.dto.js';
import { CreateDeliveryAssignmentDto } from './dto/create-delivery-assignment.dto.js';
import { UpdateDeliveryAssignmentStatusDto } from './dto/update-delivery-assignment-status.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // =========================
  // DELIVERY ZONES
  // =========================

  @Post('zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  createZone(@Body() dto: CreateDeliveryZoneDto) {
    return this.deliveryService.createZone(dto);
  }

  @Get('zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findAllZones() {
    return this.deliveryService.findAllZones();
  }

  @Get('zones/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findActiveZones() {
    return this.deliveryService.findActiveZones();
  }

  @Get('zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findZone(@Param('id') id: string) {
    return this.deliveryService.findZone(id);
  }

  @Put('zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  updateZone(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryService.updateZone(id, dto);
  }

  @Delete('zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  deleteZone(@Param('id') id: string) {
    return this.deliveryService.deleteZone(id);
  }

  // =========================
  // RIDERS
  // =========================

  @Post('riders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  createRider(@Body() dto: CreateDeliveryRiderDto) {
    return this.deliveryService.createRider(dto);
  }

  @Get('riders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findAllRiders() {
    return this.deliveryService.findAllRiders();
  }

  @Get('riders/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findActiveRiders() {
    return this.deliveryService.findActiveRiders();
  }

  @Get('riders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findRider(@Param('id') id: string) {
    return this.deliveryService.findRider(id);
  }

  @Put('riders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  updateRider(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryRiderDto,
  ) {
    return this.deliveryService.updateRider(id, dto);
  }

  @Delete('riders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  deleteRider(@Param('id') id: string) {
    return this.deliveryService.deleteRider(id);
  }

  // =========================
  // DELIVERY ASSIGNMENTS
  // =========================

  @Post('assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  createAssignment(@Body() dto: CreateDeliveryAssignmentDto) {
    return this.deliveryService.createAssignment(dto);
  }

  @Get('assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findAllAssignments() {
    return this.deliveryService.findAllAssignments();
  }

  @Get('assignments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  findAssignment(@Param('id') id: string) {
    return this.deliveryService.findAssignment(id);
  }

  @Put('assignments/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  updateAssignmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryAssignmentStatusDto,
  ) {
    return this.deliveryService.updateAssignmentStatus(id, dto.status);
  }

  @Delete('assignments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'DELIVERY_STAFF')
  deleteAssignment(@Param('id') id: string) {
    return this.deliveryService.deleteAssignment(id);
  }
}

