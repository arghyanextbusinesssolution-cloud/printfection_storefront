import { connectDatabase, disconnectDatabase } from '../config/database';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { slugify } from '@printfection/shared';
import { logger } from '../utils/logger';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

const NEW_PRODUCTS = [
  {
    name: 'Custom Printed T-Shirt',
    sku: 'PF-TSH-PRINT-001',
    brandName: 'Printfection',
    category: 'T-Shirts',
    description: 'Our signature custom-printed t-shirt — shown here with a sample design. Your artwork, your colours, delivered ready to wear. Perfect for streetwear brands, events, and corporate campaigns.',
    shortDescription: 'Premium tee with your custom design printed',
    basePrice: 7.50,
    minimumOrderQuantity: 25,
    organic: true,
    gender: 'Unisex',
    fabric: '100% Organic Cotton',
    weight: '180gsm',
    accreditations: ['GOTS', 'Fair Wear'],
    tags: ['printed', 'custom', 'bestseller'],
    images: ['/images/products/printed_tshirt_mockup_black.png'],
    colours: [
      { name: 'Black', hex: '#1A1A1A', image: '/images/products/printed_tshirt_mockup_black.png' },
      { name: 'White', hex: '#FFFFFF', image: '/images/products/classic_organic_t_shirt_white_1787252492690.png' },
      { name: 'Navy', hex: '#1B2A4A', image: '/images/products/classic_organic_t_shirt_navy_1787252506585.png' },
    ],
  },
  {
    name: 'Custom Printed Hoodie',
    sku: 'PF-HOD-PRINT-001',
    brandName: 'Printfection',
    category: 'Hoodies',
    description: 'Heavyweight hoodie with your design printed to perfection. Shown here with a sample graphic. Ideal for brand drops, team kits, and retail collections.',
    shortDescription: 'Premium hoodie with your custom print',
    basePrice: 15.00,
    minimumOrderQuantity: 25,
    organic: false,
    gender: 'Unisex',
    fabric: '80% Cotton, 20% Polyester',
    weight: '300gsm',
    accreditations: ['WRAP'],
    tags: ['printed', 'custom', 'hoodie'],
    images: ['/images/products/printed_hoodie_mockup_white.png'],
    plusSizeAvailable: true,
    colours: [
      { name: 'White', hex: '#FFFFFF', image: '/images/products/printed_hoodie_mockup_white.png' },
      { name: 'Black', hex: '#1A1A1A', image: '/images/products/premium_hoodie_black_1787252519639.png' },
    ],
  },
];

async function addPrintedProducts() {
  await connectDatabase();
  logger.info('Adding custom printed products...');

  for (const sp of NEW_PRODUCTS) {
    // Check if already exists
    const existing = await Product.findOne({ sku: sp.sku });
    if (existing) {
      logger.info(`Product already exists, skipping: ${sp.name}`);
      continue;
    }

    // Find category
    const categorySlug = sp.category.toLowerCase().replace(/\s/g, '-');
    const category = await Category.findOne({ name: sp.category });
    if (!category) {
      logger.warn(`Category not found: ${sp.category}`);
      continue;
    }

    const product = await Product.create({
      name: sp.name,
      slug: slugify(sp.name),
      sku: sp.sku,
      brandName: sp.brandName,
      category: category._id,
      description: sp.description,
      shortDescription: sp.shortDescription,
      basePrice: sp.basePrice,
      minimumOrderQuantity: sp.minimumOrderQuantity,
      organic: sp.organic,
      gender: sp.gender,
      fabric: sp.fabric,
      weight: sp.weight,
      accreditations: sp.accreditations,
      tags: sp.tags,
      plusSizeAvailable: (sp as any).plusSizeAvailable ?? false,
      images: sp.images,
      currency: 'GBP',
      isActive: true,
      source: 'manual',
    });

    logger.info(`Created product: ${sp.name}`);

    for (const colour of sp.colours) {
      for (const size of SIZES) {
        const variantSku = `${sp.sku}-${colour.name.replace(/\s/g, '').toUpperCase()}-${size}`;
        await ProductVariant.create({
          product: product._id,
          sku: variantSku,
          colourName: colour.name,
          colourHex: colour.hex,
          size,
          price: sp.basePrice + (size === '2XL' ? 1.5 : size === 'XL' ? 0.75 : 0),
          stock: Math.floor(Math.random() * 400) + 100,
          image: colour.image,
          isActive: true,
        });
      }
    }
    logger.info(`  Created ${sp.colours.length * SIZES.length} variants`);
  }

  logger.info('Done!');
  await disconnectDatabase();
}

addPrintedProducts().catch((err) => {
  logger.error('Failed', err);
  process.exit(1);
});
