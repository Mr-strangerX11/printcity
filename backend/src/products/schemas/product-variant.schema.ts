import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductVariantDocument = ProductVariant & Document;

({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class ProductVariant {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) productId: Types.ObjectId;
  @Prop({ required: true }) size: string;
  @Prop({ required: true }) color: string;
  @Prop({ default: 0 }) stock: number;
  @Prop({ required: true }) price: number;
  @Prop() sku?: string;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

ProductVariantSchema.index({ productId: 1, size: 1, color: 1 }, { unique: true });
