import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoyaltyAccount, LoyaltyAccountDocument } from './schemas/loyalty-account.schema';
import { LoyaltyTransaction, LoyaltyTransactionDocument } from './schemas/loyalty-transaction.schema';
import { LoyaltyReward, LoyaltyRewardDocument } from './schemas/loyalty-reward.schema';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    @InjectModel(LoyaltyAccount.name) private accountModel: Model<LoyaltyAccountDocument>,
    @InjectModel(LoyaltyTransaction.name) private transactionModel: Model<LoyaltyTransactionDocument>,
    @InjectModel(LoyaltyReward.name) private rewardModel: Model<LoyaltyRewardDocument>,
  ) {}

  async getOrCreateAccount(userId: string): Promise<LoyaltyAccountDocument> {
    let account = await this.accountModel.findOne({ userId }).exec();
    if (!account) {
      account = await this.accountModel.create({ userId });
    }
    return account;
  }

  async getPoints(userId: string) {
    const account = await this.getOrCreateAccount(userId);
    const transactions = await this.transactionModel.find({ userId }).lean().exec();

    const breakdown = { purchases: 0, referrals: 0, reviews: 0, birthday: 0 };
    for (const t of transactions) {
      if (t.type === 'PURCHASE' && t.points > 0) breakdown.purchases += t.points;
      else if (t.type === 'REFERRAL' && t.points > 0) breakdown.referrals += t.points;
      else if (t.type === 'REVIEW' && t.points > 0) breakdown.reviews += t.points;
      else if (t.type === 'BIRTHDAY' && t.points > 0) breakdown.birthday += t.points;
    }

    return {
      totalPoints: account.totalPoints,
      availablePoints: account.availablePoints,
      tierName: account.tierName,
      breakdown,
    };
  }

  async getRewards() {
    return this.rewardModel.find({ isActive: true }).lean().exec();
  }

  async getTierStatus(userId: string) {
    const account = await this.getOrCreateAccount(userId);

    const tiers = [
      { name: 'BRONZE', min: 0, max: 999, next: 'SILVER', nextMin: 1000 },
      { name: 'SILVER', min: 1000, max: 4999, next: 'GOLD', nextMin: 5000 },
      { name: 'GOLD', min: 5000, max: 9999, next: 'PLATINUM', nextMin: 10000 },
      { name: 'PLATINUM', min: 10000, max: Infinity, next: null, nextMin: null },
    ];

    const tier = tiers.find(
      (t) => account.totalPoints >= t.min && account.totalPoints <= t.max,
    );

    return {
      currentTier: tier?.name ?? 'BRONZE',
      pointsInTier: account.totalPoints,
      nextTier: tier?.next ?? null,
      pointsToNextTier: tier?.nextMin != null ? tier.nextMin - account.totalPoints : 0,
    };
  }

  async awardPoints(
    userId: string,
    points: number,
    type: string,
    description: string,
    orderId?: string,
  ) {
    await this.transactionModel.create({ userId, points, type, description, orderId });
    await this.accountModel.findOneAndUpdate(
      { userId },
      { $inc: { totalPoints: points, availablePoints: points } },
      { upsert: true, new: true },
    );

    const account = await this.accountModel.findOne({ userId }).exec();
    if (account) {
      const tier = this.getTierForPoints(account.totalPoints);
      await this.accountModel.updateOne({ userId }, { tierName: tier });
    }

    this.logger.log(`Awarded ${points} ${type} points to user ${userId}`);
  }

  private getTierForPoints(points: number): string {
    if (points >= 10000) return 'PLATINUM';
    if (points >= 5000) return 'GOLD';
    if (points >= 1000) return 'SILVER';
    return 'BRONZE';
  }

  async redeemReward(userId: string, rewardId: string) {
    const reward = await this.rewardModel.findById(rewardId).exec();
    if (!reward) throw new NotFoundException('Reward not found');

    const account = await this.getOrCreateAccount(userId);
    if (account.availablePoints < reward.pointsRequired) {
      throw new BadRequestException('Insufficient points');
    }

    await this.transactionModel.create({
      userId,
      points: -reward.pointsRequired,
      type: 'REDEMPTION',
      description: `Redeemed: ${reward.name}`,
    });

    await this.accountModel.updateOne(
      { userId },
      { $inc: { availablePoints: -reward.pointsRequired } },
    );

    const code = `LOYALTY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return {
      success: true,
      rewardCode: code,
      pointsDeducted: reward.pointsRequired,
      remainingPoints: account.availablePoints - reward.pointsRequired,
    };
  }

  async getTransactionHistory(userId: string) {
    return this.transactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
