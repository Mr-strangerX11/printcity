import { Controller, Post, Body, Param, Headers, RawBodyRequest, Req, UseGuards, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { SkipCsrf } from '../common/guards/csrf.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // 10 payment initiations per user per minute
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(JwtAuthGuard)
  @Post('checkout/:orderId')
  createCheckout(@Param('orderId') orderId: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.createCheckoutSession(orderId, userId);
  }

  @Public()
  @SkipCsrf()
  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody!, sig);
  }

  // ─── eSewa ─────────────────────────────────────────────────────────────────

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(JwtAuthGuard)
  @Post('esewa/:orderId')
  initiateEsewa(@Param('orderId') orderId: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.initiateESewa(orderId, userId);
  }

  /** Called by eSewa success redirect with ?data=<base64> */
  @Public()
  @SkipCsrf()
  @Get('esewa/verify')
  verifyEsewa(@Query('data') data: string) {
    return this.paymentsService.verifyESewa(data);
  }

  // ─── Khalti ────────────────────────────────────────────────────────────────

  /** Called by Khalti return_url redirect with ?pidx=<pidx> — must be before khalti/:orderId */
  @Public()
  @SkipCsrf()
  @Post('khalti/verify')
  verifyKhalti(@Body('pidx') pidx: string) {
    return this.paymentsService.verifyKhalti(pidx);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(JwtAuthGuard)
  @Post('khalti/:orderId')
  initiateKhalti(@Param('orderId') orderId: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.initiateKhalti(orderId, userId);
  }
}
