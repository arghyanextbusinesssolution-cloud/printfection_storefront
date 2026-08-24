import mongoose, { Document, Schema } from 'mongoose';

export interface IPrintLocation extends Document {
  name: string;
  code: string;
  image?: string;
  icon?: string;
  iconSvg?: string;
  maximumColours: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const printLocationSchema = new Schema<IPrintLocation>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    image: { type: String },
    icon: { type: String },
    iconSvg: { type: String },
    maximumColours: { type: Number, required: true, min: 1, default: 8 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const PrintLocation = mongoose.model<IPrintLocation>('PrintLocation', printLocationSchema);
