import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.available === 'true') {
      where.isAvailable = true;
    }

    if (query.available === 'false') {
      where.isAvailable = false;
    }

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        include: {
          category: true,
          options: true,
          addons: true,
        },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        options: true,
        addons: true,
      },
    });

    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async create(data: any) {
    return this.prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        isVegetarian: data.isVegetarian ?? false,
        spiceLevel: data.spiceLevel ?? 1,
        isAvailable: data.isAvailable ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { category: true, options: true, addons: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    const cleanData: any = {};
    const fields = ['categoryId','name','description','price','imageUrl','isVegetarian','spiceLevel','isAvailable','sortOrder'];
    for (const field of fields) {
      if (data[field] !== undefined) cleanData[field] = data[field];
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: cleanData,
      include: { category: true, options: true, addons: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async categories() {
    return this.prisma.menuCategory.findMany({
      include: { items: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCategory(data: any) {
    return this.prisma.menuCategory.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }
}
