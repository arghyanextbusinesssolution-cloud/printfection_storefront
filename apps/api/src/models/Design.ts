import mongoose, { Document, Schema } from 'mongoose';
import type { DesignProvider } from '@printfection/types';

export interface IDesign extends Document {
  provider: DesignProvider | string;
  externalId?: string;
  productId: Schema.Types.ObjectId;
  sessionId?: string;
  customerId?: string;
  configuration: Record<string, unknown>;
  previewUrl?: string;
  exportUrl?: string;
  status: 'draft' | 'saved' | 'exported';
  createdAt: Date;
  updatedAt: Date;
}

const designSchema = new Schema<IDesign>(
  {
    provider: { type: String, required: true, default: 'placeholder' },
    externalId: { type: String },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sessionId: { type: String },
    customerId: { type: String },
    configuration: { type: Schema.Types.Mixed, default: {} },
    previewUrl: { type: String },
    exportUrl: { type: String },
    status: {
      type: String,
      enum: ['draft', 'saved', 'exported'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

designSchema.index({ productId: 1 });
designSchema.index({ sessionId: 1 });

export const Design = mongoose.model<IDesign>('Design', designSchema);
