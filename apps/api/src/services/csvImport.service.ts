import { slugify } from '@printfection/shared';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Category } from '../models/Category';
import { ImportJob } from '../models/ImportJob';
import { NormalizedProduct } from '../integrations/product-source/ProductSourceAdapter';
import { logger } from '../utils/logger';
import type { ImportJobResult } from '@printfection/types';

async function findOrCreateCategory(name: string) {
  const slug = slugify(name);
  let category = await Category.findOne({ slug });
  if (!category) {
    category = await Category.create({ name, slug, isActive: true });
  }
  return category;
}

export async function importProducts(
  products: NormalizedProduct[],
  jobId?: string
): Promise<ImportJobResult> {
  const result: ImportJobResult = { imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] };

  for (const np of products) {
    try {
      if (!np.name || !np.sku) {
        result.skipped++;
        result.errors.push({ sku: np.sku, message: 'Missing name or SKU' });
        continue;
      }

      let categoryId;
      if (np.categoryName) {
        const category = await findOrCreateCategory(np.categoryName);
        categoryId = category._id;
      }

      const slug = slugify(np.name);
      let product = await Product.findOne({ $or: [{ sku: np.sku }, { externalId: np.externalId }] });
      const isUpdate = !!product;

      if (product) {
        Object.assign(product, {
          name: np.name,
          description: np.description,
          shortDescription: np.shortDescription,
          brandName: np.brandName,
          basePrice: np.basePrice,
          minimumOrderQuantity: np.minimumOrderQuantity ?? product.minimumOrderQuantity,
          ...(categoryId && { category: categoryId }),
          source: 'csv' as const,
        });
        await product.save();
        result.updated++;
      } else {
        if (!categoryId) {
          result.failed++;
          result.errors.push({ sku: np.sku, message: 'Category required for new products' });
          continue;
        }
        product = await Product.create({
          name: np.name,
          slug,
          sku: np.sku,
          externalId: np.externalId,
          brandName: np.brandName,
          category: categoryId,
          description: np.description,
          basePrice: np.basePrice,
          minimumOrderQuantity: np.minimumOrderQuantity ?? 25,
          currency: np.currency ?? 'GBP',
          source: 'csv',
          isActive: true,
        });
        result.imported++;
      }

      if (np.variants?.length) {
        for (const nv of np.variants) {
          const existingVariant = await ProductVariant.findOne({ sku: nv.sku });
          if (existingVariant) {
            Object.assign(existingVariant, {
              colourName: nv.colourName,
              colourHex: nv.colourHex,
              size: nv.size,
              price: nv.price,
              stock: nv.stock,
            });
            await existingVariant.save();
          } else {
            await ProductVariant.create({
              product: product._id,
              sku: nv.sku,
              externalVariantId: nv.externalVariantId,
              colourName: nv.colourName,
              colourHex: nv.colourHex,
              size: nv.size,
              price: nv.price,
              stock: nv.stock,
              isActive: true,
            });
          }
        }
      }
    } catch (error) {
      result.failed++;
      result.errors.push({
        sku: np.sku,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      logger.error('Product import failed', { sku: np.sku, error });
    }
  }

  if (jobId) {
    await ImportJob.findByIdAndUpdate(jobId, {
      status: 'completed',
      counts: {
        imported: result.imported,
        updated: result.updated,
        skipped: result.skipped,
        failed: result.failed,
      },
      importErrors: result.errors,
      completedAt: new Date(),
    });
  }

  return result;
}
