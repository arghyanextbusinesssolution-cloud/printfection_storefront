import type { PricingBreakdown, BulkColourConfig, BulkArtworkRef, PrintLocationInput } from '@printfection/types';

export type { BulkColourConfig, BulkArtworkRef };

export interface PrintLocationSelection {
  locationId: string;
  locationName: string;
  code: string;
  iconSvg?: string;
  colourCount: number;
  maximumColours: number;
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
  isActive: boolean;
  sortOrder: number;
}

/* ─── New unified bulk order flow state ─── */
export interface BulkColourState extends BulkColourConfig {
  /** Keyed by size for UI control */
  sizeQuantities: Record<string, number>;
}

export interface BulkOrderState {
  /* Step 1 – Garment Category */
  garmentCategoryId: string | null;
  garmentCategoryName: string;
  /* Step 2 – Product */
  productId: string | null;
  productName: string;
  productImages: string[];
  /* Step 3 – Garment Colours (multiple) */
  selectedColours: BulkColourState[];
  /* Step 4 – Size & Quantity per colour */
  /* (stored inside selectedColours[].sizeQuantities) */
  /* Step 5 – Print Locations */
  selectedLocations: PrintLocationSelection[];
  /* Step 6 – Print Colour Count per location */
  /* (stored inside selectedLocations[].colourCount) */
  /* Step 7 – Artwork uploads per colour+location */
  artworks: BulkArtworkRef[];
  /* Pricing */
  pricing: PricingBreakdown | null;
  /* Current wizard step (1-based) */
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
