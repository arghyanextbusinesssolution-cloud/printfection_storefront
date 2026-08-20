import type { PricingBreakdown } from '@printfection/types';

export interface PrintLocationSelection {
  locationId: string;
  locationName: string;
  colourCount: number;
  maximumColours: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  brandName?: string;
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
  size: string;
  price: number;
  stock: number;
  image?: string;
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
  maximumColours: number;
  isActive: boolean;
  sortOrder: number;
}

export interface BulkOrderState {
  productId: string | null;
  productName: string;
  colourName: string | null;
  colourHex: string | null;
  quantities: Record<string, number>;
  printLocations: PrintLocationSelection[];
  designId: string | null;
  pricing: PricingBreakdown | null;
  step: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  colourName: string;
  colourHex?: string;
  variants: { variantId: string; size: string; quantity: number }[];
  printLocations?: { locationId: string; colourCount: number }[];
  designId?: string;
  pricingSnapshot?: PricingBreakdown;
}

export interface CartData {
  cart: { items: CartItem[] };
  totals: { subtotal: number; tax: number; total: number; currency: string; itemCount: number };
}
