import { GarmentCategory, IGarmentCategory } from '../models/GarmentCategory';
import { slugify } from '@printfection/shared';
import { ApiError } from '../utils/ApiError';

export async function listGarmentCategories(activeOnly = true): Promise<IGarmentCategory[]> {
  const filter = activeOnly ? { isActive: true } : {};
  return GarmentCategory.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function getGarmentCategoryById(id: string): Promise<IGarmentCategory> {
  const category = await GarmentCategory.findById(id);
  if (!category) throw ApiError.notFound('Garment Category not found');
  return category;
}

export async function createGarmentCategory(data: Partial<IGarmentCategory>): Promise<IGarmentCategory> {
  const slug = data.slug || slugify(data.name!);
  const existing = await GarmentCategory.findOne({ slug });
  if (existing) throw ApiError.conflict('Garment Category slug already exists');
  return GarmentCategory.create({ ...data, slug });
}

export async function updateGarmentCategory(id: string, data: Partial<IGarmentCategory>): Promise<IGarmentCategory> {
  const category = await GarmentCategory.findById(id);
  if (!category) throw ApiError.notFound('Garment Category not found');
  Object.assign(category, data);
  await category.save();
  return category;
}

export async function deleteGarmentCategory(id: string): Promise<void> {
  const category = await GarmentCategory.findById(id);
  if (!category) throw ApiError.notFound('Garment Category not found');
  category.isActive = false;
  await category.save();
}
