import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPrintPricingRule extends Document {
  printLocation: Types.ObjectId;
  colourCount: number;
  quantityTier?: Types.ObjectId;
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  setupCharge: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const printPricingRuleSchema = new Schema<IPrintPricingRule>(
  {
    printLocation: { type: Schema.Types.ObjectId, ref: 'PrintLocation', required: true },
    colourCount: { type: Number, required: true, min: 1 },
    quantityTier: { type: Schema.Types.ObjectId, ref: 'PricingTier' },
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: { type: Number },
    pricePerUnit: { type: Number, required: true, min: 0 },
    setupCharge: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

printPricingRuleSchema.index({ printLocation: 1, colourCount: 1, minQuantity: 1 });

export const PrintPricingRule = mongoose.model<IPrintPricingRule>(
  'PrintPricingRule',
  printPricingRuleSchema
);
