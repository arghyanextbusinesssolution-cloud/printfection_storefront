export interface NormalizedProduct {
  name: string;
  sku: string;
  externalId?: string;
  brandName?: string;
  categoryName?: string;
  description?: string;
  shortDescription?: string;
  images?: string[];
  material?: string;
  fabric?: string;
  weight?: string;
  gender?: string;
  organic?: boolean;
  accreditations?: string[];
  tags?: string[];
  plusSizeAvailable?: boolean;
  ageGroup?: string;
  basePrice: number;
  currency?: string;
  minimumOrderQuantity?: number;
  variants?: NormalizedVariant[];
  metadata?: Record<string, unknown>;
}

export interface NormalizedVariant {
  sku: string;
  externalVariantId?: string;
  colourName: string;
  colourHex?: string;
  size: string;
  price: number;
  stock: number;
  image?: string;
}

export interface ProductSourceAdapter {
  getProducts(): Promise<NormalizedProduct[]>;
  getProduct(id: string): Promise<NormalizedProduct | null>;
  syncProducts(): Promise<{ synced: number; errors: string[] }>;
}
