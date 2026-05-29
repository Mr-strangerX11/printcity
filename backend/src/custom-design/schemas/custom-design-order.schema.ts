import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CustomOrderStatus } from '../../common/enums';

export type CustomDesignOrderDocument = CustomDesignOrder & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class CustomDesignOrder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;

  // Product reference (optional – legacy orders may not have this)
  @Prop({ type: Types.ObjectId, ref: 'Product', default: null }) productId?: Types.ObjectId;
  @Prop() productTitle?: string;

  @Prop({ required: true }) productType: string;

  // Canvas design data
  @Prop() canvasJson?: string;       // Konva stage JSON for reconstructing the design
  @Prop() previewUrl?: string;       // Generated preview screenshot URL
  @Prop({ type: [String], default: [] }) designUrls: string[]; // Uploaded asset URLs

  // Legacy single design URL field (kept for compatibility)
  @Prop() designUrl?: string;
  @Prop() publicId?: string;

  // Print settings
  @Prop() printMethod?: string;
  @Prop({ type: [String], default: [] }) printSides: string[]; // ['front','back']

  // Order details
  @Prop() notes?: string;
  @Prop() adminNotes?: string;
  @Prop({ type: String, enum: CustomOrderStatus, default: CustomOrderStatus.PENDING }) status: CustomOrderStatus;
  @Prop() price?: number;
  @Prop() size?: string;
  @Prop() color?: string;
  @Prop({ default: 1 }) qty: number;

  // Pricing breakdown
  @Prop({ type: Object, default: null }) pricingBreakdown?: {
    basePrice: number;
    printCost: number;
    setupCost: number;
    discount: number;
    total: number;
  };
}

export const CustomDesignOrderSchema = SchemaFactory.createForClass(CustomDesignOrder);

CustomDesignOrderSchema.pre('save', function(next) {
  if (this.canvasJson && this.canvasJson.length > 2 * 1024 * 1024) {
    next(new Error('Canvas JSON exceeds maximum allowed size (2MB)'));
  } else {
    next();
  }
});
