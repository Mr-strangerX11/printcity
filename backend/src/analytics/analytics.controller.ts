import {
  Controller,
  Get,
  Query,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  // ─── Admin endpoints ───────────────────────────────────────────────────────

  @Get('admin/kpis')
  @Roles('ADMIN')
  getAdminKpis(@Query('period') period = '30d') {
    return this.analyticsService.getAdminKpis(period);
  }

  @Get('admin/revenue')
  @Roles('ADMIN')
  getRevenueAnalytics(@Query('period') period = '30d') {
    return this.analyticsService.getRevenueAnalytics(period);
  }

  @Get('admin/orders-by-status')
  @Roles('ADMIN')
  getOrdersByStatus() {
    return this.analyticsService.getOrdersByStatus();
  }

  @Get('admin/vendors-revenue')
  @Roles('ADMIN')
  getTopVendorsByRevenue(@Query('limit') limit = '10') {
    return this.analyticsService.getTopVendorsByRevenue(Number(limit));
  }

  @Get('admin/payment-methods')
  @Roles('ADMIN')
  getPaymentMethods() {
    return this.analyticsService.getPaymentMethods();
  }

  @Get('admin/system-health')
  @Roles('ADMIN')
  getSystemHealth() {
    return this.analyticsService.getSystemHealth();
  }

  // ─── Vendor endpoints ──────────────────────────────────────────────────────

  @Get('vendor/sales')
  @Roles('VENDOR')
  async getVendorSales(
    @CurrentUser() user: any,
    @Query('period') period = '30d',
  ) {
    const vendor = await this.analyticsService.findVendorByUserId(user._id ?? user.id ?? user.userId);
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return this.analyticsService.getVendorSalesAnalytics(String(vendor._id), period);
  }

  @Get('vendor/orders-by-status')
  @Roles('VENDOR')
  async getVendorOrdersByStatus(@CurrentUser() user: any) {
    const vendor = await this.analyticsService.findVendorByUserId(user._id ?? user.id ?? user.userId);
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return this.analyticsService.getVendorOrdersByStatus(String(vendor._id));
  }
}
