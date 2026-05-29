import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomOrderStatus } from '../common/enums';
import { Role } from '../user/schemas/user.schema';
import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { CustomDesignOrder, CustomDesignOrderDocument } from './schemas/custom-design-order.schema';

export class CreateCustomDesignDto {
  @IsString() productType: string;

  // New canvas-based fields
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() productTitle?: string;
  @IsOptional() @IsString() canvasJson?: string;
  @IsOptional() @IsString() previewUrl?: string;
  @IsOptional() @IsArray() designUrls?: string[];
  @IsOptional() @IsString() printMethod?: string;
  @IsOptional() @IsArray() printSides?: string[];
  @IsOptional() pricingBreakdown?: {
    basePrice: number;
    printCost: number;
    setupCost: number;
    discount: number;
    total: number;
  };

  // Legacy
  @IsOptional() @IsString() designUrl?: string;
  @IsOptional() @IsString() publicId?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsInt() @Min(1) qty?: number;
}

export class UpdateCustomDesignDto {
  @IsOptional() status?: CustomOrderStatus;
  @IsOptional() @IsString() adminNotes?: string;
  @IsOptional() price?: number;
  @IsOptional() @IsString() printMethod?: string;
}

@Injectable()
export class CustomDesignService {
  constructor(
    @InjectModel(CustomDesignOrder.name)
    private customDesignOrderModel: Model<CustomDesignOrderDocument>,
  ) {}

  async create(userId: string, dto: CreateCustomDesignDto) {
    return this.customDesignOrderModel.create({
      userId: new Types.ObjectId(userId),
      productId: dto.productId ? new Types.ObjectId(dto.productId) : null,
      productTitle: dto.productTitle,
      productType: dto.productType,
      canvasJson: dto.canvasJson,
      previewUrl: dto.previewUrl,
      designUrls: dto.designUrls ?? [],
      designUrl: dto.designUrl ?? dto.previewUrl ?? '',
      publicId: dto.publicId,
      printMethod: dto.printMethod,
      printSides: dto.printSides ?? ['front'],
      notes: dto.notes,
      size: dto.size,
      color: dto.color,
      qty: dto.qty ?? 1,
      pricingBreakdown: dto.pricingBreakdown ?? null,
      status: CustomOrderStatus.PENDING,
    });
  }

  async findAll(userId: string, role: Role, query: any) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (role === Role.CUSTOMER) filter.userId = new Types.ObjectId(userId);
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      this.customDesignOrderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean()
        .exec(),
      this.customDesignOrderModel.countDocuments(filter),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, userId: string, role: Role) {
    const order = await this.customDesignOrderModel
      .findById(id)
      .populate('userId', 'name email')
      .lean()
      .exec();
    if (!order) throw new NotFoundException('Custom design order not found');
    if (role === Role.CUSTOMER && order.userId.toString() !== userId) throw new ForbiddenException();
    return order;
  }

  async update(id: string, dto: UpdateCustomDesignDto) {
    const order = await this.customDesignOrderModel.findById(id).exec();
    if (!order) throw new NotFoundException();
    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.adminNotes !== undefined) data.adminNotes = dto.adminNotes;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.printMethod !== undefined) data.printMethod = dto.printMethod;
    return this.customDesignOrderModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
