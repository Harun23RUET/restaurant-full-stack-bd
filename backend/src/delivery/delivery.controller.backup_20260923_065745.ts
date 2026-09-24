import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { DeliveryService } from './delivery.service.js';

import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto.js';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto.js';

import { CreateDeliveryRiderDto } from './dto/create-delivery-rider.dto.js';
import { UpdateDeliveryRiderDto } from './dto/update-delivery-rider.dto.js';

import { CreateDeliveryAssignmentDto } from './dto/create-delivery-assignment.dto.js';
import { UpdateDeliveryAssignmentStatusDto } from './dto/update-delivery-assignment-status.dto.js';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
  ) {}

  // ==========================================================
  // ZONES
  // ==========================================================

  @Post('zones')
  createZone(
    @Body() body: CreateDeliveryZoneDto,
  ) {
    return this.deliveryService.createZone(
      body,
    );
  }

  @Get('zones')
  findAllZones() {
    return this.deliveryService.findAllZones();
  }

  @Get('zones/active')
  findActiveZones() {
    return this.deliveryService.findActiveZones();
  }

  @Get('zones/:id')
  findZone(
    @Param('id') id: string,
  ) {
    return this.deliveryService.findZone(id);
  }

  @Put('zones/:id')
  updateZone(
    @Param('id') id: string,
    @Body() body: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryService.updateZone(
      id,
      body,
    );
  }

  @Delete('zones/:id')
  deleteZone(
    @Param('id') id: string,
  ) {
    return this.deliveryService.deleteZone(id);
  }

  // ==========================================================
  // RIDERS
  // ==========================================================

  @Post('riders')
  createRider(
    @Body() body: CreateDeliveryRiderDto,
  ) {
    return this.deliveryService.createRider(
      body,
    );
  }

  @Get('riders')
  findAllRiders() {
    return this.deliveryService.findAllRiders();
  }

  @Get('riders/active')
  findActiveRiders() {
    return this.deliveryService.findActiveRiders();
  }

  @Get('riders/:id')
  findRider(
    @Param('id') id: string,
  ) {
    return this.deliveryService.findRider(id);
  }

  @Put('riders/:id')
  updateRider(
    @Param('id') id: string,
    @Body() body: UpdateDeliveryRiderDto,
  ) {
    return this.deliveryService.updateRider(
      id,
      body,
    );
  }

  @Delete('riders/:id')
  deleteRider(
    @Param('id') id: string,
  ) {
    return this.deliveryService.deleteRider(id);
  }

  // ==========================================================
  // ASSIGNMENTS
  // ==========================================================

  @Post('assignments')
  createAssignment(
    @Body()
    body: CreateDeliveryAssignmentDto,
  ) {
    return this.deliveryService.createAssignment(
      body,
    );
  }

  @Get('assignments')
  findAllAssignments(
    @Query() query: any,
  ) {
    return this.deliveryService.findAllAssignments(
      query,
    );
  }

  @Get('assignments/:id')
  findAssignment(
    @Param('id') id: string,
  ) {
    return this.deliveryService.findAssignment(
      id,
    );
  }

  @Put('assignments/:id/status')
  updateAssignmentStatus(
    @Param('id') id: string,
    @Body()
    body: UpdateDeliveryAssignmentStatusDto,
  ) {
    return this.deliveryService.updateAssignmentStatus(
      id,
      body.status,
    );
  }

  @Delete('assignments/:id')
  deleteAssignment(
    @Param('id') id: string,
  ) {
    return this.deliveryService.deleteAssignment(
      id,
    );
  }
}
