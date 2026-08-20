import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiGet, apiPost, apiPut } from '../../services/api';

const productSchema = z.object({
  name: z.string().min(1, 'Name required'),
  sku: z.string().min(1, 'SKU required'),
  brandName: z.string().optional(),
  category: z.string().min(1, 'Category required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  minimumOrderQuantity: z.coerce.number().min(1).default(25),
  organic: z.boolean().optional(),
  gender: z.string().optional(),
  fabric: z.string().optional(),
  weight: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  brandName?: string;
  category: string | { _id: string };
  description?: string;
  shortDescription?: string;
  basePrice: number;
  minimumOrderQuantity: number;
  organic?: boolean;
  gender?: string;
  fabric?: string;
  weight?: string;
  isActive: boolean;
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories', { activeOnly: false }),
  });

  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => apiGet<{ product: Product; variants: unknown[] }>(`/products/${id}`),
    enabled: isEdit,
  });

  const product = productData?.product;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { minimumOrderQuantity: 25, isActive: true },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        brandName: product.brandName || '',
        category: product.category ? (typeof product.category === 'object' ? (product.category as any)?._id || '' : product.category) : '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        basePrice: product.basePrice,
        minimumOrderQuantity: product.minimumOrderQuantity,
        organic: product.organic,
        gender: product.gender || '',
        fabric: product.fabric || '',
        weight: product.weight || '',
        isActive: product.isActive,
      });
    }
  }, [product, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: ProductForm) =>
      isEdit ? apiPut<Product>(`/products/${id}`, data) : apiPost<Product>('/products', data),
    onSuccess: (saved: Product) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      } else {
        navigate(`/products/${saved._id}`);
      }
    },
  });

  if (isEdit && isLoading) return <p className="text-brand-gray">Loading product...</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/products" className="text-sm text-brand-accent hover:underline">← Products</Link>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="card p-6 space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input {...register('name')} className="input-field" />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU *</label>
            <input {...register('sku')} className="input-field" disabled={isEdit} />
            {errors.sku && <p className="text-red-600 text-xs mt-1">{errors.sku.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input {...register('brandName')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select {...register('category')} className="input-field">
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base Price (£) *</label>
            <input type="number" step="0.01" {...register('basePrice')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Order Qty</label>
            <input type="number" {...register('minimumOrderQuantity')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <input {...register('gender')} className="input-field" placeholder="Unisex" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fabric</label>
            <input {...register('fabric')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight</label>
            <input {...register('weight')} className="input-field" placeholder="180gsm" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('organic')} className="rounded" />
              <span className="text-sm">Organic</span>
            </label>
            {isEdit && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="rounded" />
                <span className="text-sm">Active</span>
              </label>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <input {...register('shortDescription')} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows={4} className="input-field" />
          </div>
        </div>
        {saveMutation.error && (
          <p className="text-red-600 text-sm">{(saveMutation.error as Error).message}</p>
        )}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="text-sm text-brand-gray hover:text-brand-dark">
            Cancel
          </button>
        </div>
      </form>

      {isEdit && id && (
        <section className="card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Variant Management</h2>
            <p className="text-sm text-brand-gray mt-1">Manage color and size combinations, SKUs, inventory stock, and variant-specific pricing.</p>
          </div>
          <Link to={`/products/${id}/variants`} className="btn-primary whitespace-nowrap">
            Manage Variants
          </Link>
        </section>
      )}

      {!isEdit && (
        <p className="text-sm text-brand-gray card p-4">
          After creating the product, you will be redirected to add colour/size variants.
        </p>
      )}
    </div>
  );
}
