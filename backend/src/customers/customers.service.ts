import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async profile(userId: string) {
    const customer =
      await this.prisma.customer.findUnique({
        where: { userId },
        include: {
          user: true,
          addresses: true,
          orders: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20,
          },
        },
      });

    if (!customer) {
      throw new NotFoundException(
        'Customer profile not found',
      );
    }

    return customer;
  }

  async addAddress(
    userId: string,
    data: any,
  ) {
    const customer =
      await this.prisma.customer.findUnique({
        where: { userId },
      });

    if (!customer) {
      throw new NotFoundException(
        'Customer profile not found',
      );
    }

    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: {
          customerId: customer.id,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        label: data.label,
        address: data.address,
        building: data.building,
        roomNumber: data.roomNumber,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async addresses(userId: string) {
    const customer =
      await this.prisma.customer.findUnique({
        where: { userId },
      });

    if (!customer) {
      throw new NotFoundException(
        'Customer profile not found',
      );
    }

    return this.prisma.customerAddress.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async deleteAddress(
    userId: string,
    addressId: string,
  ) {
    const customer =
      await this.prisma.customer.findUnique({
        where: { userId },
      });

    if (!customer) {
      throw new NotFoundException(
        'Customer profile not found',
      );
    }

    const address =
      await this.prisma.customerAddress.findFirst({
        where: {
          id: addressId,
          customerId: customer.id,
        },
      });

    if (!address) {
      throw new NotFoundException(
        'Address not found',
      );
    }

    return this.prisma.customerAddress.delete({
      where: {
        id: addressId,
      },
    });
  }
}
