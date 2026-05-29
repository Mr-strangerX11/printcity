import { Controller, Get, Post, Param, Logger } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('loyalty')
export class LoyaltyController {
  private readonly logger = new Logger(LoyaltyController.name);

  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('points')
  getPoints(@CurrentUser() user: any) {
    const userId = String(user._id ?? user.id ?? user.userId);
    return this.loyaltyService.getPoints(userId);
  }

  @Get('rewards')
  getRewards() {
    return this.loyaltyService.getRewards();
  }

  @Post('redeem/:rewardId')
  redeemReward(@CurrentUser() user: any, @Param('rewardId') rewardId: string) {
    const userId = String(user._id ?? user.id ?? user.userId);
    return this.loyaltyService.redeemReward(userId, rewardId);
  }

  @Get('tier-status')
  getTierStatus(@CurrentUser() user: any) {
    const userId = String(user._id ?? user.id ?? user.userId);
    return this.loyaltyService.getTierStatus(userId);
  }

  @Get('history')
  getHistory(@CurrentUser() user: any) {
    const userId = String(user._id ?? user.id ?? user.userId);
    return this.loyaltyService.getTransactionHistory(userId);
  }
}
