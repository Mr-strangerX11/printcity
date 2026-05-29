import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoyaltyAccountDocument = LoyaltyAccount & Document;

@Schema({ timestamps: true })
export class LoyaltyAccount {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  availablePoints: number;

  @Prop({ default: 'BRONZE' })
  tierName: string;
}

export const LoyaltyAccountSchema = SchemaFactory.createForClass(LoyaltyAccount);
