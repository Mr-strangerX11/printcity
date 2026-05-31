import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { VendorStatus } from '../common/enums';
import slugify from 'slugify';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: any): Promise<any> {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (query.status) filter.status = query.status;

    const vendors = await this.vendorModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email createdAt')
      .lean()
      .exec();

    // Add product count
    const result = await Promise.all(
      vendors.map(async (v) => {
        const productCount = await this.productModel.countDocuments({ vendorId: v._id });
        return { ...v, _count: { products: productCount } };
      }),
    );

    return result;
  }

  async findBySlug(slug: string): Promise<any> {
    const vendor = await this.vendorModel
      .findOne({ storeSlug: slug })
      .populate('userId', 'name avatar')
      .lean()
      .exec();
    if (!vendor) throw new NotFoundException('Vendor not found');

    const products = await this.productModel
      .find({ vendorId: vendor._id, status: 'ACTIVE' })
      .limit(20)
      .lean()
      .exec();

    const productCount = await this.productModel.countDocuments({ vendorId: vendor._id });

    return { ...vendor, products, _count: { products: productCount } };
  }

  async updateStatus(id: string, status: VendorStatus) {
    const vendor = await this.vendorModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!vendor) throw new NotFoundException();
    return vendor;
  }

  async updateCommission(id: string, commissionRate: number) {
    if (commissionRate < 0 || commissionRate > 1) {
      throw new BadRequestException('Commission rate must be between 0 and 1 (0% – 100%)');
    }
    const vendor = await this.vendorModel.findByIdAndUpdate(id, { commissionRate }, { new: true }).exec();
    if (!vendor) throw new NotFoundException();
    return vendor;
  }

  async getProfile(userId: string): Promise<any> {
    const vendor = await this.vendorModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name email avatar')
      .lean()
      .exec();
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const productCount = await this.productModel.countDocuments({ vendorId: vendor._id });
    return { ...vendor, _count: { products: productCount } };
  }

  async updateProfile(userId: string, dto: { storeName?: string; description?: string; logo?: string; banner?: string }) {
    const vendor = await this.vendorModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!vendor) throw new NotFoundException();
    return this.vendorModel.findByIdAndUpdate(vendor._id, dto, { new: true }).exec();
  }

  async updateVendorById(id: string, dto: { storeName?: string; description?: string; logo?: string; banner?: string }) {
    const vendor = await this.vendorModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async createVendor(userId: string, storeName: string) {
    let storeSlug = slugify(storeName, { lower: true, strict: true });
    // Ensure slug uniqueness with a numeric suffix when there's a collision
    const exists = await this.vendorModel.findOne({ storeSlug }).lean().exec();
    if (exists) {
      storeSlug = `${storeSlug}-${Date.now().toString(36)}`;
    }
    try {
      return await this.vendorModel.create({
        userId: new Types.ObjectId(userId),
        storeName,
        storeSlug,
        status: VendorStatus.ACTIVE,
      });
    } catch (err: any) {
      if (err?.code === 11000) throw new ConflictException('A store with a similar name already exists.');
      throw err;
    }
  }
}
