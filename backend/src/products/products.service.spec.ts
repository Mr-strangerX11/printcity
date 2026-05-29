import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { ProductVariant } from './schemas/product-variant.schema';
import { ProductImage } from './schemas/product-image.schema';
import { Vendor } from '../vendors/schemas/vendor.schema';
import { Category } from '../categories/schemas/category.schema';
import { WishlistItem } from '../wishlist/schemas/wishlist-item.schema';
import { User } from '../user/schemas/user.schema';

const MOCK_VENDOR_ID = '507f1f77bcf86cd799439011';
const MOCK_PRODUCT_ID = '507f1f77bcf86cd799439012';
const MOCK_USER_ID = '507f1f77bcf86cd799439013';

function makeModel(overrides?: Partial<any>) {
  return {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn(),
    insertMany: jest.fn().mockResolvedValue([]),
    countDocuments: jest.fn().mockResolvedValue(0),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
    aggregate: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

const MOCK_VENDOR = { _id: MOCK_VENDOR_ID, userId: MOCK_USER_ID, storeName: 'Test Store', commissionRate: 0.1 };
const MOCK_PRODUCT = {
  _id: MOCK_PRODUCT_ID,
  title: 'Test Product',
  slug: 'test-product',
  vendorId: MOCK_VENDOR_ID,
  basePrice: 100,
};

describe('ProductsService — findBySlug', () => {
  let service: ProductsService;
  let productModel: ReturnType<typeof makeModel>;

  beforeEach(async () => {
    productModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(ProductVariant.name), useValue: makeModel() },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Vendor.name), useValue: makeModel() },
        { provide: getModelToken(Category.name), useValue: makeModel() },
        { provide: getModelToken(WishlistItem.name), useValue: makeModel() },
        { provide: getModelToken(User.name), useValue: makeModel() },
        { provide: 'MailService', useValue: {} },
      ],
    })
      .overrideProvider('MailService').useValue({})
      .compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('throws NotFoundException when product slug not found', async () => {
    productModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('returns product with images/variants/vendor/category', async () => {
    productModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_PRODUCT) }) });

    const variantModel = makeModel();
    const imageModel = makeModel();
    variantModel.find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([{ size: 'M' }]) }) });
    imageModel.find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([{ url: 'img.jpg' }]) }) });

    const result = await service.findBySlug('test-product');
    expect(result).toBeDefined();
    expect(result._id).toBe(MOCK_PRODUCT_ID);
  });
});

describe('ProductsService — create', () => {
  let service: ProductsService;
  let vendorModel: ReturnType<typeof makeModel>;
  let productModel: ReturnType<typeof makeModel>;

  beforeEach(async () => {
    vendorModel = makeModel();
    productModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(ProductVariant.name), useValue: makeModel() },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Vendor.name), useValue: vendorModel },
        { provide: getModelToken(Category.name), useValue: makeModel() },
        { provide: getModelToken(WishlistItem.name), useValue: makeModel() },
        { provide: getModelToken(User.name), useValue: makeModel() },
        { provide: 'MailService', useValue: {} },
      ],
    })
      .overrideProvider('MailService').useValue({})
      .compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('throws ForbiddenException when vendor profile not found', async () => {
    vendorModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(
      service.create({ title: 'T', basePrice: 100 } as any, MOCK_USER_ID),
    ).rejects.toThrow(ForbiddenException);
  });

  it('creates product with sanitized description', async () => {
    vendorModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) });
    // slug uniqueness check returns null (no conflict)
    productModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });

    const created = { ...MOCK_PRODUCT, toObject: () => MOCK_PRODUCT };
    productModel.create.mockResolvedValue(created);

    const result = await service.create(
      { title: 'Test', basePrice: 100, description: '<script>xss</script>clean text' } as any,
      MOCK_USER_ID,
    );

    expect(productModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.not.stringContaining('<script>'),
      }),
    );
  });
});

describe('ProductsService — importCsv validation', () => {
  let service: ProductsService;
  let vendorModel: ReturnType<typeof makeModel>;
  let productModel: ReturnType<typeof makeModel>;

  beforeEach(async () => {
    vendorModel = makeModel();
    productModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(ProductVariant.name), useValue: makeModel() },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Vendor.name), useValue: vendorModel },
        { provide: getModelToken(Category.name), useValue: makeModel() },
        { provide: getModelToken(WishlistItem.name), useValue: makeModel() },
        { provide: getModelToken(User.name), useValue: makeModel() },
        { provide: 'MailService', useValue: {} },
      ],
    })
      .overrideProvider('MailService').useValue({})
      .compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('throws BadRequestException for file exceeding 10 MB', async () => {
    const bigBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(service.importCsv(bigBuffer, 'admin')).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when no active vendor exists', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    const csv = Buffer.from('title,basePrice\nTest,100');
    await expect(service.importCsv(csv, 'admin')).rejects.toThrow(BadRequestException);
  });

  it('records error for negative price without throwing', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) }) });
    const csv = Buffer.from('title,basePrice\nTest,-50');
    const result = await service.importCsv(csv, 'admin');
    expect(result.created).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('basePrice');
  });

  it('records error for non-Cloudinary image URL', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) }) });
    const csv = Buffer.from('title,basePrice,imageUrl\nTest,100,http://evil.com/img.jpg');
    const result = await service.importCsv(csv, 'admin');
    expect(result.errors.some(e => e.includes('Cloudinary'))).toBe(true);
  });

  it('records error for missing required fields', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) }) });
    const csv = Buffer.from('title,basePrice\n,');
    const result = await service.importCsv(csv, 'admin');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('records error when title is too short', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) }) });
    const csv = Buffer.from('title,basePrice\nab,100');
    const result = await service.importCsv(csv, 'admin');
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });
});

describe('ProductsService — importCsv — price edge cases', () => {
  let service: ProductsService;
  let vendorModel: ReturnType<typeof makeModel>;

  beforeEach(async () => {
    vendorModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: makeModel() },
        { provide: getModelToken(ProductVariant.name), useValue: makeModel() },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Vendor.name), useValue: vendorModel },
        { provide: getModelToken(Category.name), useValue: makeModel() },
        { provide: getModelToken(WishlistItem.name), useValue: makeModel() },
        { provide: getModelToken(User.name), useValue: makeModel() },
        { provide: 'MailService', useValue: {} },
      ],
    })
      .overrideProvider('MailService').useValue({})
      .compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('records error when price is above 1,000,000', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) }) });
    const csv = Buffer.from('title,basePrice\nExpensive,9999999');
    const result = await service.importCsv(csv, 'admin');
    expect(result.errors.some(e => e.includes('basePrice'))).toBe(true);
    expect(result.created).toBe(0);
  });

  it('records error for NaN price', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) }) });
    const csv = Buffer.from('title,basePrice\nTest Product,not-a-number');
    const result = await service.importCsv(csv, 'admin');
    expect(result.errors.some(e => e.includes('basePrice'))).toBe(true);
  });

  it('records error when tag count exceeds 20', async () => {
    vendorModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(MOCK_VENDOR) }) });
    const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag${i}`).join('|');
    const csv = Buffer.from(`title,basePrice,tags\nTest Product,100,${tooManyTags}`);
    const result = await service.importCsv(csv, 'admin');
    expect(result.errors.some(e => e.includes('tags'))).toBe(true);
  });
});
