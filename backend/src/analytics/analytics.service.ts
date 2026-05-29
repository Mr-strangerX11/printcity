import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Vendor, VendorDocument } from '../vendors/schemas/vendor.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { OrderItem, OrderItemDocument } from '../orders/schemas/order-item.schema';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  private getPeriodDates(period: string): {
    start: Date;
    end: Date;
    prevStart: Date;
    prevEnd: Date;
  } {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const end = new Date();
    const start = new Date(Date.now() - days * 86400000);
    const prevEnd = new Date(start);
    const prevStart = new Date(Date.now() - 2 * days * 86400000);
    return { start, end, prevStart, prevEnd };
  }

  private calcTrend(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? '+100.0%' : '0.0%';
    const pct = ((current - previous) / previous) * 100;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  }

  async getAdminKpis(period: string) {
    const key = `analytics:kpis:${period}`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const { start, end, prevStart, prevEnd } = this.getPeriodDates(period);

    const [currentOrders, prevOrders] = await Promise.all([
      this.orderModel.find({ createdAt: { $gte: start, $lte: end } }).lean().exec(),
      this.orderModel.find({ createdAt: { $gte: prevStart, $lte: prevEnd } }).lean().exec(),
    ]);

    const currentRevenue = currentOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    const totalCustomers = await this.orderModel.distinct('userId', {
      createdAt: { $gte: start, $lte: end },
    });
    const prevCustomers = await this.orderModel.distinct('userId', {
      createdAt: { $gte: prevStart, $lte: prevEnd },
    });

    const totalProducts = await this.productModel.countDocuments({ status: 'ACTIVE' });
    const prevProducts = await this.productModel.countDocuments({
      createdAt: { $lte: prevEnd },
      status: 'ACTIVE',
    });

    const statusBreakdown = await this.orderModel.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const result = {
      revenue: {
        current: currentRevenue,
        previous: prevRevenue,
        trend: this.calcTrend(currentRevenue, prevRevenue),
      },
      orders: {
        current: currentOrders.length,
        previous: prevOrders.length,
        trend: this.calcTrend(currentOrders.length, prevOrders.length),
      },
      customers: {
        current: totalCustomers.length,
        previous: prevCustomers.length,
        trend: this.calcTrend(totalCustomers.length, prevCustomers.length),
      },
      products: {
        current: totalProducts,
        previous: prevProducts,
        trend: this.calcTrend(totalProducts, prevProducts),
      },
      orderStatusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
    };

    await this.cache.set(key, result, 300000);
    return result;
  }

  async getRevenueAnalytics(period: string) {
    const key = `analytics:revenue:${period}`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const { start, end } = this.getPeriodDates(period);

    const data = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
    ]);

    await this.cache.set(key, data, 300000);
    return data;
  }

  async getOrdersByStatus() {
    const key = `analytics:orders-status`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const results = await this.orderModel.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = results.reduce((s, r) => s + r.count, 0);

    const result = results.map((r) => ({
      status: r._id,
      count: r.count,
      percentage: total > 0 ? `${((r.count / total) * 100).toFixed(1)}%` : '0.0%',
    }));

    await this.cache.set(key, result, 300000);
    return result;
  }

  async getTopVendorsByRevenue(limit = 10) {
    const key = `analytics:vendors-revenue:${limit}`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const results = await this.orderItemModel.aggregate([
      {
        $group: {
          _id: '$vendorId',
          totalEarnings: { $sum: '$vendorCommission' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'vendors',
          let: { vendorId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$vendorId'] } } },
            { $project: { storeName: 1 } },
          ],
          as: 'vendor',
        },
      },
      {
        $project: {
          vendorId: '$_id',
          storeName: { $arrayElemAt: ['$vendor.storeName', 0] },
          totalEarnings: 1,
          orderCount: 1,
        },
      },
    ]);

    await this.cache.set(key, results, 300000);
    return results;
  }

  async getPaymentMethods() {
    const key = `analytics:payment-methods`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const results = await this.paymentModel.aggregate([
      {
        $group: {
          _id: '$provider',
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] },
          },
        },
      },
      { $sort: { transactionCount: -1 } },
    ]);

    const result = results.map((r) => ({
      method: r._id,
      transactionCount: r.transactionCount,
      totalAmount: r.totalAmount,
      successRate:
        r.transactionCount > 0
          ? `${((r.successCount / r.transactionCount) * 100).toFixed(1)}%`
          : '0.0%',
    }));

    await this.cache.set(key, result, 600000);
    return result;
  }

  async getSystemHealth() {
    const key = `analytics:system-health`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const start = Date.now();
    let dbStatus = 'operational';
    try {
      const db = this.orderModel.db.db;
      if (db) {
        await db.admin().ping();
      }
    } catch (err) {
      this.logger.error('Database ping failed', err);
      dbStatus = 'degraded';
    }
    const responseTime = Date.now() - start;

    const result = {
      status: dbStatus === 'operational' ? 'healthy' : 'degraded',
      timestamp: new Date(),
      services: {
        api: { status: 'operational', responseTime },
        database: { status: dbStatus },
      },
    };

    await this.cache.set(key, result, 60000);
    return result;
  }

  async getVendorSalesAnalytics(vendorId: string, period: string) {
    const key = `analytics:vendor-sales:${vendorId}:${period}`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const { start, end } = this.getPeriodDates(period);

    const data = await this.orderItemModel.aggregate([
      {
        $match: {
          vendorId: vendorId as any,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$vendorCommission' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
    ]);

    const totals = await this.orderItemModel.aggregate([
      {
        $match: {
          vendorId: vendorId as any,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$vendorCommission' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const result = {
      dailyData: data,
      summary: totals[0] ?? { totalRevenue: 0, totalOrders: 0 },
    };

    await this.cache.set(key, result, 300000);
    return result;
  }

  async getVendorOrdersByStatus(vendorId: string) {
    const key = `analytics:vendor-orders-status:${vendorId}`;
    const hit = await this.cache.get<any>(key);
    if (hit) return hit;

    const items = await this.orderItemModel
      .find({ vendorId: vendorId as any })
      .distinct('orderId');

    const results = await this.orderModel.aggregate([
      { $match: { _id: { $in: items } } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = results.reduce((s, r) => s + r.count, 0);

    const result = results.map((r) => ({
      status: r._id,
      count: r.count,
      percentage: total > 0 ? `${((r.count / total) * 100).toFixed(1)}%` : '0.0%',
    }));

    await this.cache.set(key, result, 300000);
    return result;
  }

  async findVendorByUserId(userId: string): Promise<VendorDocument | null> {
    return this.vendorModel.findOne({ userId: userId as any }).lean().exec() as any;
  }
}
