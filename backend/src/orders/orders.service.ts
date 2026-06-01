import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { IsEnum } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../common/enums';
import { Role, User, UserDocument } from '../user/schemas/user.schema';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CouponsService } from '../coupons/coupons.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { Vendor, VendorDocument } from '../vendors/schemas/vendor.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { ProductVariant, ProductVariantDocument } from '../products/schemas/product-variant.schema';
import { ProductImage, ProductImageDocument } from '../products/schemas/product-image.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';

/**
 * lean() skips Mongoose virtuals, so _id is present but id is not.
 * Also, populate('userId') keeps the field named `userId` while the frontend
 * Order type expects a `user` field. This helper normalises both issues.
 */
function normalizeOrder(order: any, extra: Record<string, unknown> = {}): any {
  const { _id, userId, ...rest } = order;
  const isPopulated = userId && typeof userId === 'object' && 'name' in userId;
  return {
    id: _id?.toString(),
    ...rest,
    userId: isPopulated ? (userId as any)._id?.toString() : userId?.toString(),
    user: isPopulated ? { name: (userId as any).name, email: (userId as any).email } : undefined,
    ...extra,
  };
}

export class CheckoutDto {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  notes?: string;
  couponCode?: string;
  paymentMethod?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariantDocument>,
    @InjectModel(ProductImage.name) private imageModel: Model<ProductImageDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
    private cartService: CartService,
    private notifications: NotificationsService,
    private mail: MailService,
    private invoicesService: InvoicesService,
    private couponsService: CouponsService,
    private loyaltyService: LoyaltyService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartService.getCart(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    for (const item of cart.items) {
      if (!item.variant) throw new BadRequestException('Invalid cart item');
      if (item.variant.stock < item.qty) {
        throw new BadRequestException(
          `"${item.variant.product?.title ?? 'Product'}" only has ${item.variant.stock} in stock`,
        );
      }
    }

    // Batch-fetch all vendors in one query to avoid N+1
    const vendorIds = [...new Set(
      cart.items
        .map((item: any) => item.variant?.product?.vendorId?.toString())
        .filter((id: unknown): id is string => Boolean(id)),
    )];
    const vendorDocs = await this.vendorModel
      .find({ _id: { $in: vendorIds } })
      .lean()
      .exec();
    const vendorMap = new Map(vendorDocs.map((v: any) => [v._id.toString(), v]));

    const orderItemsData = cart.items.map((item: any) => {
      const vid = item.variant?.product?.vendorId?.toString() ?? '';
      const vendor = vendorMap.get(vid);
      const price = Number(item.variant!.price) * item.qty;
      const vendorCommission = price * (vendor?.commissionRate ?? 0.10);
      const adminAmount = price - vendorCommission;

      return {
        productId: new Types.ObjectId(item.variant!.product!._id.toString()),
        variantId: new Types.ObjectId(item.variant!._id.toString()),
        vendorId: new Types.ObjectId(item.variant!.product!.vendorId.toString()),
        qty: item.qty,
        price,
        vendorCommission,
        adminAmount,
      };
    });

    const subtotal = orderItemsData.reduce((sum: number, i: { price: number }) => sum + i.price, 0);
    const uid = new Types.ObjectId(userId);

    // Validate coupon and compute discount (before order creation so totalAmount is correct)
    let discountAmount = 0;
    let appliedCouponCode: string | undefined;
    if (dto.couponCode) {
      try {
        const couponResult = await this.couponsService.validate(
          { code: dto.couponCode, orderAmount: subtotal },
          userId,
        );
        discountAmount = couponResult.discountAmount;
        appliedCouponCode = couponResult.coupon.code;
      } catch {
        // Invalid coupon — proceed without discount
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    const { couponCode: _coupon, paymentMethod: _pm, ...shippingDto } = dto as any;
    const order = await this.orderModel.create({
      userId: uid,
      totalAmount,
      paymentStatus: PaymentStatus.UNPAID,
      orderStatus: OrderStatus.PENDING,
      ...shippingDto,
      ...(appliedCouponCode ? { couponCode: appliedCouponCode, discountAmount } : {}),
    });

    await this.orderItemModel.insertMany(
      orderItemsData.map((item: typeof orderItemsData[0]) => ({ ...item, orderId: order._id })),
    );

    // Stock is decremented only when payment is confirmed (see confirmPayment)
    await this.cartService.clearCart(userId);

    // Record coupon usage — awaited so double-use is prevented atomically
    if (appliedCouponCode) {
      await this.couponsService.applyCoupon(appliedCouponCode, userId, order._id.toString(), subtotal);
    }

    await this.notifications.create(
      userId,
      'ORDER_PLACED',
      'Order Placed',
      `Your order #${order._id.toString().slice(-8).toUpperCase()} has been placed.`,
    );

    this.sendOrderEmails(userId, order.toObject(), cart.items, orderItemsData).catch((err) => {
      this.logger.warn(`Order confirmation email failed for order ${order._id}: ${err?.message}`);
    });

    const orderItems = await this.orderItemModel.find({ orderId: order._id }).lean().exec();
    return { ...order.toObject(), items: orderItems };
  }

  private async sendOrderEmails(userId: string, order: any, cartItems: any[], itemsData: any[]) {
    // Batch-fetch all vendors in one query to avoid N+1 in email sending
    const emailVendorIds = [...new Set(
      cartItems
        .map((item) => item.variant?.product?.vendorId?.toString())
        .filter((id): id is string => Boolean(id)),
    )];
    const emailVendorDocs = await this.vendorModel
      .find({ _id: { $in: emailVendorIds } })
      .lean()
      .exec();
    const emailVendorMap = new Map(emailVendorDocs.map((v) => [v._id.toString(), v]));

    const enrichedItems = cartItems.map((cartItem, i) => {
      const data = itemsData[i];
      const evid = cartItem.variant?.product?.vendorId?.toString() ?? '';
      const vendor = emailVendorMap.get(evid);
      return {
        productTitle: cartItem.variant?.product?.title ?? 'Product',
        variantLabel: [cartItem.variant?.size, cartItem.variant?.color].filter(Boolean).join(' · '),
        storeName: vendor?.storeName ?? '—',
        vendorId: data.vendorId.toString(),
        vendorUserId: vendor?.userId?.toString(),
        qty: cartItem.qty,
        price: data.price,
        vendorCommission: data.vendorCommission,
        adminAmount: data.adminAmount,
      };
    });

    const customer = await this.userModel.findById(userId).lean().exec();

    if (customer?.email) {
      this.mail.sendCustomerOrderConfirmation(customer.email, customer.name, order, enrichedItems).catch(() => null);
    }

    const admins = await this.userModel.find({ role: Role.ADMIN, isActive: true }).lean().exec();
    for (const admin of admins) {
      if (admin.email) {
        this.mail.sendAdminOrderNotification(admin.email, order, customer ?? {}, enrichedItems).catch(() => null);
      }
    }

    const vendorGroups = new Map<string, { items: typeof enrichedItems; vendorUserId?: string; storeName: string }>();
    for (const item of enrichedItems) {
      if (!vendorGroups.has(item.vendorId)) {
        vendorGroups.set(item.vendorId, { items: [], vendorUserId: item.vendorUserId, storeName: item.storeName });
      }
      vendorGroups.get(item.vendorId)!.items.push(item);
    }

    for (const [, group] of vendorGroups) {
      if (!group.vendorUserId) continue;
      const vendorUser = await this.userModel.findById(group.vendorUserId).lean().exec();
      if (vendorUser?.email) {
        const totalCommission = group.items.reduce((s, i) => s + i.vendorCommission, 0);
        this.mail.sendVendorOrderNotification(
          vendorUser.email,
          group.storeName,
          order._id.toString(),
          group.items,
          totalCommission,
        ).catch(() => null);
      }
    }
  }

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, pendingOrders, deliveredOrders, revenueResult, avgResult, byStatusResult, monthlyCount] =
      await Promise.all([
        this.orderModel.countDocuments(),
        this.orderModel.countDocuments({ orderStatus: OrderStatus.PENDING }),
        this.orderModel.countDocuments({ orderStatus: OrderStatus.DELIVERED }),
        this.orderModel.aggregate([
          { $match: { paymentStatus: PaymentStatus.PAID } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        this.orderModel.aggregate([
          { $group: { _id: null, avg: { $avg: '$totalAmount' } } },
        ]),
        this.orderModel.aggregate([
          { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]),
        this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ]);

    const byStatus: Record<string, number> = {};
    for (const { _id, count } of byStatusResult) {
      if (_id) byStatus[_id] = count;
    }

    return {
      totalOrders,
      total: totalOrders,
      pendingOrders,
      pending: pendingOrders,
      deliveredOrders,
      delivered: deliveredOrders,
      totalRevenue: Number(revenueResult[0]?.total ?? 0),
      avgOrderValue: Math.round(Number(avgResult[0]?.avg ?? 0)),
      byStatus,
      newThisMonth: monthlyCount,
    };
  }

  async findAll(userId: string, role: Role, query: any): Promise<any> {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (role === Role.CUSTOMER) filter.userId = new Types.ObjectId(userId);
    if (query.status) filter.orderStatus = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('userId', 'name email')
        .lean().exec(),
      this.orderModel.countDocuments(filter),
    ]);

    // Batch-fetch order items and payments with $in — eliminates N+1 (2N queries → 2 queries)
    const orderIds = orders.map(o => o._id);
    const [allItems, allPayments] = await Promise.all([
      this.orderItemModel.find({ orderId: { $in: orderIds } }).lean().exec(),
      this.paymentModel.find({ orderId: { $in: orderIds } }).lean().exec(),
    ]);

    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const key = item.orderId.toString();
      if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
      itemsByOrder.get(key)!.push(item);
    }
    const paymentByOrder = new Map<string, typeof allPayments[0]>();
    for (const p of allPayments) {
      paymentByOrder.set(p.orderId.toString(), p);
    }

    const items = orders.map(order => normalizeOrder(order, {
      items: itemsByOrder.get(order._id.toString()) ?? [],
      payment: paymentByOrder.get(order._id.toString()) ?? null,
    }));

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, userId: string, role: Role): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'name email phone')
      .lean()
      .exec();
    if (!order) throw new NotFoundException('Order not found');

