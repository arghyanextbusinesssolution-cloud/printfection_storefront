import { connectDatabase, disconnectDatabase } from '../config/database';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { logger } from '../utils/logger';

// Map of product SKU -> image URLs and variant images
const PRODUCT_IMAGE_PATCHES: Record<string, {
  images: string[];
  variantImages: Record<string, string>;
}> = {
  'PF-TSH-001': {
    images: [
      '/images/products/classic_organic_t_shirt_black_1787252480190.png',
      '/images/products/classic_organic_t_shirt_white_1787252492690.png',
      '/images/products/classic_organic_t_shirt_navy_1787252506585.png',
    ],
    variantImages: {
      'Black': '/images/products/classic_organic_t_shirt_black_1787252480190.png',
      'White': '/images/products/classic_organic_t_shirt_white_1787252492690.png',
      'Navy':  '/images/products/classic_organic_t_shirt_navy_1787252506585.png',
    },
  },
  'PF-HOD-001': {
    images: [
      '/images/products/premium_hoodie_black_1787252519639.png',
      '/images/products/premium_hoodie_grey_1787252530611.png',
    ],
    variantImages: {
      'Black':        '/images/products/premium_hoodie_black_1787252519639.png',
      'Heather Grey': '/images/products/premium_hoodie_grey_1787252530611.png',
    },
  },
  'PF-POL-001': {
    images: [
      '/images/products/performance_polo_royal_blue_1787252543400.png',
    ],
    variantImages: {
      'Royal Blue': '/images/products/performance_polo_royal_blue_1787252543400.png',
      'White':      '/images/products/performance_polo_royal_blue_1787252543400.png',
    },
  },
  'PF-SWT-001': {
    images: [
      '/images/products/premium_hoodie_black_1787252519639.png',
      '/images/products/premium_hoodie_grey_1787252530611.png',
    ],
    variantImages: {
      'Black':        '/images/products/premium_hoodie_black_1787252519639.png',
      'Heather Grey': '/images/products/premium_hoodie_grey_1787252530611.png',
    },
  },
};

async function patchImages() {
  await connectDatabase();
  logger.info('Patching product images...');

  for (const [sku, patch] of Object.entries(PRODUCT_IMAGE_PATCHES)) {
    const product = await Product.findOne({ sku });
    if (!product) {
      logger.warn(`Product not found: ${sku}`);
      continue;
    }

    await Product.updateOne({ sku }, { $set: { images: patch.images } });
    logger.info(`Updated images for: ${product.name}`);

    // Patch variant images
    for (const [colourName, imageUrl] of Object.entries(patch.variantImages)) {
      const result = await ProductVariant.updateMany(
        { product: product._id, colourName },
        { $set: { image: imageUrl } }
      );
      logger.info(`  Patched ${result.modifiedCount} variants for colour: ${colourName}`);
    }
  }

  logger.info('Image patch complete!');
  await disconnectDatabase();
}

patchImages().catch((err) => {
  logger.error('Patch failed', err);
  process.exit(1);
});
