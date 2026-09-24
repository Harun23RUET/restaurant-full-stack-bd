import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post()
  addToCart(
    @Body()
    body: {
      userId: string;
      menuItemId: string;
      quantity?: number;
    },
  ) {
    return this.cartService.addToCart(
      body.userId,
      body.menuItemId,
      body.quantity ?? 1,
    );
  }

  @Patch(':itemId')
  updateQuantity(
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(itemId, body.quantity);
  }

  @Delete(':itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Delete('clear/:userId')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
