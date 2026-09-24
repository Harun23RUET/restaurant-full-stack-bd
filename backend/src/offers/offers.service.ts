import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';

import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { ValidateCouponDto } from './dto/validate-coupon.dto.js';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const offers = await this.prisma.offer.findMany({
      include: {
        coupons: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return offers.map((offer) => ({
      ...offer,
      value: Number(offer.value),
      minimumOrder: Number(offer.minimumOrder),
    }));
  }

  async findPublic() {
    const now = new Date();

    const offers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      include: {
        coupons: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return offers.map((offer) => ({
      ...offer,
      value: Number(offer.value),
      minimumOrder: Number(offer.minimumOrder),
    }));
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        coupons: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return {
      ...offer,
      value: Number(offer.value),
      minimumOrder: Number(offer.minimumOrder),
    };
  }

  async create(dto: CreateOfferDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid startDate');
    }

    if (Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid endDate');
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'endDate must be later than startDate',
      );
    }

    if (dto.type === 'PERCENTAGE' && dto.value > 100) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100',
      );
    }

    const offer = await this.prisma.offer.create({
      data: {
        name: dto.name,
        type: dto.type,
        value: dto.value,
        minimumOrder: dto.minimumOrder ?? 0,
        startDate,
        endDate,
        usageLimit: dto.usageLimit ?? null,
        isActive: dto.isActive ?? true,
      },
      include: {
        coupons: true,
      },
    });

    return {
      ...offer,
      value: Number(offer.value),
      minimumOrder: Number(offer.minimumOrder),
    };
  }

  async update(
    id: string,
    dto: UpdateOfferDto,
  ) {
    await this.findOne(id);

    const data: any = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.type !== undefined) {
      data.type = dto.type;
    }

    if (dto.value !== undefined) {
      if (dto.type === 'PERCENTAGE' && dto.value > 100) {
        throw new BadRequestException(
          'Percentage discount cannot exceed 100',
        );
      }

      data.value = dto.value;
    }

    if (dto.minimumOrder !== undefined) {
      data.minimumOrder = dto.minimumOrder;
    }

    if (dto.startDate !== undefined) {
      data.startDate = new Date(dto.startDate);
    }

    if (dto.endDate !== undefined) {
      data.endDate = new Date(dto.endDate);
    }

    if (dto.usageLimit !== undefined) {
      data.usageLimit = dto.usageLimit;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data,
      include: {
        coupons: true,
      },
    });

    return {
      ...updated,
      value: Number(updated.value),
      minimumOrder: Number(updated.minimumOrder),
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.offer.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Offer deleted',
    };
  }

  async createCoupon(dto: CreateCouponDto) {
    const offer = await this.prisma.offer.findUnique({
      where: {
        id: dto.offerId,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const code = dto.code.trim().toUpperCase();

    if (!code) {
      throw new BadRequestException(
        'Coupon code is required',
      );
    }

    const existing = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      throw new BadRequestException(
        'Coupon code already exists',
      );
    }

    return this.prisma.coupon.create({
      data: {
        offerId: dto.offerId,
        code,
      },
      include: {
        offer: true,
      },
    });
  }

  async findCoupons(offerId: string) {
    await this.findOne(offerId);

    return this.prisma.coupon.findMany({
      where: {
        offerId,
      },
      include: {
        offer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.prisma.coupon.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Coupon deleted',
    };
  }

  async validateCoupon(dto: ValidateCouponDto) {
    const code = dto.code.trim().toUpperCase();

    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: {
        offer: true,
      },
    });

    if (!coupon) {
      throw new BadRequestException(
        'Invalid coupon code',
      );
    }

    const offer = coupon.offer;
    const now = new Date();

    if (!offer.isActive) {
      throw new BadRequestException(
        'This offer is inactive',
      );
    }

    if (now < offer.startDate || now > offer.endDate) {
      throw new BadRequestException(
        'This coupon is outside its valid period',
      );
    }

    if (
      offer.usageLimit !== null &&
      offer.usedCount >= offer.usageLimit
    ) {
      throw new BadRequestException(
        'Coupon usage limit reached',
      );
    }

    const minimumOrder = Number(
      offer.minimumOrder,
    );

    if (dto.subtotal < minimumOrder) {
      throw new BadRequestException(
        `Minimum order is ${minimumOrder}`,
      );
    }

    const value = Number(offer.value);

    let discount = 0;

    if (offer.type === 'PERCENTAGE') {
      discount = (dto.subtotal * value) / 100;
    } else if (offer.type === 'FIXED') {
      discount = value;
    } else if (offer.type === 'FREE_DELIVERY') {
      discount = 0;
    }

    if (discount > dto.subtotal) {
      discount = dto.subtotal;
    }

    return {
      valid: true,
      code,
      offerId: offer.id,
      offerName: offer.name,
      type: offer.type,
      value,
      minimumOrder,
      discount,
      freeDelivery:
        offer.type === 'FREE_DELIVERY',
    };
  }
}
