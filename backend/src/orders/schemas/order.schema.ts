import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus, PaymentStatus } from '../../common/enums';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ required: true }) totalAmount: number;
  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID }) paymentStatus: PaymentStatus;
  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING }) orderStatus: OrderStatus;
  @Prop() shippingName?: string;
  @Prop() shippingPhone?: string;
  @Prop() shippingAddress?: string;
  @Prop() shippingCity?: string;
  @Prop() shippingState?: string;
  @Prop() shippingZip?: string;
  @Prop() shippingCountry?: string;
  @Prop() notes?: string;
  @Prop() trackingNumber?: string;
  @Prop() couponCode?: string;
  @Prop() discountAmount?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Compound indexes for common query patterns
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
