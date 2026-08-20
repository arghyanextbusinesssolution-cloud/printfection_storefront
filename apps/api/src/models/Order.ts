import mongoose, { Document, Schema } from 'mongoose';
import type { OrderStatus, PaymentStatus } from '@printfection/types';

const addressSchema = new Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    county: { type: String },
    postcode: { type: String, required: true },
    country: { type: String, required: true, default: 'GB' },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    colourName: { type: String, required: true },
    colourHex: { type: String },
    variants: [
      {
        variantId: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number },
      },
    ],
    printLocations: [
      {
        locationId: { type: String },
        locationName: { type: String },
        colourCount: { type: Number },
      },
    ],
    designId: { type: Schema.Types.ObjectId, ref: 'Design' },
    pricingSnapshot: { type: Schema.Types.Mixed },
  },
  { _id: true }
);

export interface IOrder extends Document {
  orderNumber: string;
  customer?: Schema.Types.ObjectId;
  customerSnapshot: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  items: typeof orderItemSchema[];
  designReferences: Schema.Types.ObjectId[];
  pricingBreakdown: Record<string, unknown>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  quoteReference?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      company: { type: String },
    },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    items: [orderItemSchema],
    designReferences: [{ type: Schema.Types.ObjectId, ref: 'Design' }],
    pricingBreakdown: { type: Schema.Types.Mixed, default: {} },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'GBP' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'not_required'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'artwork_review', 'production', 'dispatched', 'completed', 'cancelled'],
      default: 'pending',
    },
    customerNotes: { type: String },
    adminNotes: { type: String },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    quoteReference: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'customerSnapshot.email': 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
