import { parse } from 'csv-parse/sync';
import fs from 'fs';
import {
  ProductSourceAdapter,
  NormalizedProduct,
  NormalizedVariant,
} from './ProductSourceAdapter';

export interface CsvColumnMapping {
  name?: string;
  sku?: string;
  externalId?: string;
  brandName?: string;
  categoryName?: string;
  description?: string;
  basePrice?: string;
  colourName?: string;
  colourHex?: string;
  size?: string;
  variantSku?: string;
  price?: string;
  stock?: string;
  minimumOrderQuantity?: string;
  [key: string]: string | undefined;
}

const DEFAULT_MAPPING: CsvColumnMapping = {
  name: 'name',
  sku: 'sku',
  externalId: 'external_id',
  brandName: 'brand',
  categoryName: 'category',
  description: 'description',
  basePrice: 'base_price',
  colourName: 'colour',
  colourHex: 'colour_hex',
  size: 'size',
  variantSku: 'variant_sku',
  price: 'price',
  stock: 'stock',
  minimumOrderQuantity: 'minimum_order_quantity',
};

function getField(row: Record<string, string>, mapping: CsvColumnMapping, key: keyof CsvColumnMapping): string {
  const col = mapping[key];
  if (!col) return '';
  return (row[col] || '').trim();
}

function parseNumber(value: string, fallback = 0): number {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
}

export class CsvProductSource implements ProductSourceAdapter {
  private filePath: string;
  private mapping: CsvColumnMapping;

  constructor(filePath: string, mapping?: CsvColumnMapping) {
    this.filePath = filePath;
    this.mapping = { ...DEFAULT_MAPPING, ...mapping };
  }

  private parseRows(): Record<string, string>[] {
    const content = fs.readFileSync(this.filePath, 'utf-8');
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  }

  async getProducts(): Promise<NormalizedProduct[]> {
    const rows = this.parseRows();
    const productMap = new Map<string, NormalizedProduct>();

    for (const row of rows) {
      const sku = getField(row, this.mapping, 'sku');
      if (!sku) continue;

      if (!productMap.has(sku)) {
        productMap.set(sku, {
          name: getField(row, this.mapping, 'name'),
          sku,
          externalId: getField(row, this.mapping, 'externalId') || undefined,
          brandName: getField(row, this.mapping, 'brandName') || undefined,
          categoryName: getField(row, this.mapping, 'categoryName') || undefined,
          description: getField(row, this.mapping, 'description') || undefined,
          basePrice: parseNumber(getField(row, this.mapping, 'basePrice')),
          minimumOrderQuantity: parseNumber(getField(row, this.mapping, 'minimumOrderQuantity'), 25),
          currency: 'GBP',
          variants: [],
        });
      }

      const product = productMap.get(sku)!;
      const variantSku = getField(row, this.mapping, 'variantSku') || `${sku}-${getField(row, this.mapping, 'colourName')}-${getField(row, this.mapping, 'size')}`;
      const variant: NormalizedVariant = {
        sku: variantSku,
        colourName: getField(row, this.mapping, 'colourName'),
        colourHex: getField(row, this.mapping, 'colourHex') || undefined,
        size: getField(row, this.mapping, 'size'),
        price: parseNumber(getField(row, this.mapping, 'price'), product.basePrice),
        stock: parseNumber(getField(row, this.mapping, 'stock')),
      };

      if (variant.colourName && variant.size) {
        product.variants!.push(variant);
      }
    }

    return Array.from(productMap.values());
  }

  async getProduct(id: string): Promise<NormalizedProduct | null> {
    const products = await this.getProducts();
    return products.find((p) => p.sku === id || p.externalId === id) ?? null;
  }

  async syncProducts(): Promise<{ synced: number; errors: string[] }> {
    const products = await this.getProducts();
    return { synced: products.length, errors: [] };
  }
}

export function previewCsvImport(
  filePath: string,
  mapping?: CsvColumnMapping
): { valid: NormalizedProduct[]; invalid: { row: number; errors: string[] }[] } {
  const source = new CsvProductSource(filePath, mapping);
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  const m = { ...DEFAULT_MAPPING, ...mapping };
  const valid: NormalizedProduct[] = [];
  const invalid: { row: number; errors: string[] }[] = [];

  rows.forEach((row, index) => {
    const errors: string[] = [];
    if (!getField(row, m, 'name')) errors.push('Missing product name');
    if (!getField(row, m, 'sku')) errors.push('Missing SKU');
    if (!getField(row, m, 'colourName')) errors.push('Missing colour');
    if (!getField(row, m, 'size')) errors.push('Missing size');

    if (errors.length > 0) {
      invalid.push({ row: index + 2, errors });
    }
  });

  return { valid, invalid };
}
