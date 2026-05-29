import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartItemDocument = CartItem & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Cart', required: true }) cartId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'ProductVariant', required: true }) productVariantId: Types.ObjectId;
  @Prop({ default: 1 }) qty: number;
  // true for customized items — bypasses the unique dedup index
  @Prop({ default: false }) isCustom: boolean;

  // Web-to-Print customization data (optional)
  @Prop({ type: Object, default: null }) customization?: {
    canvasJson?: string;
    previewUrl?: string;
    designUrls?: string[];
    printMethod?: string;
    printSides?: string[];
    notes?: string;
    pricingBreakdown?: {
      basePrice: number;
      printCost: number;
      setupCost: number;
      discount: number;
      total: number;
    };
  };
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

// Enforce uniqueness only for non-customized items (isCustom: false/undefined)
CartItemSchema.index(
  { cartId: 1, productVariantId: 1 },
  { unique: true, partialFilterExpression: { isCustom: { $ne: true } } },
);
