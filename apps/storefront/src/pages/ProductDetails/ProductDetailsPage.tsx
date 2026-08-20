import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { formatCurrency } from '@printfection/shared';
import { LoadingSpinner, ErrorMessage } from '../../components/common/LoadingSpinner';
import type { Product, ProductVariant } from '../../types';

export function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiGet<{ product: Product; variants: ProductVariant[] }>(`/products/slug/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner label="Loading product..." />;
  if (error) return <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />;
  if (!data) return null;

  const { product, variants } = data;
  const colours = [...new Set(variants.map((v) => v.colourName))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div>
          {product.brandName && (
            <p className="text-sm text-brand-gray uppercase tracking-wide">{product.brandName}</p>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-dark mt-1">{product.name}</h1>

          <p className="mt-4 text-2xl font-bold text-brand-dark">
            {formatCurrency(product.basePrice, product.currency)}
            <span className="text-sm font-normal text-brand-gray ml-2">from</span>
          </p>

          <p className="mt-2 text-sm text-brand-gray">
            Minimum order: {product.minimumOrderQuantity} units
          </p>

          {product.shortDescription && (
            <p className="mt-6 text-brand-gray">{product.shortDescription}</p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {product.fabric && (
              <div><dt className="text-brand-gray">Fabric</dt><dd className="font-medium">{product.fabric}</dd></div>
            )}
            {product.weight && (
              <div><dt className="text-brand-gray">Weight</dt><dd className="font-medium">{product.weight}</dd></div>
            )}
            {product.gender && (
              <div><dt className="text-brand-gray">Gender</dt><dd className="font-medium">{product.gender}</dd></div>
            )}
            {product.organic && (
              <div><dt className="text-brand-gray">Organic</dt><dd className="font-medium text-green-600">Yes</dd></div>
            )}
          </dl>

          {colours.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-brand-dark mb-2">Available Colours</h3>
              <div className="flex flex-wrap gap-2">
                {colours.map((colour) => {
                  const variant = variants.find((v) => v.colourName === colour);
                  return (
                    <span
                      key={colour}
                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm"
                    >
                      {variant?.colourHex && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: variant.colourHex }}
                          aria-hidden="true"
                        />
                      )}
                      {colour}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={`/bulk-order?product=${product._id}`} className="btn-primary">
              Configure Bulk Order
            </Link>
          </div>

          {product.description && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <p className="text-brand-gray whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
