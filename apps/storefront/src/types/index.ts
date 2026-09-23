import type { PricingBreakdown, BulkColourConfig, BulkArtworkRef, PrintLocationInput } from '@printfection/types';

export type { BulkColourConfig, BulkArtworkRef };

export interface PrintLocationSelection {
  locationId: string;
  locationName: string;
  code: string;
  iconSvg?: string;
  colourCount: number;
  maximumColours: number;
  printingMethod?: string;
  printSize?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  brandName?: string;
  garmentCategory?: { _id: string; name: string; slug: string; icon?: string };
  category: { _id: string; name: string; slug: string };
  description?: string;
  shortDescription?: string;
  images: string[];
  basePrice: number;
  currency: string;
  minimumOrderQuantity: number;
  organic: boolean;
  gender?: string;
  fabric?: string;
  weight?: string;
  accreditations: string[];
  tags: string[];
  plusSizeAvailable: boolean;
  isActive: boolean;
}

export interface ProductVariant {
  _id: string;
  product: string;
  sku: string;
  colourName: string;
  colourHex?: string;
  colourImage?: string;
  size: string;
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface GarmentCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  iconSvg?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

export interface BulkOrderSize {
  variantId: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
}

export interface PrintLocation {
  _id: string;
  name: string;
  code: string;
  iconSvg?: string;
  description?: string;
  maximumColours: number;
  isActive?: boolean;
  sortOrder?: number;
}

/* ─── New unified bulk order flow state ─── */
export interface BulkColourState extends BulkColourConfig {
  /** Keyed by size for UI control */
  sizeQuantities: Record<string, number>;
}

export interface BulkOrderState {
  /* Step 1 – Quantity */
  targetQuantity: number;
  /* Step 2 – Garment Category */
  garmentCategoryId: string | null;
  garmentCategoryName: string;
  /* Step 3 – Product */
  productId: string | null;
  productName: string;
  productImages: string[];
  /* Step 4 – Garment Colours */
  selectedColours: BulkColourState[];
  /* Step 5 – Size & Quantity per colour (stored in selectedColours) */
  /* Step 6 – Printing Method */
  printingMethod: string;
  /* Step 7 – Print Locations & Colours */
  selectedLocations: PrintLocationSelection[];
  /* Step 8 – Artwork / Design Studio */
  artworks: BulkArtworkRef[];
  designId?: string | null;
  designsData?: Record<string, any>;
  /* Step 9 – Pricing Breakdown */
  pricing: PricingBreakdown | null;
  /* Step 10 – Review & Checkout */
  step: number;
  /* Edit index of cart item (null if new) */
  editItemIndex: number | null;
}

export interface CartItem {
  productId: string;
  productName: string;
  colourName: string;
  colourHex?: string;
  variants: { variantId: string; size: string; quantity: number }[];
  printLocations?: PrintLocationInput[];
  designId?: string;
  pricingSnapshot?: PricingBreakdown;
  /* Unified bulk order fields */
  isBulkOrder?: boolean;
  colours?: BulkColourConfig[];
  artworks?: BulkArtworkRef[];
}

export interface CartData {
  cart: { items: CartItem[] };
  totals: { subtotal: number; tax: number; total: number; currency: string; itemCount: number };
}
