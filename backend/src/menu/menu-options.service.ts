import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';

@Injectable()
export class MenuOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkMenuItem(menuItemId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return item;
  }

  async getOptions(menuItemId: string) {
    await this.checkMenuItem(menuItemId);

    return this.prisma.foodOption.findMany({
      where: { menuItemId },
      orderBy: { name: 'asc' },
    });
  }

  async createOption(menuItemId: string, data: any) {
    await this.checkMenuItem(menuItemId);

    return this.prisma.foodOption.create({
      data: {
        menuItemId,
        name: data.name,
        priceModifier: data.priceModifier,
        isActive: data.isActive ?? true,
      },
    });
  }

  async getOption(menuItemId: string, id: string) {
    await this.checkMenuItem(menuItemId);

    const option = await this.prisma.foodOption.findFirst({
      where: {
        id,
        menuItemId,
      },
    });

    if (!option) {
      throw new NotFoundException('Food option not found');
    }

    return option;
  }

  async updateOption(
    menuItemId: string,
    id: string,
    data: any,
  ) {
    await this.getOption(menuItemId, id);

    const cleanData: any = {};

    if (data.name !== undefined) {
      cleanData.name = data.name;
    }

    if (data.priceModifier !== undefined) {
      cleanData.priceModifier = data.priceModifier;
    }

    if (data.isActive !== undefined) {
      cleanData.isActive = data.isActive;
    }

    return this.prisma.foodOption.update({
      where: { id },
      data: cleanData,
    });
  }

  async deleteOption(menuItemId: string, id: string) {
    await this.getOption(menuItemId, id);

    return this.prisma.foodOption.delete({
      where: { id },
    });
  }

  async getAddons(menuItemId: string) {
    await this.checkMenuItem(menuItemId);

    return this.prisma.foodAddon.findMany({
      where: { menuItemId },
      orderBy: { name: 'asc' },
    });
  }

  async createAddon(menuItemId: string, data: any) {
    await this.checkMenuItem(menuItemId);

    return this.prisma.foodAddon.create({
      data: {
        menuItemId,
        name: data.name,
        price: data.price,
        isActive: data.isActive ?? true,
      },
    });
  }

  async getAddon(menuItemId: string, id: string) {
    await this.checkMenuItem(menuItemId);

    const addon = await this.prisma.foodAddon.findFirst({
      where: {
        id,
        menuItemId,
      },
    });

    if (!addon) {
      throw new NotFoundException('Food addon not found');
    }

    return addon;
  }

  async updateAddon(
    menuItemId: string,
    id: string,
    data: any,
  ) {
    await this.getAddon(menuItemId, id);

    const cleanData: any = {};

    if (data.name !== undefined) {
      cleanData.name = data.name;
    }

    if (data.price !== undefined) {
      cleanData.price = data.price;
    }

    if (data.isActive !== undefined) {
      cleanData.isActive = data.isActive;
    }

    return this.prisma.foodAddon.update({
      where: { id },
      data: cleanData,
    });
  }

  async deleteAddon(menuItemId: string, id: string) {
    await this.getAddon(menuItemId, id);

    return this.prisma.foodAddon.delete({
      where: { id },
    });
  }
}
