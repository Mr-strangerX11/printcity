import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { ReferralCode, ReferralCodeSchema } from './schemas/referral-code.schema';
import { ReferralClaim, ReferralClaimSchema } from './schemas/referral-claim.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReferralCode.name, schema: ReferralCodeSchema },
      { name: ReferralClaim.name, schema: ReferralClaimSchema },
    ]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
