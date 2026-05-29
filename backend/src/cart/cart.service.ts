import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CartItem, CartItemDocument } from './schemas/cart-item.schema';
import { ProductVariant, ProductVariantDocument } from '../products/schemas/product-variant.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { ProductImage, ProductImageDocument } from '../products/schemas/product-image.schema';
import { Vendor, VendorDocument } from '../vendors/schemas/vendor.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItemDocument>,
    @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariantDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductImage.name) private imageModel: Model<ProductImageDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
  ) {}

  private async getOrCreateCart(userId: string): Promise<CartDocument> {
    const uid = new Types.ObjectId(userId);
    let cart = await this.cartModel.findOne({ userId: uid }).exec();
    if (!cart) {
      cart = await this.cartModel.create({ userId: uid });
    }
    return cart;
  }

  private async populateCartItems(cartId: Types.ObjectId | string) {
    const items = await this.cartItemModel.find({ cartId: new Types.ObjectId(cartId.toString()) }).lean().exec();
    if (!items.length) return [];

    // Batch fetch all variants in one query (eliminates N queries)
    const variantIds = items.map(i => i.productVariantId);
    const variants = await this.variantModel.find({ _id: { $in: variantIds } }).lean().exec();
    const variantMap = new Map(variants.map(v => [v._id.toString(), v]));

    // Batch fetch all products
    const productIds = variants.map(v => v.productId).filter(Boolean);
    const [products, primaryImages] = await Promise.all([
      this.productModel.find({ _id: { $in: productIds } }).lean().exec(),
      this.imageModel.find({ productId: { $in: productIds }, isPrimary: true }).lean().exec(),
    ]);
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    const imageMap = new Map(primaryImages.map(img => [img.productId.toString(), img]));

    // Batch fetch all vendors
    const vendorIds = [...new Set(products.map((p: any) => p.vendorId?.toString()).filter(Boolean))];
    const vendors = await this.vendorModel.find({ _id: { $in: vendorIds } }, { storeName: 1 }).lean().exec();
    const vendorMap = new Map(vendors.map(v => [v._id.toString(), v]));

    return items.map(item => {
      const variant = variantMap.get(item.productVariantId.toString());
      if (!variant) return { ...item, variant: null };

      const product = productMap.get((variant as any).productId?.toString());
      const primaryImage = product ? imageMap.get((product as any)._id.toString()) : null;
      const vendor = product ? vendorMap.get((product as any).vendorId?.toString()) : null;

      const enrichedProduct = product
        ? { ...product, images: primaryImage ? [primaryImage] : [], vendor }
        : null;
      return { ...item, variant: { ...variant, product: enrichedProduct } };
    });
  }

  async getCart(userId: string): Promise<any> {
    const cart = await this.getOrCreateCart(userId);
    const items = await this.populateCartItems(cart._id as Types.ObjectId);
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.variant ? Number(item.variant.price) * item.qty : 0);
    }, 0);
    return { ...cart, items, subtotal };
  }

  async addItem(userId: string, variantId: string, qty: number) {
    const variant = await this.variantModel.findById(variantId).lean().exec();
    if (!variant) throw new NotFoundException('Product variant not found');
    if (variant.stock < qty) throw new BadRequestException(`Only ${variant.stock} units available`);

    const cart = await this.getOrCreateCart(userId);
    const cartId = new Types.ObjectId(cart._id.toString());

    const existing = await this.cartItemModel.findOne({
      cartId,
      productVariantId: new Types.ObjectId(variantId),
    }).exec();

    if (existing) {
      const newQty = existing.qty + qty;
      if (variant.stock < newQty) throw new BadRequestException(`Only ${variant.stock} units available`);
      existing.qty = newQty;
      await existing.save();
    } else {
      await this.cartItemModel.create({
        cartId,
        productVariantId: new Types.ObjectId(variantId),
        qty,
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, qty: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemModel
      .findOne({ _id: new Types.ObjectId(itemId), cartId: new Types.ObjectId(cart._id.toString()) })
      .populate('productVariantId')
      .exec();

    if (!item) throw new NotFoundException('Cart item not found');
    if (qty <= 0) return this.removeItem(userId, itemId);

    const variant = await this.variantModel.findById(item.productVariantId).lean().exec();
    if (variant && variant.stock < qty) throw new BadRequestException('Insufficient stock');

    await this.cartItemModel.findByIdAndUpdate(itemId, { qty });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemModel.deleteMany({
      _id: new Types.ObjectId(itemId),
      cartId: new Types.ObjectId(cart._id.toString()),
    });
    return this.getCart(userId);
  }

  async addCustomItem(userId: string, variantId: string, qty: number, customization: any) {
    const variant = await this.variantModel.findById(variantId).lean().exec();
    if (!variant) throw new NotFoundException('Product variant not found');

    const cart = await this.getOrCreateCart(userId);
    const cartId = new Types.ObjectId(cart._id.toString());

    // Custom items always create a new entry (isCustom: true bypasses the unique dedup index)
    await this.cartItemModel.create({
      cartId,
      productVariantId: new Types.ObjectId(variantId),
      qty,
      isCustom: true,
      customization,
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).lean().exec();
    if (cart) await this.cartItemModel.deleteMany({ cartId: cart._id });
    return { cleared: true };
  }
}
