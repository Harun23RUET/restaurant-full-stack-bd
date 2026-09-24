import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private makeOrderNumber() {
    const now = new Date();
    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    const random = Math.floor(100000 + Math.random() * 900000);

    return `ORD-${date}-${random}`;
  }

  async create(data: any) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (
      data.orderType === 'DELIVERY' &&
      !data.deliveryAddressId
    ) {
      throw new BadRequestException(
        'Delivery address is required for delivery orders',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: data.customerId },
        });

        if (!customer) {
          throw new NotFoundException('Customer not found');
        }
      }

      if (data.deliveryAddressId) {
        const address = await tx.customerAddress.findUnique({
          where: { id: data.deliveryAddressId },
        });

        if (!address) {
          throw new NotFoundException('Delivery address not found');
        }
      }

      let subtotal = 0;

      const preparedItems: any[] = [];

      for (const item of data.items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: {
            options: true,
            addons: true,
          },
        });

        if (!menuItem) {
          throw new NotFoundException(
            `Menu item not found: ${item.menuItemId}`,
          );
        }

        if (!menuItem.isAvailable) {
          throw new BadRequestException(
            `${menuItem.name} is currently unavailable`,
          );
        }

        const quantity = Number(item.quantity);

        let unitPrice = Number(menuItem.price);

        const optionCreates: any[] = [];
        const addonCreates: any[] = [];

        for (const selectedOption of item.options ?? []) {
          const option = menuItem.options.find(
            (x) => x.id === selectedOption.optionId,
          );

          if (!option) {
            throw new BadRequestException(
              `Invalid option for ${menuItem.name}`,
            );
          }

          const optionQuantity =
            Number(selectedOption.quantity ?? 1);

          unitPrice +=
            Number(option.priceModifier) * optionQuantity;

          optionCreates.push({
            optionId: option.id,
            nameSnapshot: option.name,
            price: option.priceModifier,
            quantity: optionQuantity,
          });
        }

        for (const selectedAddon of item.addons ?? []) {
          const addon = menuItem.addons.find(
            (x) => x.id === selectedAddon.addonId,
          );

          if (!addon) {
            throw new BadRequestException(
              `Invalid addon for ${menuItem.name}`,
            );
          }

          const addonQuantity =
            Number(selectedAddon.quantity ?? 1);

          unitPrice +=
            Number(addon.price) * addonQuantity;

          addonCreates.push({
            addonId: addon.id,
            nameSnapshot: addon.name,
            price: addon.price,
            quantity: addonQuantity,
          });
        }

        const itemSubtotal = unitPrice * quantity;

        subtotal += itemSubtotal;

        preparedItems.push({
          menuItemId: menuItem.id,
          itemNameSnapshot: menuItem.name,
          unitPrice,
          quantity,
          subtotal: itemSubtotal,
          options: optionCreates,
          addons: addonCreates,
        });
      }

      const deliveryFee = Number(data.deliveryFee ?? 0);
      const tax = Number(data.tax ?? 0);
      const serviceCharge = Number(data.serviceCharge ?? 0);
      const discount = Number(data.discount ?? 0);

      const total = Math.max(
        0,
        subtotal +
          deliveryFee +
          tax +
          serviceCharge -
          discount,
      );

      const order = await tx.order.create({
        data: {
          orderNumber: this.makeOrderNumber(),
          customerId: data.customerId ?? null,
          orderType: data.orderType as any,
          status: 'NEW' as any,
          subtotal,
          deliveryFee,
          tax,
          serviceCharge,
          discount,
          total,
          couponCode: data.couponCode ?? null,
          deliveryAddressId:
            data.deliveryAddressId ?? null,
          specialInstructions:
            data.specialInstructions ?? null,
          scheduledAt: data.scheduledAt
            ? new Date(data.scheduledAt)
            : null,
          paymentStatus: 'PENDING' as any,

          items: {
            create: preparedItems.map((item) => ({
              menuItemId: item.menuItemId,
              itemNameSnapshot: item.itemNameSnapshot,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,

              options: {
                create: item.options,
              },

              addons: {
                create: item.addons,
              },
            })),
          },
        },

        include: {
          customer: true,
          deliveryAddress: true,
          items: {
            include: {
              options: true,
              addons: true,
              menuItem: true,
            },
          },
        },
      });

      if (data.paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            method: data.paymentMethod as any,
            transactionId:
              data.transactionId ?? null,
            amount: total,
            currency: 'BDT',
            status: 'PENDING' as any,
          },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          deliveryAddress: true,
          items: {
            include: {
              options: true,
              addons: true,
              menuItem: true,
            },
          },
          payment: true,
        },
      });
    });
  }

  async findAll(query: any = {}) {
    const page = Math.max(
      Number(query.page) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(Number(query.limit) || 20, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    const [orders, total] =
      await Promise.all([
        this.prisma.order.findMany({
          where,
          include: {
            customer: true,
            deliveryAddress: true,
            items: {
              include: {
                options: true,
                addons: true,
                menuItem: true,
              },
            },
            payment: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),

        this.prisma.order.count({
          where,
        }),
      ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        deliveryAddress: true,
        items: {
          include: {
            options: true,
            addons: true,
            menuItem: true,
          },
        },
        payment: true,
        delivery: true,
        review: true,
        notifications: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        status: status as any,
      },
      include: {
        customer: true,
        items: {
          include: {
            options: true,
            addons: true,
          },
        },
        payment: true,
      },
    });
  }

  async cancel(id: string) {
    const order = await this.findOne(id);

    if (
      order.status === 'DELIVERED' ||
      order.status === 'COMPLETED'
    ) {
      throw new BadRequestException(
        'Completed orders cannot be cancelled',
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED' as any,
      },
    });
  }

  async findMyOrders(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      return [];
    }

    const orders = await this.prisma.order.findMany({
      where: {
        customerId: customer.id,
      },
      select: {
        id: true,
        orderNumber: true,
        orderType: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return orders.map((order) => ({
      ...order,
      total: Number(order.total),
    }));
  }
}
