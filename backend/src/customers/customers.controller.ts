import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CustomersService } from './customers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateAddressDto } from './dto/create-address.dto.js';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Get('profile')
  profile(@Req() req: any) {
    return this.customersService.profile(
      req.user.sub,
    );
  }

  @Get('addresses')
  addresses(@Req() req: any) {
    return this.customersService.addresses(
      req.user.sub,
    );
  }

  @Post('addresses')
  addAddress(
    @Req() req: any,
    @Body() body: CreateAddressDto,
  ) {
    return this.customersService.addAddress(
      req.user.sub,
      body,
    );
  }

  @Delete('addresses/:id')
  deleteAddress(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.customersService.deleteAddress(
      req.user.sub,
      id,
    );
  }
}
