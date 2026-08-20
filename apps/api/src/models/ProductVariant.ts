import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductVariant extends Document {
  product: Types.ObjectId;
  sku: string;
  externalVariantId?: string;
  colourName: string;
  colourHex?: string;
  size: string;
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    externalVariantId: { type: String, sparse: true },
    colourName: { type: String, required: true, trim: true },
    colourHex: { type: String, trim: true },
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

variantSchema.index({ product: 1, isActive: 1 });
variantSchema.index({ sku: 1 });
variantSchema.index({ product: 1, colourName: 1, size: 1 });

export const ProductVariant = mongoose.model<IProductVariant>('ProductVariant', variantSchema);
