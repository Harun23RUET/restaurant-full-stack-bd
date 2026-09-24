import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================================
  // DELIVERY ZONES
  // ==========================================================

  async createZone(data: any) {
    return this.prisma.deliveryZone.create({
      data: {
        name: data.name,
        minimumOrder: data.minimumOrder ?? 0,
        deliveryFee: data.deliveryFee,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAllZones() {
    return this.prisma.deliveryZone.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findActiveZones() {
    return this.prisma.deliveryZone.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findZone(id: string) {
    const zone =
      await this.prisma.deliveryZone.findUnique({
        where: { id },
      });

    if (!zone) {
      throw new NotFoundException(
        'Delivery zone not found',
      );
    }

    return zone;
  }

  async updateZone(
    id: string,
    data: any,
  ) {
    await this.findZone(id);

    const cleanData: any = {};

    if (data.name !== undefined) {
      cleanData.name = data.name;
    }

    if (data.minimumOrder !== undefined) {
      cleanData.minimumOrder =
        data.minimumOrder;
    }

    if (data.deliveryFee !== undefined) {
      cleanData.deliveryFee =
        data.deliveryFee;
    }

    if (data.isActive !== undefined) {
      cleanData.isActive =
        data.isActive;
    }

    return this.prisma.deliveryZone.update({
      where: { id },
      data: cleanData,
    });
  }

  async deleteZone(id: string) {
    await this.findZone(id);

    return this.prisma.deliveryZone.delete({
      where: { id },
    });
  }

  // ==========================================================
  // DELIVERY RIDERS
  // ==========================================================

  async createRider(data: any) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: data.userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const existing =
      await this.prisma.deliveryRider.findUnique({
        where: {
          userId: data.userId,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'This user is already a delivery rider',
      );
    }

    return this.prisma.deliveryRider.create({
      data: {
        userId: data.userId,
        name: data.name,
        phone: data.phone,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAllRiders() {
    return this.prisma.deliveryRider.findMany({
      include: {
        assignments: {
          orderBy: {
            assignedAt: 'desc',
          },
          take: 10,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findActiveRiders() {
    return this.prisma.deliveryRider.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findRider(id: string) {
    const rider =
      await this.prisma.deliveryRider.findUnique({
        where: { id },
        include: {
          assignments: {
            include: {
              order: true,
            },
            orderBy: {
              assignedAt: 'desc',
            },
          },
        },
      });

    if (!rider) {
      throw new NotFoundException(
        'Delivery rider not found',
      );
    }

    return rider;
  }

  async updateRider(
    id: string,
    data: any,
  ) {
    await this.findRider(id);

    const cleanData: any = {};

    if (data.userId !== undefined) {
      const user =
        await this.prisma.user.findUnique({
          where: {
            id: data.userId,
          },
        });

      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }

      cleanData.userId = data.userId;
    }

    if (data.name !== undefined) {
      cleanData.name = data.name;
    }

    if (data.phone !== undefined) {
      cleanData.phone = data.phone;
    }

    if (data.isActive !== undefined) {
      cleanData.isActive =
        data.isActive;
    }

    return this.prisma.deliveryRider.update({
      where: { id },
      data: cleanData,
    });
  }

  async deleteRider(id: string) {
    await this.findRider(id);

    const assignments =
      await this.prisma.deliveryAssignment.count({
        where: {
          riderId: id,
        },
      });

    if (assignments > 0) {
      throw new BadRequestException(
        'Rider has delivery assignments and cannot be deleted',
      );
    }

    return this.prisma.deliveryRider.delete({
      where: { id },
    });
  }

  // ==========================================================
  // DELIVERY ASSIGNMENTS
  // ==========================================================

  async createAssignment(data: any) {
    const order =
      await this.prisma.order.findUnique({
        where: {
          id: data.orderId,
        },
        include: {
          delivery: true,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    if (order.delivery) {
      throw new BadRequestException(
        'This order already has a delivery assignment',
      );
    }

    if (order.orderType !== 'DELIVERY') {
      throw new BadRequestException(
        'Only delivery orders can be assigned to a rider',
      );
    }

    const rider =
      await this.prisma.deliveryRider.findUnique({
        where: {
          id: data.riderId,
        },
      });

    if (!rider) {
      throw new NotFoundException(
        'Delivery rider not found',
      );
    }

    if (!rider.isActive) {
      throw new BadRequestException(
        'Delivery rider is inactive',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const assignment =
          await tx.deliveryAssignment.create({
            data: {
              orderId: data.orderId,
              riderId: data.riderId,
              status:
                data.status ?? 'ASSIGNED',
            },
            include: {
              order: true,
              rider: true,
            },
          });

        await tx.order.update({
          where: {
            id: data.orderId,
          },
          data: {
            status: 'CONFIRMED',
          },
        });

        return assignment;
      },
    );
  }

  async findAllAssignments(
    query: any = {},
  ) {
    const where: any = {};

    if (query.riderId) {
      where.riderId =
        query.riderId;
    }

    if (query.orderId) {
      where.orderId =
        query.orderId;
    }

    if (query.status) {
      where.status =
        query.status;
    }

    return this.prisma.deliveryAssignment.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
            deliveryAddress: true,
            items: {
              include: {
                options: true,
                addons: true,
              },
            },
          },
        },
        rider: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
  }

  async findAssignment(id: string) {
    const assignment =
      await this.prisma.deliveryAssignment.findUnique({
        where: {
          id,
        },
        include: {
          order: {
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
          },
          rider: true,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Delivery assignment not found',
      );
    }

    return assignment;
  }

  async updateAssignmentStatus(id: string, status: string) {
    const validStatuses = [
      'ASSIGNED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid delivery assignment status: ${status}`,
      );
    }

    const current = await this.prisma.deliveryAssignment.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException('Delivery assignment not found');
    }

    const now = new Date();

    const assignmentData: {
      status: string;
      pickedUpAt?: Date;
      outForDeliveryAt?: Date;
      deliveredAt?: Date;
    } = {
      status,
    };

    if (status === 'PICKED_UP') {
      assignmentData.pickedUpAt = now;
    }

    if (status === 'OUT_FOR_DELIVERY') {
      assignmentData.outForDeliveryAt = now;
    }

    if (status === 'DELIVERED') {
      assignmentData.deliveredAt = now;
    }

    let nextOrderStatus:
      | 'READY'
      | 'OUT_FOR_DELIVERY'
      | 'DELIVERED'
      | 'CANCELLED'
      | undefined;

    switch (status) {
      case 'ASSIGNED':
        nextOrderStatus = 'READY';
        break;

      case 'PICKED_UP':
        nextOrderStatus = 'OUT_FOR_DELIVERY';
        break;

      case 'OUT_FOR_DELIVERY':
        nextOrderStatus = 'OUT_FOR_DELIVERY';
        break;

      case 'DELIVERED':
        nextOrderStatus = 'DELIVERED';
        break;

      case 'CANCELLED':
        nextOrderStatus = 'CANCELLED';
        break;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const assignment = await tx.deliveryAssignment.update({
        where: { id },
        data: assignmentData,
      });

      if (nextOrderStatus) {
        await tx.order.update({
          where: { id: current.orderId },
          data: {
            status: nextOrderStatus,
          },
        });
      }

      return assignment;
    });

    return result;
  }

  async deleteAssignment(id: string) {
    await this.findAssignment(id);

    return this.prisma.deliveryAssignment.delete({
      where: {
        id,
      },
    });
  }
}
