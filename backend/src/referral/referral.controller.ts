import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

export class ClaimReferralDto {
  code: string;
}

@Controller('referral')
export class ReferralController {
  private readonly logger = new Logger(ReferralController.name);

  constructor(private readonly referralService: ReferralService) {}

  @Get('code')
  getOrCreateCode(@CurrentUser() user: any) {
    const userId = String(user._id ?? user.id ?? user.userId);
    const userName: string | undefined = user.name ?? user.firstName;
    return this.referralService.getOrCreateCode(userId, userName);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    const userId = String(user._id ?? user.id ?? user.userId);
    return this.referralService.getStats(userId);
  }

  @Post('claim')
  claimReferral(@CurrentUser() user: any, @Body() body: ClaimReferralDto) {
    const userId = String(user._id ?? user.id ?? user.userId);
    return this.referralService.claimReferral(userId, body.code);
  }

  @Get('claims')
  getClaims(@CurrentUser() user: any) {
    const userId = String(user._id ?? user.id ?? user.userId);
    return this.referralService.getClaimsForUser(userId);
  }
}
