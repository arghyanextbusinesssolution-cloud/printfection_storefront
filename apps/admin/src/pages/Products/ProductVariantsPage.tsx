import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { formatCurrency } from '@printfection/shared';

interface Variant {
  _id: string;
  sku: string;
  colourName: string;
  colourHex?: string;
  size: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  basePrice: number;
  currency: string;
}

export function ProductVariantsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // State for Create/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  // Form State
  const [formSku, setFormSku] = useState('');
  const [formColourName, setFormColourName] = useState('');
  const [formColourHex, setFormColourHex] = useState('#000000');
  const [formSize, setFormSize] = useState('M');
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(100);
  const [formIsActive, setFormIsActive] = useState(true);
  const [error, setError] = useState('');

  // Fetch product basic info
  const { data: productData } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => apiGet<{ product: Product }>(`/products/${id}`),
    enabled: !!id,
  });
  const product = productData?.product;

  // Fetch variants
  const { data: variants, isLoading } = useQuery({
    queryKey: ['product-variants', id],
    queryFn: () => apiGet<Variant[]>(`/products/${id}/variants`),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => apiPost(`/products/${id}/variants`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', id] });
      closeModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create variant'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: Partial<Variant> }) =>
      apiPut(`/products/variants/${variantId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', id] });
      closeModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to update variant'),
  });

  const openCreateModal = () => {
    setError('');
    setEditingVariant(null);
    setFormSku(`${product?.sku || ''}-`);
    setFormColourName('');
    setFormColourHex('#000000');
    setFormSize('M');
    setFormPrice(product?.basePrice ?? 0);
    setFormStock(100);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (v: Variant) => {
    setError('');
    setEditingVariant(v);
    setFormSku(v.sku);
    setFormColourName(v.colourName);
    setFormColourHex(v.colourHex || '#000000');
    setFormSize(v.size);
    setFormPrice(v.price);
    setFormStock(v.stock);
    setFormIsActive(v.isActive);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVariant(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      sku: formSku,
      colourName: formColourName,
      colourHex: formColourHex,
      size: formSize,
      price: formPrice,
      stock: formStock,
      isActive: formIsActive,
    };

    if (editingVariant) {
      updateMutation.mutate({ variantId: editingVariant._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleActive = (v: Variant) => {
    updateMutation.mutate({ variantId: v._id, data: { isActive: !v.isActive } });
  };

  const currency = product?.currency || 'GBP';

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/products/${id}`} className="text-sm text-brand-accent hover:underline">← Back to Product Details</Link>
        <h1 className="text-2xl font-bold">Manage Variants</h1>
      </div>

      {product && (
        <div className="card p-6 mb-8 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="font-bold text-lg text-brand-dark">{product.name}</h2>
            <p className="text-sm text-brand-gray">Base SKU: <span className="font-semibold text-brand-dark">{product.sku}</span> | Base Price: <span className="font-semibold text-brand-dark">{formatCurrency(product.basePrice, currency)}</span></p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">Add Variant</button>
        </div>
      )}

      {isLoading && <p className="text-brand-gray text-sm">Loading variants...</p>}

      {variants && variants.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-brand-dark">Colour</th>
                <th className="text-left px-4 py-3 font-semibold text-brand-dark">Size</th>
                <th className="text-left px-4 py-3 font-semibold text-brand-dark">SKU</th>
                <th className="text-right px-4 py-3 font-semibold text-brand-dark">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-brand-dark">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-brand-dark">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-brand-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!v.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      {v.colourHex && (
                        <span className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: v.colourHex }} />
                      )}
                      <span className="font-medium text-brand-dark">{v.colourName}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-dark font-medium">{v.size}</td>
                  <td className="px-4 py-3 text-brand-gray font-mono">{v.sku}</td>
                  <td className="px-4 py-3 text-right text-brand-dark font-medium">{formatCurrency(v.price, currency)}</td>
                  <td className="px-4 py-3 text-right text-brand-dark">{v.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {v.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEditModal(v)} className="text-brand-accent hover:underline text-xs font-semibold">Edit</button>
                    <button onClick={() => toggleActive(v)} className="text-brand-gray hover:underline text-xs font-semibold">
                      {v.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && (
          <div className="card p-12 text-center">
            <p className="text-brand-gray">No variants configured for this product yet. Add colour/size combinations above.</p>
          </div>
        )
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-brand-dark/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 bg-white shadow-2xl relative">
            <h3 className="text-lg font-bold text-brand-dark border-b pb-3 mb-4">
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">SKU *</label>
                <input
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="input-field font-mono"
                  placeholder="e.g. PF-TSH-001-BLACK-S"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Colour Name *</label>
                  <input
                    required
                    value={formColourName}
                    onChange={(e) => setFormColourName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Colour Hex Picker</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formColourHex}
                      onChange={(e) => setFormColourHex(e.target.value)}
                      className="h-10 w-12 border rounded cursor-pointer"
                      title="Choose hex code"
                    />
                    <input
                      value={formColourHex}
                      onChange={(e) => setFormColourHex(e.target.value)}
                      className="input-field flex-1 font-mono uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Size *</label>
                  <input
                    required
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    className="input-field"
                    placeholder="e.g. M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value, 10) || 0)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="formIsActive" className="text-sm text-brand-dark font-medium cursor-pointer">Active and visible to customers</label>
              </div>

              {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-md text-sm font-semibold text-brand-gray hover:bg-gray-50 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
