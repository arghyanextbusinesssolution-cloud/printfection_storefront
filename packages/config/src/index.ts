export const BRAND = {
  name: 'Printfection UK',
  tagline: 'Premium Bulk Garment Printing',
  accentColor: '#E63946',
  darkColor: '#1A1A1A',
  lightColor: '#FFFFFF',
} as const;

export const DEFAULT_PAGE_SIZE = 24;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'artwork_review',
  'production',
  'dispatched',
  'completed',
  'cancelled',
] as const;

export const QUOTE_STATUSES = [
  'pending',
  'reviewed',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'converted',
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
  'not_required',
] as const;

export const LOW_STOCK_THRESHOLD = 10;

export const VAT_RATE = 0.2;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

export const MAX_CSV_SIZE = 10 * 1024 * 1024; // 10MB
