import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingTier extends Document {
  name: string;
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const pricingTierSchema = new Schema<IPricingTier>(
  {
    name: { type: String, required: true, trim: true },
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: { type: Number, min: 1 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pricingTierSchema.index({ minQuantity: 1, maxQuantity: 1 });

export const PricingTier = mongoose.model<IPricingTier>('PricingTier', pricingTierSchema);
