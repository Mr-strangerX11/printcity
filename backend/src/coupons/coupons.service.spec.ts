import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { getModelToken } from '@nestjs/mongoose';
import { Coupon } from './schemas/coupon.schema';
import { CouponUsage } from './schemas/coupon-usage.schema';
import { Order } from '../orders/schemas/order.schema';

const makeCouponModel = (overrides?: Partial<any>) => ({
  findOne: jest.fn().mockReturnThis(),
  findOneAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(0),
  create: jest.fn(),
  exec: jest.fn(),
  ...overrides,
});

describe('CouponsService — atomic usage', () => {
  let service: CouponsService;
  let couponModel: ReturnType<typeof makeCouponModel>;
  let couponUsageModel: any;
  let orderModel: any;

  beforeEach(async () => {
    couponModel = makeCouponModel();
    couponUsageModel = { create: jest.fn(), countDocuments: jest.fn().mockResolvedValue(0) };
    orderModel = { findByIdAndUpdate: jest.fn().mockReturnThis(), exec: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getModelToken(Coupon.name), useValue: couponModel },
        { provide: getModelToken(CouponUsage.name), useValue: couponUsageModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('should throw when atomic increment returns null (limit reached concurrently)', async () => {
    const mockId = '507f1f77bcf86cd799439011';
    const mockCoupon = {
      _id: mockId,
      code: 'SAVE10',
      isActive: true,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: null,
      usageLimit: 10,
      usageCount: 9,
      perUserLimit: 1,
      minOrderAmount: null,
      type: 'PERCENTAGE',
      value: 10,
      maxDiscount: null,
    };

    // validate() passes — coupon looks valid at read time
    couponModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCoupon) });
    couponUsageModel.countDocuments.mockResolvedValue(0); // user hasn't used it

    // But atomic findOneAndUpdate returns null — someone else claimed the last slot
    couponModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const userId = '507f1f77bcf86cd799439012';
    const orderId = '507f1f77bcf86cd799439013';
    await expect(
      service.applyCoupon('SAVE10', userId, orderId, 500),
    ).rejects.toThrow(BadRequestException);
  });

  it('should succeed when atomic increment returns the updated document', async () => {
    const mockId = '507f1f77bcf86cd799439011';
    const mockCoupon = {
      _id: mockId,
      code: 'SAVE10',
      isActive: true,
      startsAt: new Date(Date.now() - 1000),
      expiresAt: null,
      usageLimit: 10,
      usageCount: 5,
      perUserLimit: 1,
      minOrderAmount: null,
      type: 'PERCENTAGE',
      value: 10,
      maxDiscount: null,
    };

    const userId = '507f1f77bcf86cd799439012';
    const orderId = '507f1f77bcf86cd799439013';

    couponModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCoupon) });
    couponUsageModel.countDocuments.mockResolvedValue(0);

    // Atomic update succeeds
    couponModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...mockCoupon, usageCount: 6 }),
    });
    couponUsageModel.create.mockResolvedValue({});
    orderModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

    const result = await service.applyCoupon('SAVE10', userId, orderId, 500);
    expect(result.discountAmount).toBeGreaterThan(0);
  });
});
