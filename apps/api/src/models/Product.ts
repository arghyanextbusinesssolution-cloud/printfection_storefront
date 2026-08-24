import mongoose, { Document, Schema, Types } from 'mongoose';
import type { ProductSource } from '@printfection/types';

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  externalId?: string;
  brand: Types.ObjectId | string;
  brandName?: string;
  category: Types.ObjectId;
  garmentCategory?: Types.ObjectId;
  description?: string;
  shortDescription?: string;
  images: string[];
  material?: string;
  fabric?: string;
  weight?: string;
  gender?: string;
  organic: boolean;
  accreditations: string[];
  tags: string[];
  plusSizeAvailable: boolean;
  ageGroup?: string;
  basePrice: number;
  currency: string;
  minimumOrderQuantity: number;
  isActive: boolean;
  source: ProductSource;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    externalId: { type: String, sparse: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
    brandName: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    garmentCategory: { type: Schema.Types.ObjectId, ref: 'GarmentCategory' },
    description: { type: String },
    shortDescription: { type: String, trim: true },
    images: [{ type: String }],
    material: { type: String, trim: true },
    fabric: { type: String, trim: true },
    weight: { type: String, trim: true },
    gender: { type: String, trim: true },
    organic: { type: Boolean, default: false },
    accreditations: [{ type: String }],
    tags: [{ type: String }],
    plusSizeAvailable: { type: Boolean, default: false },
    ageGroup: { type: String, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'GBP' },
    minimumOrderQuantity: { type: Number, required: true, min: 1, default: 25 },
    isActive: { type: Boolean, default: true },
    source: { type: String, enum: ['manual', 'csv', 'api'], default: 'manual' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ externalId: 1 }, { sparse: true });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brandName: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
