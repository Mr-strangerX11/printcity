import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoyaltyTransactionDocument = LoyaltyTransaction & Document;

@Schema({ timestamps: true })
export class LoyaltyTransaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true })
  type: string; // PURCHASE, REVIEW, REFERRAL, BIRTHDAY, REDEMPTION

  @Prop()
  description: string;

  @Prop()
  orderId?: string;

  @Prop()
  expiresAt?: Date;
}

export const LoyaltyTransactionSchema = SchemaFactory.createForClass(LoyaltyTransaction);
