import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

interface GarmentCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  iconSvg?: string;
  sortOrder: number;
  isActive: boolean;
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'product' | 'garment'>('product');
  const [showModal, setShowModal] = useState(false);

  // Form states for creating garment categories
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('👕');
  const [iconSvg, setIconSvg] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  // Queries
  const { data: productCategories, isLoading: loadingProduct } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: () => apiGet<Category[]>('/categories', { activeOnly: false }),
    enabled: activeTab === 'product',
  });

  const { data: garmentCategories, isLoading: loadingGarment } = useQuery({
    queryKey: ['admin-garment-categories'],
    queryFn: () => apiGet<GarmentCategory[]>('/garment-categories', { activeOnly: false }),
    enabled: activeTab === 'garment',
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (name: string) => apiPost('/categories', { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] }),
  });

  const createGarmentMutation = useMutation({
    mutationFn: (payload: any) => apiPost('/garment-categories', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-garment-categories'] });
      setShowModal(false);
      resetForm();
    },
  });

  const deleteGarmentMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/garment-categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-garment-categories'] }),
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setIcon('👕');
    setIconSvg('');
    setSortOrder(0);
  };

  const handleAddProductCat = () => {
    const n = prompt('Product Category Name:');
    if (n?.trim()) createProductMutation.mutate(n.trim());
  };

  const handleAddGarmentCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createGarmentMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        iconSvg: iconSvg.trim() || undefined,
        sortOrder,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Category Management</h1>
        {activeTab === 'product' ? (
          <button onClick={handleAddProductCat} className="btn-primary">
            Add Product Category
          </button>
        ) : (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Add Garment Category
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('product')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'product'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Product Categories (Catalog)
          </button>
          <button
            onClick={() => setActiveTab('garment')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'garment'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Garment Categories (Bulk Wizard)
          </button>
        </nav>
      </div>

      {/* Product Categories Tab */}
      {activeTab === 'product' && (
        <>
          {loadingProduct && <p className="text-gray-500">Loading...</p>}
          {productCategories && (
            <div className="bg-white shadow rounded-lg overflow-hidden border">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-150">
                  {productCategories.map((cat) => (
                    <tr key={cat._id}>
                      <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono">{cat.slug}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{cat.sortOrder}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Garment Categories Tab */}
      {activeTab === 'garment' && (
        <>
          {loadingGarment && <p className="text-gray-500">Loading...</p>}
          {garmentCategories && (
            <div className="bg-white shadow rounded-lg overflow-hidden border">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-150">
                  {garmentCategories.map((gcat) => (
                    <tr key={gcat._id}>
                      <td className="px-6 py-4 text-xl">{gcat.icon || '👕'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{gcat.name}</td>
                      <td className="px-6 py-4 text-gray-500">{gcat.description || '-'}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{gcat.sortOrder}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            gcat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {gcat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {gcat.isActive && (
                          <button
                            onClick={() => {
                              if (confirm('Deactivate garment category?')) deleteGarmentMutation.mutate(gcat._id);
                            }}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Garment Category Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-base">Add Garment Category</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAddGarmentCatSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="E.g. T-Shirts & Tops"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Brief summary of category template options..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Interactive SVG Outline (code)
                </label>
                <textarea
                  value={iconSvg}
                  onChange={(e) => setIconSvg(e.target.value)}
                  className="w-full border rounded p-2 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="<svg>...</svg>"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGarmentMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createGarmentMutation.isPending ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
