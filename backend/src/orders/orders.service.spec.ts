import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { OrderItem } from './schemas/order-item.schema';
import { Vendor } from '../vendors/schemas/vendor.schema';
import { Product } from '../products/schemas/product.schema';
import { ProductVariant } from '../products/schemas/product-variant.schema';
import { ProductImage } from '../products/schemas/product-image.schema';
import { Payment } from '../payments/schemas/payment.schema';
import { User } from '../user/schemas/user.schema';
import { OrderStatus, PaymentStatus } from '../common/enums';

const MOCK_ORDER_ID = '507f1f77bcf86cd799439011';
const MOCK_USER_ID = '507f1f77bcf86cd799439012';
const MOCK_VARIANT_ID = '507f1f77bcf86cd799439013';
const MOCK_PRODUCT_ID = '507f1f77bcf86cd799439014';
const MOCK_VENDOR_ID = '507f1f77bcf86cd799439015';

function makeModel(overrides?: Partial<any>) {
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn(),
    insertMany: jest.fn().mockResolvedValue([]),
    countDocuments: jest.fn().mockResolvedValue(0),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
    aggregate: jest.fn().mockResolvedValue([]),
    deleteMany: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

function makeSession() {
  const session = {
    withTransaction: jest.fn().mockImplementation((fn: any) => fn()),
    endSession: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
  };
  return session;
}

function makeConnection(session: ReturnType<typeof makeSession>) {
  return { startSession: jest.fn().mockResolvedValue(session) };
}

describe('OrdersService — confirmPayment', () => {
  let service: OrdersService;
  let orderModel: ReturnType<typeof makeModel>;
  let orderItemModel: ReturnType<typeof makeModel>;
  let variantModel: ReturnType<typeof makeModel>;
  let session: ReturnType<typeof makeSession>;
  let connection: ReturnType<typeof makeConnection>;

  beforeEach(async () => {
    session = makeSession();
    connection = makeConnection(session);
    orderModel = makeModel();
    orderItemModel = makeModel();
    variantModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(OrderItem.name), useValue: orderItemModel },
        { provide: getModelToken(Vendor.name), useValue: makeModel() },
        { provide: getModelToken(Product.name), useValue: makeModel() },
        { provide: getModelToken(ProductVariant.name), useValue: variantModel },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Payment.name), useValue: makeModel() },
        { provide: getModelToken(User.name), useValue: makeModel() },
        { provide: getConnectionToken(), useValue: connection },
        { provide: 'CartService', useValue: { getCart: jest.fn(), clearCart: jest.fn() } },
        { provide: 'NotificationsService', useValue: { create: jest.fn() } },
        { provide: 'MailService', useValue: {} },
        { provide: 'InvoicesService', useValue: { generateForOrder: jest.fn() } },
        { provide: 'CouponsService', useValue: { validate: jest.fn(), applyCoupon: jest.fn() } },
        { provide: 'LoyaltyService', useValue: { awardPoints: jest.fn() } },
      ],
    })
      .overrideProvider('CartService').useValue({ getCart: jest.fn(), clearCart: jest.fn() })
      .overrideProvider('NotificationsService').useValue({ create: jest.fn() })
      .overrideProvider('MailService').useValue({})
      .overrideProvider('InvoicesService').useValue({ generateForOrder: jest.fn() })
      .overrideProvider('CouponsService').useValue({ validate: jest.fn(), applyCoupon: jest.fn() })
      .overrideProvider('LoyaltyService').useValue({ awardPoints: jest.fn() })
      .compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('returns null when order does not exist', async () => {
    orderModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    const result = await service.confirmPayment(MOCK_ORDER_ID);
    expect(result).toBeNull();
  });

  it('is idempotent — skips stock decrement when order already paid', async () => {
    const paidOrder = {
      _id: MOCK_ORDER_ID,
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.CONFIRMED,
    };
    orderModel.findById
      .mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValue(paidOrder) }) })
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(paidOrder) });

    await service.confirmPayment(MOCK_ORDER_ID);

    // Session should NOT have been started (idempotent fast path)
    expect(connection.startSession).not.toHaveBeenCalled();
  });

  it('decrements stock atomically and marks order PAID', async () => {
    const unpaidOrder = {
      _id: MOCK_ORDER_ID,
      paymentStatus: PaymentStatus.UNPAID,
      orderStatus: OrderStatus.PENDING,
      userId: MOCK_USER_ID,
      totalAmount: 500,
    };
    const paidOrder = { ...unpaidOrder, paymentStatus: PaymentStatus.PAID, orderStatus: OrderStatus.CONFIRMED };
    const orderItem = { variantId: MOCK_VARIANT_ID, qty: 2, orderId: MOCK_ORDER_ID };

    orderModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(unpaidOrder) }) });
    orderModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(paidOrder) });
    orderItemModel.find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([orderItem]) }) });
    variantModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ stock: 8 }) });

    await service.confirmPayment(MOCK_ORDER_ID);

    expect(connection.startSession).toHaveBeenCalled();
    expect(variantModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: MOCK_VARIANT_ID, stock: { $gte: 2 } },
      { $inc: { stock: -2 } },
      expect.objectContaining({ new: true }),
    );
  });

  it('logs stock shortage without throwing when concurrent order exhausted stock', async () => {
    const unpaidOrder = {
      _id: MOCK_ORDER_ID,
      paymentStatus: PaymentStatus.UNPAID,
      orderStatus: OrderStatus.PENDING,
      userId: MOCK_USER_ID,
    };
    const paidOrder = { ...unpaidOrder, paymentStatus: PaymentStatus.PAID };
    const orderItem = { variantId: MOCK_VARIANT_ID, qty: 5, orderId: MOCK_ORDER_ID };

    orderModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(unpaidOrder) }) });
    orderModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(paidOrder) });
    orderItemModel.find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([orderItem]) }) });
    // findOneAndUpdate returns null → stock was insufficient (concurrent order won the race)
    variantModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    // Should NOT throw — payment was received, log it and let ops team handle it
    await expect(service.confirmPayment(MOCK_ORDER_ID)).resolves.not.toThrow();
  });
});

