import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { CartItem } from './schemas/cart-item.schema';
import { ProductVariant } from '../products/schemas/product-variant.schema';
import { Product } from '../products/schemas/product.schema';
import { ProductImage } from '../products/schemas/product-image.schema';
import { Vendor } from '../vendors/schemas/vendor.schema';

const MOCK_CART_ID = '507f1f77bcf86cd799439011';
const MOCK_USER_ID = '507f1f77bcf86cd799439012';
const MOCK_VARIANT_ID = '507f1f77bcf86cd799439013';
const MOCK_ITEM_ID = '507f1f77bcf86cd799439014';

function makeModel(overrides?: Partial<any>) {
  return {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({}),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
    populate: jest.fn().mockReturnThis(),
    save: jest.fn(),
    ...overrides,
  };
}

const MOCK_CART = {
  _id: { toString: () => MOCK_CART_ID },
  userId: MOCK_USER_ID,
  toObject: () => ({ _id: MOCK_CART_ID, userId: MOCK_USER_ID }),
};

describe('CartService — addItem', () => {
  let service: CartService;
  let cartModel: ReturnType<typeof makeModel>;
  let cartItemModel: ReturnType<typeof makeModel>;
  let variantModel: ReturnType<typeof makeModel>;
  let productModel: ReturnType<typeof makeModel>;
  let imageModel: ReturnType<typeof makeModel>;
  let vendorModel: ReturnType<typeof makeModel>;

  beforeEach(async () => {
    cartModel = makeModel();
    cartItemModel = makeModel();
    variantModel = makeModel();
    productModel = makeModel();
    imageModel = makeModel();
    vendorModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: cartModel },
        { provide: getModelToken(CartItem.name), useValue: cartItemModel },
        { provide: getModelToken(ProductVariant.name), useValue: variantModel },
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(ProductImage.name), useValue: imageModel },
        { provide: getModelToken(Vendor.name), useValue: vendorModel },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('throws NotFoundException when variant does not exist', async () => {
    variantModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.addItem(MOCK_USER_ID, MOCK_VARIANT_ID, 1)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when qty exceeds stock', async () => {
    const variant = { _id: MOCK_VARIANT_ID, stock: 2, productId: 'pid' };
    variantModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(variant) }) });
    await expect(service.addItem(MOCK_USER_ID, MOCK_VARIANT_ID, 5)).rejects.toThrow(BadRequestException);
  });

  it('increments qty for existing cart item', async () => {
    const variant = { _id: MOCK_VARIANT_ID, stock: 10, productId: 'pid' };
    variantModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(variant) }) });
    cartModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(MOCK_CART) });

    const existingItem = { qty: 2, save: jest.fn().mockResolvedValue({}) };
    cartItemModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingItem) });

    // getCart side-effects — items and subtotal
    cartItemModel.find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([]) }) });

    await service.addItem(MOCK_USER_ID, MOCK_VARIANT_ID, 3);
    expect(existingItem.qty).toBe(5);
    expect(existingItem.save).toHaveBeenCalled();
  });

  it('throws BadRequestException when new total qty exceeds stock', async () => {
    const variant = { _id: MOCK_VARIANT_ID, stock: 4, productId: 'pid' };
    variantModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(variant) }) });
    cartModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(MOCK_CART) });

    const existingItem = { qty: 3, save: jest.fn() };
    cartItemModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingItem) });

    await expect(service.addItem(MOCK_USER_ID, MOCK_VARIANT_ID, 2)).rejects.toThrow(BadRequestException);
  });
});

describe('CartService — removeItem', () => {
  let service: CartService;
  let cartModel: ReturnType<typeof makeModel>;
  let cartItemModel: ReturnType<typeof makeModel>;

  beforeEach(async () => {
    cartModel = makeModel();
    cartItemModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: cartModel },
        { provide: getModelToken(CartItem.name), useValue: cartItemModel },
        { provide: getModelToken(ProductVariant.name), useValue: makeModel() },
        { provide: getModelToken(Product.name), useValue: makeModel() },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Vendor.name), useValue: makeModel() },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('calls deleteMany with correct cartId and itemId', async () => {
    cartModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(MOCK_CART) });
    cartItemModel.find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([]) }) });

    await service.removeItem(MOCK_USER_ID, MOCK_ITEM_ID);

    expect(cartItemModel.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
      _id: expect.anything(),
      cartId: expect.anything(),
    }));
  });
});

describe('CartService — clearCart', () => {
  let service: CartService;
  let cartModel: ReturnType<typeof makeModel>;
  let cartItemModel: ReturnType<typeof makeModel>;

  beforeEach(async () => {
    cartModel = makeModel();
    cartItemModel = makeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: cartModel },
        { provide: getModelToken(CartItem.name), useValue: cartItemModel },
        { provide: getModelToken(ProductVariant.name), useValue: makeModel() },
        { provide: getModelToken(Product.name), useValue: makeModel() },
        { provide: getModelToken(ProductImage.name), useValue: makeModel() },
        { provide: getModelToken(Vendor.name), useValue: makeModel() },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('returns {cleared:true} and deletes all items', async () => {
    const cart = { _id: MOCK_CART_ID };
    cartModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(cart) }) });

    const result = await service.clearCart(MOCK_USER_ID);
    expect(result).toEqual({ cleared: true });
    expect(cartItemModel.deleteMany).toHaveBeenCalledWith({ cartId: MOCK_CART_ID });
  });

  it('returns {cleared:true} when cart does not exist', async () => {
    cartModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    const result = await service.clearCart(MOCK_USER_ID);
    expect(result).toEqual({ cleared: true });
  });
});
