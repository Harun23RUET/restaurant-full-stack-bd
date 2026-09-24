import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!cart) {
      return {
        id: null,
        userId,
        items: [],
        itemCount: 0,
        subtotal: 0,
        total: 0,
      };
    }

    const items = cart.items;

    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * item.quantity,
      0,
    );

    const itemCount = items.reduce(
      (sum: number, item: any) =>
        sum + item.quantity,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items: items.map((item: any) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: Number(item.price),
        lineTotal: Number(item.price) * item.quantity,
        imageUrl: item.menuItem.imageUrl ?? null,
      })),
      itemCount,
      subtotal,
      total: subtotal,
    };
  }

  async addToCart(
    userId: string,
    menuItemId: string,
    quantity: number,
  ) {
    if (quantity < 1) {
      throw new BadRequestException(
        'Quantity must be at least 1',
      );
    }

    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundException(
        'Menu item not found',
      );
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem =
      await this.prisma.cartItem.findUnique({
        where: {
          cartId_menuItemId: {
            cartId: cart.id,
            menuItemId,
          },
        },
      });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity:
            existingItem.quantity + quantity,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity,
          price: menuItem.price,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateQuantity(
    itemId: string,
    quantity: number,
  ) {
    const item =
      await this.prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      });

    if (!item) {
      throw new NotFoundException(
        'Cart item not found',
      );
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCart(item.cart.userId);
  }

  async removeItem(itemId: string) {
    const item =
      await this.prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      });

    if (!item) {
      throw new NotFoundException(
        'Cart item not found',
      );
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(item.cart.userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
    }

    return this.getCart(userId);
  }
}

