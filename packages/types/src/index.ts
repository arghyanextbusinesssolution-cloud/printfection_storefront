export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  gender?: string;
  organic?: boolean;
  fabric?: string;
  weight?: string;
  accreditations?: string[];
  tags?: string[];
  plusSizeAvailable?: boolean;
  ageGroup?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface BulkOrderVariantInput {
  variantId: string;
  size: string;
  quantity: number;
}

export interface PrintLocationInput {
  locationId: string;
  colourCount: number;
}

export interface PricingCalculateInput {
  productId: string;
  variants: BulkOrderVariantInput[];
  printLocations?: PrintLocationInput[];
}

export interface PricingBreakdown {
  garmentSubtotal: number;
  printingSubtotal: number;
  setupCharges: number;
  discount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  lineItems?: PricingLineItem[];
}

export interface PricingLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'artwork_review'
  | 'production'
  | 'dispatched'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'not_required';

export type QuoteStatus = 'pending' | 'reviewed' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface CartItemConfig {
  productId: string;
  productName: string;
  colourName: string;
  colourHex?: string;
  variants: BulkOrderVariantInput[];
  printLocations?: PrintLocationInput[];
  designId?: string;
  pricingSnapshot?: PricingBreakdown;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  totalQuotes: number;
  pendingOrders: number;
  revenue: number;
  recentOrders: unknown[];
  recentQuotes: unknown[];
}

export interface FilterOptions {
  brands: string[];
  colours: { name: string; hex?: string }[];
  genders: string[];
  fabrics: string[];
  weights: string[];
  accreditations: string[];
  tags: string[];
  ageGroups: string[];
}

export interface ImportPreviewResult {
  valid: Record<string, unknown>[];
  invalid: { row: number; data: Record<string, unknown>; errors: string[] }[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface ImportJobResult {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: { row?: number; sku?: string; message: string }[];
}

export type ProductSource = 'manual' | 'csv' | 'api';

export type DesignProvider = 'fancy-product-designer' | 'lumise' | 'placeholder';
