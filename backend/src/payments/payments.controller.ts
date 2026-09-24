import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { PaymentsService } from './payments.service.js';

import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto.js';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  create(@Body() body: CreatePaymentDto) {
    return this.paymentsService.create(body);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(
      id,
      body.status,
    );
  }

  @Put(':id/paid')
  markPaid(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.paymentsService.markPaid(
      id,
      body.transactionId,
    );
  }
}
