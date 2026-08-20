import mongoose, { Document, Schema } from 'mongoose';
import type { QuoteStatus } from '@printfection/types';

export interface IQuote extends Document {
  quoteReference: string;
  customerSnapshot: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  items: Record<string, unknown>[];
  designReferences: Schema.Types.ObjectId[];
  pricingBreakdown: Record<string, unknown>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: QuoteStatus;
  customerNotes?: string;
  adminNotes?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    quoteReference: { type: String, required: true, unique: true },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      company: { type: String },
    },
    items: [{ type: Schema.Types.Mixed }],
    designReferences: [{ type: Schema.Types.ObjectId, ref: 'Design' }],
    pricingBreakdown: { type: Schema.Types.Mixed, default: {} },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'GBP' },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'pending',
    },
    customerNotes: { type: String },
    adminNotes: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

quoteSchema.index({ quoteReference: 1 });
quoteSchema.index({ status: 1, createdAt: -1 });

export const Quote = mongoose.model<IQuote>('Quote', quoteSchema);
