import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatus } from '../common/enums';
import { Role } from '../user/schemas/user.schema';
import slugify from 'slugify';
import { parse } from 'csv-parse/sync';
import { sanitizeRichText } from '../common/utils/sanitize';
import { Product, ProductDocument } from './schemas/product.schema';
import { ProductVariant, ProductVariantDocument } from './schemas/product-variant.schema';
import { ProductImage, ProductImageDocument } from './schemas/product-image.schema';
import { Vendor, VendorDocument } from '../vendors/schemas/vendor.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { WishlistItem, WishlistItemDocument } from '../wishlist/schemas/wishlist-item.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { MailService } from '../mail/mail.service';

interface QueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  status?: ProductStatus;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariantDocument>,
    @InjectModel(ProductImage.name) private imageModel: Model<ProductImageDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(WishlistItem.name) private wishlistItemModel: Model<WishlistItemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mail: MailService,
  ) {}

  async findAll(query: QueryParams, userId?: string, userRole?: Role): Promise<any> {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (!userId || userRole === Role.CUSTOMER) {
      filter.status = ProductStatus.ACTIVE;
    } else if (userRole === Role.VENDOR) {
      const vendor = await this.vendorModel.findOne({ userId: new Types.ObjectId(userId) }).lean().exec();
      if (vendor) filter.vendorId = vendor._id;
    }

    if (query.status && userRole === Role.ADMIN) filter.status = query.status;

    if (query.category) {
      const cat = await this.categoryModel.findOne({ slug: query.category }).lean().exec();
      if (cat) filter.categoryId = cat._id;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { tags: query.search },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      filter.basePrice = {};
      if (query.minPrice) filter.basePrice.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.basePrice.$lte = Number(query.maxPrice);
    }

    let sortObj: any = { createdAt: -1 };
    switch (query.sort) {
      case 'price_asc': sortObj = { basePrice: 1 }; break;
      case 'price_desc': sortObj = { basePrice: -1 }; break;
      case 'oldest': sortObj = { createdAt: 1 }; break;
    }

    const [items, total] = await Promise.all([
      this.productModel.find(filter).sort(sortObj).skip(skip).limit(limit).lean().exec(),
      this.productModel.countDocuments(filter),
    ]);

    // Batch-fetch all related data — 4 queries total instead of N*4
    const productIds = items.map(p => p._id);
    const vendorIds = [...new Set(items.map(p => (p as any).vendorId?.toString()).filter(Boolean))];
    const categoryIds = [...new Set(items.map(p => (p as any).categoryId?.toString()).filter(Boolean))];

    const [primaryImages, allVariants, vendors, categories] = await Promise.all([
      this.imageModel.find({ productId: { $in: productIds }, isPrimary: true }).lean().exec(),
      this.variantModel.find({ productId: { $in: productIds } }, { price: 1, color: 1, size: 1, productId: 1 }).lean().exec(),
      this.vendorModel.find({ _id: { $in: vendorIds } }, { storeName: 1, storeSlug: 1 }).lean().exec(),
      this.categoryModel.find({ _id: { $in: categoryIds } }, { name: 1, slug: 1 }).lean().exec(),
    ]);

    const imageMap = new Map(primaryImages.map(img => [(img as any).productId.toString(), img]));
    const variantsByProduct = new Map<string, any[]>();
    for (const v of allVariants) {
      const key = (v as any).productId.toString();
      if (!variantsByProduct.has(key)) variantsByProduct.set(key, []);
      variantsByProduct.get(key)!.push(v);
    }
    const vendorMap = new Map(vendors.map(v => [v._id.toString(), v]));
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c]));

    const enriched = items.map(p => ({
      ...p,
      images: imageMap.has(p._id.toString()) ? [imageMap.get(p._id.toString())] : [],
      variants: variantsByProduct.get(p._id.toString()) ?? [],
      vendor: vendorMap.get((p as any).vendorId?.toString()) ?? null,
      category: categoryMap.get((p as any).categoryId?.toString()) ?? null,
    }));

    return {
      items: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string): Promise<any> {
    const product = await this.productModel.findOne({ slug }).lean().exec();
    if (!product) throw new NotFoundException('Product not found');

    const [images, variants, vendor, category] = await Promise.all([
      this.imageModel.find({ productId: product._id }).lean().exec(),
      this.variantModel.find({ productId: product._id }).lean().exec(),
      this.vendorModel.findById(product.vendorId, { storeName: 1, storeSlug: 1, logo: 1, description: 1 }).lean().exec(),
      product.categoryId ? this.categoryModel.findById(product.categoryId).lean().exec() : null,
    ]);

    return { ...product, images, variants, vendor, category };
  }

  async create(dto: CreateProductDto, userId: string, role?: Role) {
    let vendor: any;
    if (role === Role.ADMIN) {
      if (dto.vendorId) {
        vendor = await this.vendorModel.findById(dto.vendorId).exec();
        if (!vendor) throw new BadRequestException('Vendor not found');
      } else {
        vendor = await this.vendorModel.findOne({ status: 'ACTIVE' }).exec();
        if (!vendor) throw new BadRequestException('No active vendor found');
      }
    } else {
      vendor = await this.vendorModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
      if (!vendor) throw new ForbiddenException('Vendor profile not found');
    }

    const slug = await this.generateUniqueSlug(dto.title);

    const product = await this.productModel.create({
      vendorId: vendor._id,
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
      title: dto.title,
      slug,
      description: sanitizeRichText(dto.description),
      basePrice: dto.basePrice,
      status: role === Role.ADMIN ? ProductStatus.ACTIVE : ProductStatus.PENDING_APPROVAL,
      tags: dto.tags ?? [],
    });

    const [variants, images] = await Promise.all([
      dto.variants ? this.variantModel.insertMany(dto.variants.map(v => ({ ...v, productId: product._id }))) : [],
      dto.imageUrls
        ? this.imageModel.insertMany(
            dto.imageUrls.map((url, i) => ({ url, isPrimary: i === 0, productId: product._id })),
          )
        : [],
    ]);

    return { ...product.toObject(), variants, images };
  }

  async update(id: string, dto: Partial<CreateProductDto>, userId: string, role: Role): Promise<any> {
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException('Product not found');

    if (role === Role.VENDOR) {
      const vendor = await this.vendorModel.findById(product.vendorId).lean().exec();
      if (!vendor || vendor.userId.toString() !== userId) throw new ForbiddenException();
    }

    const oldPrice = product.basePrice;
    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.basePrice) updateData.basePrice = dto.basePrice;
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId ? new Types.ObjectId(dto.categoryId) : null;
    if (dto.status) updateData.status = dto.status;
    if (dto.tags) updateData.tags = dto.tags;

    const updated = await this.productModel.findByIdAndUpdate(id, updateData, { new: true }).lean().exec();

    // Notify wishlist users of price drop (fire-and-forget)
    if (dto.basePrice && dto.basePrice < oldPrice) {
      this.notifyWishlistPriceDrop(id, product.title, oldPrice, dto.basePrice, product.slug).catch(() => {});
    }
    const [variants, images] = await Promise.all([
      this.variantModel.find({ productId: new Types.ObjectId(id) }).lean().exec(),
      this.imageModel.find({ productId: new Types.ObjectId(id) }).lean().exec(),
    ]);

    return { ...updated, variants, images };
  }

  async delete(id: string, userId: string, role: Role): Promise<void> {
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException('Product not found');

    if (role === Role.VENDOR) {
      const vendor = await this.vendorModel.findById(product.vendorId).lean().exec();
      if (!vendor || vendor.userId.toString() !== userId) throw new ForbiddenException();
    }

    await Promise.all([
      this.productModel.findByIdAndDelete(id).exec(),
      this.variantModel.deleteMany({ productId: new Types.ObjectId(id) }).exec(),
      this.imageModel.deleteMany({ productId: new Types.ObjectId(id) }).exec(),
      this.wishlistItemModel.deleteMany({ productId: new Types.ObjectId(id) }).exec(),
    ]);
  }

  async importCsv(fileBuffer: Buffer, adminId: string): Promise<{ created: number; errors: string[] }> {
    const CSV_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    const CSV_MAX_ROWS = 10_000;
    const PRICE_MAX = 1_000_000;
    const TAG_MAX_COUNT = 20;
    const TAG_MAX_LENGTH = 50;
    const TITLE_MIN = 3;
    const TITLE_MAX = 200;
    const ALLOWED_IMAGE_HOSTS = ['res.cloudinary.com', 'cloudinary.com'];

    if (fileBuffer.length > CSV_MAX_BYTES) {
      throw new BadRequestException(`CSV file too large (max ${CSV_MAX_BYTES / 1024 / 1024} MB)`);
    }

    const rows = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    if (rows.length > CSV_MAX_ROWS) {
      throw new BadRequestException(`Too many rows (max ${CSV_MAX_ROWS})`);
    }

    const errors: string[] = [];
    let created = 0;

    const firstVendor = await this.vendorModel.findOne({ status: 'ACTIVE' }).lean().exec();
    if (!firstVendor) throw new BadRequestException('No active vendor found for import');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      try {
        if (!row.title || !row.basePrice) {
          errors.push(`Row ${rowNum}: Missing required fields (title, basePrice)`);
          continue;
        }

        // Title length validation
        const title = row.title.trim();
        if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
          errors.push(`Row ${rowNum}: title must be ${TITLE_MIN}–${TITLE_MAX} characters`);
          continue;
        }

        // Price range validation (prevents negative prices and integer overflow)
        const price = parseFloat(row.basePrice);
        if (isNaN(price) || price < 0 || price > PRICE_MAX) {
          errors.push(`Row ${rowNum}: basePrice must be between 0 and ${PRICE_MAX}`);
          continue;
        }

        // Image URL must be from an allowed host (prevents SSRF)
        if (row.imageUrl) {
          try {
            const parsed = new URL(row.imageUrl);
            if (!ALLOWED_IMAGE_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) {
              errors.push(`Row ${rowNum}: imageUrl must be a Cloudinary URL`);
              continue;
            }
          } catch {
            errors.push(`Row ${rowNum}: imageUrl is not a valid URL`);
            continue;
          }
        }

        // Tags: limit count and length
        const rawTags = row.tags ? row.tags.split('|').map(t => t.trim()).filter(Boolean) : [];
        if (rawTags.length > TAG_MAX_COUNT) {
          errors.push(`Row ${rowNum}: too many tags (max ${TAG_MAX_COUNT})`);
          continue;
        }
        if (rawTags.some(t => t.length > TAG_MAX_LENGTH)) {
          errors.push(`Row ${rowNum}: a tag exceeds max length of ${TAG_MAX_LENGTH}`);
          continue;
        }

        const slug = await this.generateUniqueSlug(title);
        let categoryId: Types.ObjectId | undefined;
        if (row.category) {
          const cat = await this.categoryModel.findOne({ name: { $regex: `^${row.category}$`, $options: 'i' } }).lean().exec();
          if (cat) categoryId = cat._id as Types.ObjectId;
        }

        const product = await this.productModel.create({
          vendorId: firstVendor._id,
          categoryId,
          title,
          slug,
          description: row.description ?? '',
          basePrice: price,
          status: ProductStatus.ACTIVE,
          tags: rawTags,
        });

        if (row.imageUrl) {
          await this.imageModel.create({ productId: product._id, url: row.imageUrl, isPrimary: true });
        }

        created++;
      } catch (err: any) {
        errors.push(`Row ${rowNum}: ${err.message}`);
      }
    }

    return { created, errors };
  }

  private async notifyWishlistPriceDrop(productId: string, title: string, oldPrice: number, newPrice: number, slug: string) {
    const items = await this.wishlistItemModel.find({ productId: new Types.ObjectId(productId) }).lean().exec();
    if (!items.length) return;
    const userIds = items.map((i) => i.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } }, { name: 1, email: 1 }).lean().exec();
    await Promise.all(
      users.map((u) => this.mail.sendWishlistPriceAlert(u.email, u.name, [{ title, oldPrice, newPrice, slug }])),
    );
  }

  async getStats() {
    const [total, activeVendorsResult, topProductsResult] = await Promise.all([
      this.productModel.countDocuments({ status: 'ACTIVE' }),
      this.vendorModel.countDocuments({ status: 'ACTIVE' }),
      this.productModel
        .find({ status: 'ACTIVE' })
        .sort({ salesCount: -1 })
        .limit(5)
        .lean()
        .exec(),
    ]);

    // Batch-fetch vendors for top products in one query
    const topVendorIds = [...new Set(topProductsResult.map(p => (p as any).vendorId?.toString()).filter(Boolean))];
    const topVendors = await this.vendorModel.find({ _id: { $in: topVendorIds } }, { storeName: 1 }).lean().exec();
    const topVendorMap = new Map(topVendors.map(v => [v._id.toString(), v]));

    const topProducts = topProductsResult.map(p => ({
      id: p._id,
      title: p.title,
      orderCount: (p as any).salesCount ?? 0,
      vendor: topVendorMap.get((p as any).vendorId?.toString()) ?? null,
    }));

    return { total, activeVendors: activeVendorsResult, topProducts };
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    let count = 0;
    while (true) {
      const candidate = count === 0 ? slug : `${slug}-${count}`;
      const existing = await this.productModel.findOne({ slug: candidate }).lean().exec();
      if (!existing) return candidate;
      count++;
    }
  }
}
