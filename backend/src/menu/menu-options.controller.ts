import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { MenuOptionsService } from './menu-options.service.js';
import { CreateFoodOptionDto } from './dto/create-food-option.dto.js';
import { UpdateFoodOptionDto } from './dto/update-food-option.dto.js';
import { CreateFoodAddonDto } from './dto/create-food-addon.dto.js';
import { UpdateFoodAddonDto } from './dto/update-food-addon.dto.js';

@Controller('menu')
export class MenuOptionsController {
  constructor(
    private readonly service: MenuOptionsService,
  ) {}

  @Get(':menuItemId/options')
  getOptions(@Param('menuItemId') menuItemId: string) {
    return this.service.getOptions(menuItemId);
  }

  @Post(':menuItemId/options')
  createOption(
    @Param('menuItemId') menuItemId: string,
    @Body() body: CreateFoodOptionDto,
  ) {
    return this.service.createOption(menuItemId, body);
  }

  @Get(':menuItemId/options/:id')
  getOption(
    @Param('menuItemId') menuItemId: string,
    @Param('id') id: string,
  ) {
    return this.service.getOption(menuItemId, id);
  }

  @Put(':menuItemId/options/:id')
  updateOption(
    @Param('menuItemId') menuItemId: string,
    @Param('id') id: string,
    @Body() body: UpdateFoodOptionDto,
  ) {
    return this.service.updateOption(menuItemId, id, body);
  }

  @Delete(':menuItemId/options/:id')
  deleteOption(
    @Param('menuItemId') menuItemId: string,
    @Param('id') id: string,
  ) {
    return this.service.deleteOption(menuItemId, id);
  }

  @Get(':menuItemId/addons')
  getAddons(@Param('menuItemId') menuItemId: string) {
    return this.service.getAddons(menuItemId);
  }

  @Post(':menuItemId/addons')
  createAddon(
    @Param('menuItemId') menuItemId: string,
    @Body() body: CreateFoodAddonDto,
  ) {
    return this.service.createAddon(menuItemId, body);
  }

  @Get(':menuItemId/addons/:id')
  getAddon(
    @Param('menuItemId') menuItemId: string,
    @Param('id') id: string,
  ) {
    return this.service.getAddon(menuItemId, id);
  }

  @Put(':menuItemId/addons/:id')
  updateAddon(
    @Param('menuItemId') menuItemId: string,
    @Param('id') id: string,
    @Body() body: UpdateFoodAddonDto,
  ) {
    return this.service.updateAddon(menuItemId, id, body);
  }

  @Delete(':menuItemId/addons/:id')
  deleteAddon(
    @Param('menuItemId') menuItemId: string,
    @Param('id') id: string,
  ) {
    return this.service.deleteAddon(menuItemId, id);
  }
}