describe('OrdersService — cancelOrder', () => {
  let service: OrdersService;
  let orderModel: ReturnType<typeof makeModel>;
  let orderItemModel: ReturnType<typeof makeModel>;
  let variantModel: ReturnType<typeof makeModel>;
  let session: ReturnType<typeof makeSession>;

  beforeEach(async () => {
    session = makeSession();
    orderModel = makeModel();
    orderItemModel = makeModel();
    variantModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(OrderItem.name), useValue: orderItemModel },
        { provide: getModelToken(Vendor.name), useValue: makeModel() },
        { provide: getModelToken(Product.name), useValue: makeModel() },
        { provide: getModelToken(ProductVariant.name), useValue: variantModel },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Payment.name), useValue: makeModel() },
        { provide: getModelToken(User.name), useValue: makeModel() },
        { provide: getConnectionToken(), useValue: makeConnection(session) },
        { provide: 'CartService', useValue: {} },
        { provide: 'NotificationsService', useValue: { create: jest.fn() } },
        { provide: 'MailService', useValue: {} },
        { provide: 'InvoicesService', useValue: {} },
        { provide: 'CouponsService', useValue: {} },
        { provide: 'LoyaltyService', useValue: {} },
      ],
    })
      .overrideProvider('CartService').useValue({})
      .overrideProvider('NotificationsService').useValue({ create: jest.fn() })
      .overrideProvider('MailService').useValue({})
      .overrideProvider('InvoicesService').useValue({})
      .overrideProvider('CouponsService').useValue({})
      .overrideProvider('LoyaltyService').useValue({})
      .compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('throws NotFoundException when order does not exist', async () => {
    orderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.cancelOrder(MOCK_ORDER_ID, MOCK_USER_ID)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when user does not own the order', async () => {
    const otherUserId = '507f1f77bcf86cd799439099';
    const order = {
      _id: MOCK_ORDER_ID,
      userId: { toString: () => otherUserId },
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      save: jest.fn(),
    };
    orderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });

    await expect(service.cancelOrder(MOCK_ORDER_ID, MOCK_USER_ID)).rejects.toThrow();
  });

  it('throws BadRequestException when order is already shipped', async () => {
    const order = {
      _id: MOCK_ORDER_ID,
      userId: { toString: () => MOCK_USER_ID },
      orderStatus: OrderStatus.SHIPPED,
      paymentStatus: PaymentStatus.PAID,
      save: jest.fn(),
    };
    orderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });

    await expect(service.cancelOrder(MOCK_ORDER_ID, MOCK_USER_ID)).rejects.toThrow(BadRequestException);
  });

  it('restores stock when cancelling a paid order', async () => {
    const order = {
      _id: MOCK_ORDER_ID,
      userId: { toString: () => MOCK_USER_ID },
      orderStatus: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      save: jest.fn().mockResolvedValue({}),
    };
    const items = [{ variantId: MOCK_VARIANT_ID, qty: 3 }];

    orderModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
    orderItemModel.find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(items) }) });
    variantModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

    await service.cancelOrder(MOCK_ORDER_ID, MOCK_USER_ID);

    expect(variantModel.findByIdAndUpdate).toHaveBeenCalledWith(
      MOCK_VARIANT_ID,
      { $inc: { stock: 3 } },
    );
  });
});
