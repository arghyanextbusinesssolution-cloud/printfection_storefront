import { useState } from 'react';
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

interface ProductVariantsPanelProps {
  productId: string;
  basePrice: number;
  currency: string;
}

export function ProductVariantsPanel({ productId, basePrice, currency }: ProductVariantsPanelProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    colourName: '',
    colourHex: '#000000',
    size: 'M',
    price: basePrice,
    stock: 100,
  });

  const { data: variants, isLoading } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => apiGet<Variant[]>(`/products/${productId}/variants`),
  });

  const createMutation = useMutation({
    mutationFn: () => apiPost(`/products/${productId}/variants`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      setShowForm(false);
      setForm({ sku: '', colourName: '', colourHex: '#000000', size: 'M', price: basePrice, stock: 100 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: Partial<Variant> }) =>
      apiPut(`/products/variants/${variantId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-variants', productId] }),
  });

  const toggleActive = (variant: Variant) => {
    updateMutation.mutate({ variantId: variant._id, data: { isActive: !variant.isActive } });
  };

  const updateStock = (variant: Variant) => {
    const stock = prompt(`Stock for ${variant.colourName} / ${variant.size}:`, String(variant.stock));
    if (stock !== null) {
      updateMutation.mutate({ variantId: variant._id, data: { stock: parseInt(stock, 10) || 0 } });
    }
  };

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Variants (Colours & Sizes)</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : 'Add Variant'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-3">
          <input placeholder="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field" />
          <input placeholder="Colour name *" value={form.colourName} onChange={(e) => setForm({ ...form, colourName: e.target.value })} className="input-field" />
          <input type="color" value={form.colourHex} onChange={(e) => setForm({ ...form, colourHex: e.target.value })} className="h-10 w-full" title="Colour hex" />
          <input placeholder="Size *" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="input-field" />
          <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} className="input-field" />
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) })} className="input-field" />
          <button
            onClick={() => createMutation.mutate()}
            disabled={!form.sku || !form.colourName || !form.size || createMutation.isPending}
            className="btn-primary text-sm col-span-full md:col-span-1"
          >
            {createMutation.isPending ? 'Adding...' : 'Add Variant'}
          </button>
        </div>
      )}

      {isLoading && <p className="text-brand-gray text-sm">Loading variants...</p>}

      {variants && variants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-2">Colour</th>
                <th className="text-left px-3 py-2">Size</th>
                <th className="text-left px-3 py-2">SKU</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-right px-3 py-2">Stock</th>
                <th className="text-center px-3 py-2">Active</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v._id} className={`border-b border-gray-100 ${!v.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      {v.colourHex && (
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: v.colourHex }} />
                      )}
                      {v.colourName}
                    </span>
                  </td>
                  <td className="px-3 py-2">{v.size}</td>
                  <td className="px-3 py-2 text-brand-gray">{v.sku}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(v.price, currency)}</td>
                  <td className="px-3 py-2 text-right">{v.stock}</td>
                  <td className="px-3 py-2 text-center">{v.isActive ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button onClick={() => updateStock(v)} className="text-brand-accent hover:underline text-xs">Stock</button>
                    <button onClick={() => toggleActive(v)} className="text-brand-gray hover:underline text-xs">
                      {v.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && <p className="text-sm text-brand-gray">No variants yet. Add colour/size combinations above.</p>
      )}
    </section>
  );
}
