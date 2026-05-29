import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';

class AddItemDto {
  @IsString() variantId: string;
  @IsInt() @Min(1) qty: number;
}

class AddCustomItemDto {
  @IsString() variantId: string;
  @IsInt() @Min(1) qty: number;
  @IsOptional() customization?: any;
}

class UpdateItemDto {
  @IsInt() @Min(0) qty: number;
}

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser('id') userId: string): Promise<any> {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser('id') userId: string, @Body() dto: AddItemDto): Promise<any> {
    return this.cartService.addItem(userId, dto.variantId, dto.qty);
  }

  @Post('custom-item')
  addCustomItem(@CurrentUser('id') userId: string, @Body() dto: AddCustomItemDto): Promise<any> {
    return this.cartService.addCustomItem(userId, dto.variantId, dto.qty, dto.customization ?? null);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateItemDto,
  ): Promise<any> {
    return this.cartService.updateItem(userId, itemId, dto.qty);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser('id') userId: string, @Param('id') itemId: string): Promise<any> {
    return this.cartService.removeItem(userId, itemId);
  }
}
