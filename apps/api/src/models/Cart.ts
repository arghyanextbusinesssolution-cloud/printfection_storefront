import mongoose, { Document, Schema } from 'mongoose';
import type { CartItemConfig } from '@printfection/types';

export interface ICart extends Document {
  sessionId: string;
  customerId?: string;
  items: CartItemConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    sessionId: { type: String, required: true, index: true },
    customerId: { type: String },
    items: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        // Legacy single-colour fields (optional for unified bulk orders)
        colourName: { type: String },
        colourHex: { type: String },
        variants: [
          {
            variantId: { type: String, required: true },
            size: { type: String, required: true },
            quantity: { type: Number, required: true, min: 0 },
          },
        ],
        printLocations: [
          {
            locationId: { type: String },
            locationName: { type: String },
            colourCount: { type: Number, min: 1 },
          },
        ],
        designId: { type: String },
        pricingSnapshot: { type: Schema.Types.Mixed },
        // Unified multi-colour bulk fields
        isBulkOrder: { type: Boolean, default: false },
        colours: [
          {
            colourName: { type: String, required: true },
            colourHex: { type: String },
            colourImage: { type: String },
            variants: [
              {
                variantId: { type: String, required: true },
                size: { type: String, required: true },
                quantity: { type: Number, required: true, min: 0 },
              },
            ],
          },
        ],
        artworks: [
          {
            colourName: { type: String },
            locationId: { type: String },
            url: { type: String, required: true },
            filename: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

cartSchema.index({ sessionId: 1 });
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
