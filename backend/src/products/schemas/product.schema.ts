import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductStatus } from '../../common/enums';

export type ProductDocument = Product & Document;

export interface PrintArea {
  x: number;      // % from left
  y: number;      // % from top
  width: number;  // % of image width
  height: number; // % of image height
}

export interface MockupImage {
  color: string;
  hex: string;
  front: string;
  back?: string;
  sleeve?: string;
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true }) vendorId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null }) categoryId?: Types.ObjectId;
  @Prop({ required: true }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop() description?: string;
  @Prop({ required: true }) basePrice: number;
  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.DRAFT }) status: ProductStatus;
  @Prop({ type: [String], default: [] }) tags: string[];

  // ── Web-to-Print fields ──────────────────────────────────────────────────
  @Prop({ default: false }) customizable: boolean;

  @Prop({ type: Object, default: null }) printAreas?: {
    front?: PrintArea;
    back?: PrintArea;
    sleeve?: PrintArea;
  };

  @Prop({ type: [Object], default: [] }) mockupImages: MockupImage[];

  @Prop({ type: [String], default: [] }) availablePrintMethods: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ vendorId: 1, status: 1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1, status: 1 });
