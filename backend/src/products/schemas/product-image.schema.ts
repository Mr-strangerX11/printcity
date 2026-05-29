import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductImageDocument = ProductImage & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class ProductImage {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) productId: Types.ObjectId;
  @Prop({ required: true }) url: string;
  @Prop({ default: false }) isPrimary: boolean;
  @Prop() altText?: string;
  @Prop() publicId?: string;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

ProductImageSchema.index({ productId: 1, isPrimary: 1 });
ProductImageSchema.index({ productId: 1 });
