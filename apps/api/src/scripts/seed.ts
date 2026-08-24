import { connectDatabase, disconnectDatabase } from '../config/database';
import { createAdmin } from '../services/auth.service';
import { Category } from '../models/Category';
import { GarmentCategory } from '../models/GarmentCategory';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { PricingTier } from '../models/PricingTier';
import { PrintLocation } from '../models/PrintLocation';
import { PrintPricingRule } from '../models/PrintPricingRule';
import { env } from '../config/env';
import { slugify } from '@printfection/shared';
import { logger } from '../utils/logger';

const CATEGORIES = [
  { name: 'T-Shirts', icon: '👕', sortOrder: 1 },
  { name: 'Sweatshirts', icon: '🧥', sortOrder: 2 },
  { name: 'Hoodies', icon: '🧢', sortOrder: 3 },
  { name: 'Polos', icon: '👔', sortOrder: 4 },
  { name: 'Vests', icon: '🦺', sortOrder: 5 },
  { name: 'Bags', icon: '👜', sortOrder: 6 },
];

const GARMENT_CATEGORIES = [
  { name: 'T-Shirts & Tops', icon: '👕', sortOrder: 1, description: 'Premium organic cotton tees, tank tops, and v-necks' },
  { name: 'Sweatshirts & Crewnecks', icon: '🧥', sortOrder: 2, description: 'Comfortable fleece lined crewnecks and pullovers' },
  { name: 'Hoodies & Jackets', icon: '🧢', sortOrder: 3, description: 'Heavyweight hoodies and outerwear for premium branding' },
  { name: 'Polo Shirts', icon: '👔', sortOrder: 4, description: 'Professional pique and performance polo shirts' },
  { name: 'Vests & Sleeveless', icon: '🦺', sortOrder: 5, description: 'Athletic wear and high-visibility work safety vests' },
  { name: 'Bags & Accessories', icon: '👜', sortOrder: 6, description: 'Tote bags, backpacks, and textile merchandise' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

const SAMPLE_PRODUCTS = [
  {
    name: 'Classic Organic T-Shirt',
    sku: 'PF-TSH-001',
    brandName: 'Stanley/Stella',
    category: 'T-Shirts',
    garmentCategory: 'T-Shirts & Tops',
    description: 'Premium organic cotton t-shirt, perfect for custom printing.',
    shortDescription: 'Organic cotton tee for bulk orders',
    basePrice: 4.50,
    minimumOrderQuantity: 25,
    organic: true,
    gender: 'Unisex',
    fabric: '100% Organic Cotton',
    weight: '180gsm',
    accreditations: ['GOTS', 'Fair Wear'],
    tags: ['organic', 'bestseller'],
    colours: [
      { name: 'Black', hex: '#1A1A1A', image: '/images/products/classic_organic_t_shirt_black_1787252480190.png' },
      { name: 'White', hex: '#FFFFFF', image: '/images/products/classic_organic_t_shirt_white_1787252492690.png' },
      { name: 'Navy', hex: '#1B2A4A', image: '/images/products/classic_organic_t_shirt_navy_1787252506585.png' },
    ],
  },
  {
    name: 'Premium Hoodie',
    sku: 'PF-HOD-001',
    brandName: 'Russell',
    category: 'Hoodies',
    garmentCategory: 'Hoodies & Jackets',
    description: 'Heavyweight hoodie with soft fleece interior.',
    shortDescription: 'Premium heavyweight hoodie',
    basePrice: 12.00,
    minimumOrderQuantity: 25,
    organic: false,
    gender: 'Unisex',
    fabric: '80% Cotton, 20% Polyester',
    weight: '280gsm',
    accreditations: ['WRAP'],
    tags: ['hoodie', 'premium'],
    plusSizeAvailable: true,
    colours: [
      { name: 'Black', hex: '#1A1A1A', image: '/images/products/premium_hoodie_black_1787252519639.png' },
      { name: 'Heather Grey', hex: '#9E9E9E', image: '/images/products/premium_hoodie_grey_1787252530611.png' },
    ],
  },
  {
    name: 'Performance Polo',
    sku: 'PF-POL-001',
    brandName: 'Fruit of the Loom',
    category: 'Polos',
    garmentCategory: 'Polo Shirts',
    description: 'Moisture-wicking polo shirt ideal for corporate branding.',
    shortDescription: 'Corporate performance polo',
    basePrice: 6.75,
    minimumOrderQuantity: 50,
    organic: false,
    gender: 'Unisex',
    fabric: 'Polyester Blend',
    weight: '200gsm',
    accreditations: [],
    tags: ['corporate', 'polo'],
    colours: [
      { name: 'Royal Blue', hex: '#2563EB', image: '/images/products/performance_polo_royal_blue_1787252543400.png' },
      { name: 'White', hex: '#FFFFFF', image: '/images/products/performance_polo_royal_blue_1787252543400.png' },
    ],
  },
  {
    name: 'Industrial Crew Sweatshirt',
    sku: 'PF-SWT-001',
    brandName: 'Russell',
    category: 'Sweatshirts',
    garmentCategory: 'Sweatshirts & Crewnecks',
    description: 'Heavyweight classic fit crew neck sweatshirt, perfect for corporate or custom print runs.',
    shortDescription: 'Industrial classic crew sweatshirt',
    basePrice: 10.50,
    minimumOrderQuantity: 25,
    organic: false,
    gender: 'Unisex',
    fabric: '80% Organic Cotton, 20% Recycled Polyester',
    weight: '300gsm',
    accreditations: ['WRAP', 'Oeko-Tex'],
    tags: ['sweatshirt', 'heavyweight'],
    plusSizeAvailable: true,
    colours: [
      { name: 'Black', hex: '#1A1A1A', image: '/images/products/premium_hoodie_black_1787252519639.png' },
      { name: 'Heather Grey', hex: '#9E9E9E', image: '/images/products/premium_hoodie_grey_1787252530611.png' },
    ],
  },
];

const PRINT_LOCATIONS = [
  {
    name: 'Full Front',
    code: 'FULL_FRONT',
    maximumColours: 8,
    sortOrder: 1,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,22 L58,22 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><rect x="35" y="32" width="30" height="38" rx="2" stroke-dasharray="3,3" /></svg>`
  },
  {
    name: 'Left Chest',
    code: 'LEFT_CHEST',
    maximumColours: 4,
    sortOrder: 2,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,22 L58,22 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><circle cx="38" cy="35" r="7" stroke-dasharray="3,3" /></svg>`
  },
  {
    name: 'Right Chest',
    code: 'RIGHT_CHEST',
    maximumColours: 4,
    sortOrder: 3,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,22 L58,22 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><circle cx="62" cy="35" r="7" stroke-dasharray="3,3" /></svg>`
  },
  {
    name: 'Full Back',
    code: 'FULL_BACK',
    maximumColours: 8,
    sortOrder: 4,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,20 L58,20 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><rect x="30" y="28" width="40" height="45" rx="2" stroke-dasharray="3,3" /></svg>`
  },
  {
    name: 'Upper Back',
    code: 'UPPER_BACK',
    maximumColours: 4,
    sortOrder: 5,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,20 L58,20 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><rect x="32" y="26" width="36" height="15" rx="2" stroke-dasharray="3,3" /></svg>`
  },
  {
    name: 'Left Sleeve',
    code: 'LEFT_SLEEVE',
    maximumColours: 2,
    sortOrder: 6,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,22 L58,22 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><path d="M20,20 L15,40" stroke-dasharray="3,3" /><circle cx="16" cy="30" r="5" stroke-dasharray="3,3" /></svg>`
  },
  {
    name: 'Right Sleeve',
    code: 'RIGHT_SLEEVE',
    maximumColours: 2,
    sortOrder: 7,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,22 L58,22 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><path d="M80,20 L85,40" stroke-dasharray="3,3" /><circle cx="84" cy="30" r="5" stroke-dasharray="3,3" /></svg>`
  },
  {
    name: 'Neck',
    code: 'NECK',
    maximumColours: 1,
    sortOrder: 8,
    iconSvg: `<svg viewBox="0 0 100 100" class="w-full h-full stroke-current fill-none" stroke-width="1.5"><path d="M20,20 L35,15 L42,22 L58,22 L65,15 L80,20 L75,55 L65,85 L35,85 L25,55 Z" /><ellipse cx="50" cy="22" rx="8" ry="4" stroke-dasharray="3,3" /></svg>`
  },
];

const PRICING_TIERS = [
  { name: '25–49', minQuantity: 25, maxQuantity: 49, discountPercent: 0, sortOrder: 1 },
  { name: '50–99', minQuantity: 50, maxQuantity: 99, discountPercent: 5, sortOrder: 2 },
  { name: '100–249', minQuantity: 100, maxQuantity: 249, discountPercent: 10, sortOrder: 3 },
  { name: '250+', minQuantity: 250, maxQuantity: undefined, discountPercent: 15, sortOrder: 4 },
];

async function seed() {
  await connectDatabase();
  logger.info('Starting database seed...');

  // Admin
  if (env.SEED_ADMIN_EMAIL && env.SEED_ADMIN_PASSWORD) {
    try {
      await createAdmin(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD, 'Admin User', 'superadmin');
      logger.info('Admin user created');
    } catch {
      logger.info('Admin user already exists');
    }
  }

  // Categories
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({ ...cat, slug, isActive: true });
      logger.info(`Created category: ${cat.name}`);
    }
    categoryMap.set(cat.name, category._id.toString());
  }

  // Garment Categories
  const garmentCategoryMap = new Map<string, string>();
  for (const gcat of GARMENT_CATEGORIES) {
    const slug = slugify(gcat.name);
    let garmentCategory = await GarmentCategory.findOne({ slug });
    if (!garmentCategory) {
      garmentCategory = await GarmentCategory.create({ ...gcat, slug, isActive: true });
      logger.info(`Created garment category: ${gcat.name}`);
    }
    garmentCategoryMap.set(gcat.name, garmentCategory._id.toString());
  }

  // Print locations
  const locationMap = new Map<string, string>();
  for (const loc of PRINT_LOCATIONS) {
    let location = await PrintLocation.findOne({ code: loc.code });
    if (!location) {
      location = await PrintLocation.create({ ...loc, isActive: true });
      logger.info(`Created print location: ${loc.name}`);
    } else {
      location.iconSvg = loc.iconSvg;
      location.maximumColours = loc.maximumColours;
      await location.save();
      logger.info(`Updated print location metadata: ${loc.name}`);
    }
    locationMap.set(loc.code, location._id.toString());
  }

  // Pricing tiers
  for (const tier of PRICING_TIERS) {
    const existing = await PricingTier.findOne({ name: tier.name });
    if (!existing) {
      await PricingTier.create({ ...tier, isActive: true });
      logger.info(`Created pricing tier: ${tier.name}`);
    }
  }

  // Sample print pricing rules
  const fullFrontId = locationMap.get('FULL_FRONT');
  if (fullFrontId) {
    for (const colourCount of [1, 2, 3, 4]) {
      const existing = await PrintPricingRule.findOne({ printLocation: fullFrontId, colourCount });
      if (!existing) {
        await PrintPricingRule.create({
          printLocation: fullFrontId,
          colourCount,
          minQuantity: 25,
          pricePerUnit: 1.5 + (colourCount - 1) * 0.75,
          setupCharge: colourCount * 15,
          isActive: true,
        });
      }
    }
  }

  // Products
  for (const sp of SAMPLE_PRODUCTS) {
    const categoryId = categoryMap.get(sp.category);
    const garmentCategoryId = garmentCategoryMap.get(sp.garmentCategory);
    if (!categoryId) continue;

    let product = await Product.findOne({ sku: sp.sku });
    if (!product) {
      const productImages = sp.colours.map(c => c.image).filter(Boolean) as string[];
      product = await Product.create({
        name: sp.name,
        slug: slugify(sp.name),
        sku: sp.sku,
        brandName: sp.brandName,
        category: categoryId,
        garmentCategory: garmentCategoryId,
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
        plusSizeAvailable: sp.plusSizeAvailable ?? false,
        images: productImages,
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
            stock: Math.floor(Math.random() * 500) + 50,
            image: colour.image,
            isActive: true,
          });
        }
      }
    } else {
      if (garmentCategoryId) {
        product.garmentCategory = garmentCategoryId as any;
        await product.save();
        logger.info(`Updated product garment category for: ${sp.name}`);
      }
    }
  }

  logger.info('Database seed completed successfully');
  await disconnectDatabase();
}

seed().catch((error) => {
  logger.error('Seed failed', error);
  process.exit(1);
});
