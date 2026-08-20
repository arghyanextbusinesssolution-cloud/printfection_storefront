import { Category, ICategory } from '../models/Category';
import { slugify } from '@printfection/shared';
import { ApiError } from '../utils/ApiError';

export async function listCategories(activeOnly = true): Promise<ICategory[]> {
  const filter = activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function getCategoryById(id: string): Promise<ICategory> {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

export async function createCategory(data: Partial<ICategory>): Promise<ICategory> {
  const slug = data.slug || slugify(data.name!);
  const existing = await Category.findOne({ slug });
  if (existing) throw ApiError.conflict('Category slug already exists');
  return Category.create({ ...data, slug });
}

export async function updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory> {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  Object.assign(category, data);
  await category.save();
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  category.isActive = false;
  await category.save();
}
