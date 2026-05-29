import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralClaimDocument = ReferralClaim & Document;

@Schema({ timestamps: true })
export class ReferralClaim {
  @Prop({ required: true })
  referrerId: string;

  @Prop({ required: true })
  referredId: string;

  @Prop({ default: 100 })
  rewardPoints: number;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop()
  paidAt?: Date;
}

export const ReferralClaimSchema = SchemaFactory.createForClass(ReferralClaim);
