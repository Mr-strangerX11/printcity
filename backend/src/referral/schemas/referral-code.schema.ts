import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralCodeDocument = ReferralCode & Document;

@Schema({ timestamps: true })
export class ReferralCode {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ default: 10 })
  discountPercent: number;

  @Prop({ default: 0 })
  usesCount: number;

  @Prop()
  maxUses?: number;

  @Prop()
  expiresAt?: Date;
}

export const ReferralCodeSchema = SchemaFactory.createForClass(ReferralCode);
