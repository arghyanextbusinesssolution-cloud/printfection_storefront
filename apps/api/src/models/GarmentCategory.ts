import mongoose, { Document, Schema } from 'mongoose';

export interface IGarmentCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  iconSvg?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const garmentCategorySchema = new Schema<IGarmentCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image: { type: String },
    icon: { type: String },
    iconSvg: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

garmentCategorySchema.index({ slug: 1 });
garmentCategorySchema.index({ isActive: 1, sortOrder: 1 });

export const GarmentCategory = mongoose.model<IGarmentCategory>('GarmentCategory', garmentCategorySchema);
