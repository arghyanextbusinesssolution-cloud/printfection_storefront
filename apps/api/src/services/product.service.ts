import { FilterQuery, SortOrder } from 'mongoose';
import { slugify } from '@printfection/shared';
import { Product, IProduct } from '../models/Product';
import { ProductVariant, IProductVariant } from '../models/ProductVariant';
import { Category } from '../models/Category';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, parsePaginationParams } from '../utils/pagination';
import type { FilterOptions, PaginatedResponse } from '@printfection/types';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  category?: string;
  garmentCategory?: string;
  brand?: string;
  gender?: string;
  organic?: boolean;
  fabric?: string;
  weight?: string;
  accreditations?: string;
  tags?: string;
  plusSizeAvailable?: boolean;
  ageGroup?: string;
  search?: string;
  sort?: string;
  isActive?: boolean;
}

function buildProductFilter(query: ProductListQuery): FilterQuery<IProduct> {
  const filter: FilterQuery<IProduct> = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  } else {
    filter.isActive = true;
  }

  if (query.category) filter.category = query.category;
  if (query.garmentCategory) filter.garmentCategory = query.garmentCategory;
  if (query.brand) filter.brandName = new RegExp(query.brand, 'i');
  if (query.gender) filter.gender = query.gender;
  if (query.organic !== undefined) filter.organic = query.organic;
  if (query.fabric) filter.fabric = query.fabric;
  if (query.weight) filter.weight = query.weight;
  if (query.plusSizeAvailable !== undefined) filter.plusSizeAvailable = query.plusSizeAvailable;
  if (query.ageGroup) filter.ageGroup = query.ageGroup;
  if (query.accreditations) filter.accreditations = query.accreditations;
  if (query.tags) filter.tags = query.tags;
  if (query.search) filter.$text = { $search: query.search };

  return filter;
}

function buildSort(sort?: string): Record<string, SortOrder> {
  switch (sort) {
    case 'price-asc':
      return { basePrice: 1 };
    case 'price-desc':
      return { basePrice: -1 };
    case 'name-asc':
      return { name: 1 };
    case 'name-desc':
      return { name: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { name: 1 };
  }
}

export async function listProducts(
  query: ProductListQuery
): Promise<PaginatedResponse<IProduct>> {
  const { page, limit, skip } = parsePaginationParams(query.page, query.limit);
  const filter = buildProductFilter(query);
  const sort = buildSort(query.sort);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('garmentCategory', 'name slug icon iconSvg')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items: items as unknown as IProduct[],
    pagination: buildPaginationMeta(page, limit, total),
  };
}

export async function getProductById(id: string): Promise<IProduct> {
  const product = await Product.findById(id)
    .populate('category', 'name slug')
    .populate('garmentCategory', 'name slug icon iconSvg')
    .lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product as unknown as IProduct;
}

export async function getProductBySlug(slug: string): Promise<IProduct> {
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug')
    .populate('garmentCategory', 'name slug icon iconSvg')
    .lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product as unknown as IProduct;
}

export async function getProductVariants(productId: string): Promise<IProductVariant[]> {
  const variants = await ProductVariant.find({ product: productId, isActive: true }).lean();
  return variants as unknown as IProductVariant[];
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const [brands, genders, fabrics, weights, accreditations, tags, ageGroups, colours] =
    await Promise.all([
      Product.distinct('brandName', { isActive: true }),
      Product.distinct('gender', { isActive: true, gender: { $ne: null } }),
      Product.distinct('fabric', { isActive: true, fabric: { $ne: null } }),
      Product.distinct('weight', { isActive: true, weight: { $ne: null } }),
      Product.distinct('accreditations', { isActive: true }),
      Product.distinct('tags', { isActive: true }),
      Product.distinct('ageGroup', { isActive: true, ageGroup: { $ne: null } }),
      ProductVariant.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$colourName', hex: { $first: '$colourHex' } } },
        { $project: { name: '$_id', hex: 1, _id: 0 } },
        { $sort: { name: 1 } },
      ]),
    ]);

  return {
    brands: brands.filter(Boolean) as string[],
    colours: colours as { name: string; hex?: string }[],
    genders: genders.filter(Boolean) as string[],
    fabrics: fabrics.filter(Boolean) as string[],
    weights: weights.filter(Boolean) as string[],
    accreditations: accreditations.filter(Boolean) as string[],
    tags: tags.filter(Boolean) as string[],
    ageGroups: ageGroups.filter(Boolean) as string[],
  };
}

export async function createProduct(data: Partial<IProduct>): Promise<IProduct> {
  const slug = data.slug || slugify(data.name!);
  const existing = await Product.findOne({ $or: [{ slug }, { sku: data.sku }] });
  if (existing) throw ApiError.conflict('Product with this slug or SKU already exists');

  const category = await Category.findById(data.category);
  if (!category) throw ApiError.badRequest('Invalid category');

  return Product.create({ ...data, slug });
}

export async function updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');

  if (data.slug && data.slug !== product.slug) {
    const existing = await Product.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) throw ApiError.conflict('Slug already in use');
  }

  Object.assign(product, data);
  await product.save();
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');
  product.isActive = false;
  await product.save();
}

export async function createVariant(
  productId: string,
  data: Partial<IProductVariant>
): Promise<IProductVariant> {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await ProductVariant.findOne({ sku: data.sku });
  if (existing) throw ApiError.conflict('Variant SKU already exists');

  return ProductVariant.create({ ...data, product: productId });
}

export async function updateVariant(
  variantId: string,
  data: Partial<IProductVariant>
): Promise<IProductVariant> {
  const variant = await ProductVariant.findById(variantId);
  if (!variant) throw ApiError.notFound('Variant not found');
  Object.assign(variant, data);
  await variant.save();
  return variant;
}

export async function getVariantsByProduct(productId: string): Promise<IProductVariant[]> {
  return ProductVariant.find({ product: productId }).sort({ colourName: 1, size: 1 });
}

export async function getProductColours(productId: string): Promise<{ name: string; hex?: string; image?: string }[]> {
  const variants = await ProductVariant.find({ product: productId, isActive: true });
  const colourMap = new Map<string, { name: string; hex?: string; image?: string }>();
  variants.forEach((v) => {
    if (!colourMap.has(v.colourName)) {
      colourMap.set(v.colourName, { name: v.colourName, hex: v.colourHex, image: v.image });
    }
  });
  return Array.from(colourMap.values());
}

export async function getProductSizesForColour(
  productId: string,
  colourName: string
): Promise<IProductVariant[]> {
  return ProductVariant.find({ product: productId, colourName, isActive: true }).sort({ size: 1 });
}
