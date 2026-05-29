import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Address extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  phoneNumber: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Review extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  title: string;

  @Prop()
  comment: string;

  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class WishlistItem extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  productId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WishlistItemSchema = SchemaFactory.createForClass(WishlistItem);
