import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoyaltyRewardDocument = LoyaltyReward & Document;

@Schema({ timestamps: true })
export class LoyaltyReward {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  pointsRequired: number;

  @Prop()
  discountAmount?: number;

  @Prop({ default: 'discount' })
  category: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const LoyaltyRewardSchema = SchemaFactory.createForClass(LoyaltyReward);
