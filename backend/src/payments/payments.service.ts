import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment) {
      throw new BadRequestException(
        'Payment already exists for this order',
      );
    }

    if (Number(data.amount) !== Number(order.total)) {
      throw new BadRequestException(
        'Payment amount must match order total',
      );
    }

    const payment =
      await this.prisma.$transaction(async (tx) => {
        const created = await tx.payment.create({
          data: {
            orderId: data.orderId,
            method: data.method as any,
            gateway: data.gateway ?? null,
            transactionId:
              data.transactionId ?? null,
            amount: data.amount,
            currency: 'BDT',
            status: 'PENDING' as any,
          },
        });

        await tx.order.update({
          where: { id: data.orderId },
          data: {
            paymentStatus: 'PENDING' as any,
          },
        });

        return created;
      });

    return payment;
  }

  async findAll(query: any = {}) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.method) {
      where.method = query.method;
    }

    if (query.orderId) {
      where.orderId = query.orderId;
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const payment =
      await this.prisma.payment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              customer: true,
              items: {
                include: {
                  options: true,
                  addons: true,
                },
              },
            },
          },
        },
      });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    return payment;
  }

  async updateStatus(
    id: string,
    status: string,
  ) {
    const payment =
      await this.prisma.payment.findUnique({
        where: { id },
      });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    const paidAt =
      status === 'PAID'
        ? new Date()
        : payment.paidAt;

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.payment.update({
            where: { id },
            data: {
              status: status as any,
              paidAt,
            },
          });

        await tx.order.update({
          where: {
            id: payment.orderId,
          },
          data: {
            paymentStatus: status as any,
          },
        });

        return updated;
      },
    );
  }

  async markPaid(
    id: string,
    transactionId?: string,
  ) {
    const payment =
      await this.prisma.payment.findUnique({
        where: { id },
      });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.payment.update({
            where: { id },
            data: {
              status: 'PAID' as any,
              transactionId:
                transactionId ??
                payment.transactionId,
              paidAt: new Date(),
            },
          });

        await tx.order.update({
          where: {
            id: payment.orderId,
          },
          data: {
            paymentStatus: 'PAID' as any,
          },
        });

        return updated;
      },
    );
  }
}