    // Access check: compare raw userId string (before normalizeOrder overwrites userId)
    const rawUserId = (order.userId as any)?._id?.toString() ?? order.userId?.toString();
    if (role === Role.CUSTOMER && rawUserId !== userId) throw new ForbiddenException();

    const [orderItems, payment] = await Promise.all([
      this.orderItemModel.find({ orderId: new Types.ObjectId(id) }).lean().exec(),
      this.paymentModel.findOne({ orderId: new Types.ObjectId(id) }).lean().exec(),
    ]);

    return normalizeOrder(order, { items: orderItems, payment });
  }

  private static readonly VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PRINTING, OrderStatus.CANCELLED],
    [OrderStatus.PRINTING]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
    [OrderStatus.PACKED]: [OrderStatus.SHIPPED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
  };

  async cancelOrder(id: string, userId: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId.toString() !== userId) throw new ForbiddenException();
    const cancellable: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellable.includes(order.orderStatus)) {
      throw new BadRequestException(`Cannot cancel an order that is ${order.orderStatus.toLowerCase()}`);
    }
    order.orderStatus = OrderStatus.CANCELLED;
    const updated = await order.save();

    // Restore stock if payment was already confirmed (stock was decremented at payment time)
    if (order.paymentStatus === PaymentStatus.PAID) {
      const items = await this.orderItemModel.find({ orderId: new Types.ObjectId(id) }).lean().exec();
      await Promise.all(
        items.map(item =>
          this.variantModel.findByIdAndUpdate(item.variantId, { $inc: { stock: item.qty } }).exec(),
        ),
      );
    }

    await this.notifications.create(userId, 'ORDER_STATUS', 'Order Cancelled', `Your order #${id.slice(-8).toUpperCase()} has been cancelled.`);
    return updated;
  }

  async updateStatus(id: string, status: OrderStatus, adminId: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    const allowed = OrdersService.VALID_TRANSITIONS[order.orderStatus] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${order.orderStatus} to ${status}`);
    }

    order.orderStatus = status;
    const updated = await order.save();

    if (status === OrderStatus.CONFIRMED) {
      this.invoicesService.generateForOrder(id).catch(() => null);
    }

    if (status === OrderStatus.DELIVERED && order.paymentStatus === PaymentStatus.PAID) {
      await this.accrueCommissions(id);

      // Award 1 loyalty point per rupee spent (non-critical, don't block)
      this.loyaltyService.awardPoints(
        order.userId.toString(),
        Math.floor(Number(order.totalAmount)),
        'PURCHASE',
        `Points for Order #${id.slice(-8).toUpperCase()}`,
        id,
      ).catch(() => {});
    }

    await this.notifications.create(
      order.userId.toString(),
      'ORDER_STATUS',
      'Order Update',
      `Your order status has been updated to ${status}.`,
    );

    return updated;
  }

  async confirmPayment(orderId: string) {
    const before = await this.orderModel.findById(orderId).lean().exec();
    if (!before) return null;

    // Already paid — idempotent, skip
    if (before.paymentStatus === PaymentStatus.PAID) {
      return this.orderModel.findById(orderId).exec();
    }

    const session = await this.connection.startSession();
    let order: any = null;
    try {
      await session.withTransaction(async () => {
        const update: any = { paymentStatus: PaymentStatus.PAID };
        if (before.orderStatus === OrderStatus.PENDING) {
          update.orderStatus = OrderStatus.CONFIRMED;
        }

        order = await this.orderModel.findByIdAndUpdate(orderId, update, { new: true, session }).exec();

        // Atomic stock decrement inside transaction — only decrements if stock >= qty
        const items = await this.orderItemModel.find({ orderId: new Types.ObjectId(orderId) }, null, { session }).lean().exec();
        const stockResults = await Promise.all(
          items.map(item =>
            this.variantModel.findOneAndUpdate(
              { _id: item.variantId, stock: { $gte: item.qty } },
              { $inc: { stock: -item.qty } },
              { new: true, session },
            ).exec(),
          ),
        );

        const outOfStockItems = items.filter((_, i) => !stockResults[i]);
        if (outOfStockItems.length > 0) {
          // Log shortage but don't abort — payment already received; fulfillment team handles manually
          this.logger.error(
            `STOCK_SHORTAGE on confirmPayment: order=${orderId} variants=${outOfStockItems.map(i => i.variantId).join(',')}`,
          );
        }
      });
    } finally {
      session.endSession();
    }

    // Accrue commissions if already DELIVERED (pre-paid scenarios) or now confirmed
    if (order && (before.orderStatus === OrderStatus.DELIVERED || order.orderStatus === OrderStatus.DELIVERED)) {
      await this.accrueCommissions(orderId);
    }

    return order;
  }

  private async accrueCommissions(orderId: string) {
    const items = await this.orderItemModel.find({ orderId: new Types.ObjectId(orderId) }).lean().exec();
    for (const item of items) {
      await this.vendorModel.findByIdAndUpdate(item.vendorId, {
        $inc: { totalEarnings: item.vendorCommission },
      });
    }
  }
}
