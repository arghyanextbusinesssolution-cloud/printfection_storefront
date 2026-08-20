import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import type { PaginatedResponse } from '@printfection/types';

interface Product {
  _id: string;
  name: string;
  sku: string;
  brandName?: string;
  basePrice: number;
  currency: string;
  minimumOrderQuantity: number;
  isActive: boolean;
  category: { name: string };
}

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () =>
      apiGet<PaginatedResponse<Product>>('/products', {
        search: search || undefined,
        page,
        limit: 20,
        isActive: undefined,
      }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/products/new" className="btn-primary">Add Product</Link>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field max-w-sm"
        />
      </div>

      {isLoading && <p className="text-brand-gray">Loading...</p>}
      {error && <p className="text-red-600">{(error as Error).message}</p>}

      {data && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Brand</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-right px-4 py-3 font-medium">MOQ</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((product) => (
                <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-brand-gray">{product.sku}</td>
                  <td className="px-4 py-3">{product.brandName || '—'}</td>
                  <td className="px-4 py-3">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(product.basePrice, product.currency)}</td>
                  <td className="px-4 py-3 text-right">{product.minimumOrderQuantity}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/products/${product._id}`} className="text-brand-accent hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
