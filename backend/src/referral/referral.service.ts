import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReferralCode, ReferralCodeDocument } from './schemas/referral-code.schema';
import { ReferralClaim, ReferralClaimDocument } from './schemas/referral-claim.schema';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectModel(ReferralCode.name) private codeModel: Model<ReferralCodeDocument>,
    @InjectModel(ReferralClaim.name) private claimModel: Model<ReferralClaimDocument>,
  ) {}

  async getOrCreateCode(userId: string, userName?: string): Promise<ReferralCodeDocument> {
    const existing = await this.codeModel.findOne({ userId }).exec();
    if (existing) return existing;

    const base = (userName ?? 'user')
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 6)
      .toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${base}${suffix}`;

    return this.codeModel.create({ userId, code });
  }

  async getStats(userId: string) {
    const claims = await this.claimModel.find({ referrerId: userId }).lean().exec();

    const successful = claims.filter((c) => c.status === 'COMPLETED').length;
    const totalRewardPoints = claims.reduce((sum, c) => sum + (c.rewardPoints ?? 0), 0);

    return {
      totalReferred: claims.length,
      successfulReferrals: successful,
      pendingReferrals: claims.length - successful,
      totalRewardPoints,
    };
  }

  async claimReferral(referredUserId: string, code: string) {
    const refCode = await this.codeModel.findOne({ code }).exec();
    if (!refCode) throw new NotFoundException('Referral code not found');

    if (refCode.userId === referredUserId) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    const existingClaim = await this.claimModel.findOne({ referredId: referredUserId }).exec();
    if (existingClaim) throw new BadRequestException('Already claimed a referral');

    await this.codeModel.updateOne({ _id: refCode._id }, { $inc: { usesCount: 1 } });

    const claim = await this.claimModel.create({
      referrerId: refCode.userId,
      referredId: referredUserId,
    });

    this.logger.log(`Referral claimed: user ${referredUserId} used code ${code} from ${refCode.userId}`);

    return claim;
  }

  async getClaimsForUser(userId: string) {
    return this.claimModel.find({ referrerId: userId }).sort({ createdAt: -1 }).lean().exec();
  }
}
