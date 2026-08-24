import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useBulkOrderStore } from '../../store/bulkOrderStore';
import { formatCurrency } from '@printfection/shared';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/common/LoadingSpinner';
import type { CartData } from '../../types';

export function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);
  const loadCartItem = useBulkOrderStore((s) => s.loadCartItem);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const result = await apiGet<CartData>('/cart');
      setCart(result);
      return result;
    },
  });

  const removeMutation = useMutation({
    mutationFn: (index: number) => apiDelete(`/cart/items/${index}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // Query design configurations for previews
  const { data: designs } = useQuery({
    queryKey: ['cart-designs', data?.cart.items],
    queryFn: async () => {
      const designIds = (data?.cart.items || []).map(item => item.designId).filter(Boolean);
      if (designIds.length === 0) return {};
      const designPromises = designIds.map(id => apiGet<any>(`/designs/${id}`));
      const results = await Promise.all(designPromises);
      return results.reduce((acc, d) => {
        if (d && d._id) acc[d._id] = d;
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!data?.cart.items?.length,
  });

  if (isLoading) return <LoadingSpinner label="Loading cart..." />;
  if (error) return <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />;

  const items = data?.cart.items ?? [];
  const totals = data?.totals;

  const handleEdit = (item: any, index: number) => {
    if (item.isBulkOrder) {
      loadCartItem(item, index);
      navigate('/bulk-order');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <EmptyState
          title="Your cart is empty"
          description="Configure a bulk or single custom order to get started."
          action={
            <div className="flex gap-4 justify-center">
              <Link to="/bulk-order" className="bg-[#FF007F] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3.5 hover:bg-[#e60072] transition-colors">Start Bulk Order</Link>
              <Link to="/single-order" className="border border-[#333] hover:border-white text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3.5 transition-all">Start Single Custom</Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      {/* Header */}
      <div className="mb-10 border-b border-neutral-200 pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF007F] mb-2">Shopping Cart</p>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-black">Your Cart</h1>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item, index) => {
          const itemDesign = designs?.[item.designId || ''];
          // Try to grab first preview url
          const locations = itemDesign?.configuration?.locations || {};
          const firstLocKey = Object.keys(locations)[0];
          const previewUrl = firstLocKey ? locations[firstLocKey]?.previewUrl : null;

          return (
            <div key={index} className="bg-white border border-neutral-200 p-6 transition-all duration-300 hover:border-black flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-sm">
              <div className="flex gap-4 items-center">
                {/* Custom Design Preview Thumbnail */}
                {previewUrl ? (
                  <div className="w-16 h-20 bg-neutral-50 border border-neutral-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={previewUrl} alt={item.productName} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-20 bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-neutral-400 text-2xl">apparel</span>
                  </div>
                )}
                <div>
                  <h3 className="font-display font-bold text-black text-base uppercase tracking-tight">{item.productName}</h3>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#FF007F] mt-1">Colour: {item.colourName}</p>
                  
                  {/* Variants size & counts */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.variants.filter((v) => v.quantity > 0).map((v, idx) => (
                      <span key={`${v.size}-${v.variantId}-${idx}`} className="bg-neutral-100 border border-neutral-200 px-2 py-0.5 font-mono text-[9px] text-neutral-700 uppercase">
                        {v.size}: {v.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between w-full md:w-auto border-t md:border-t-0 border-neutral-200 pt-4 md:pt-0 gap-4">
                {item.pricingSnapshot ? (
                  <div className="text-left md:text-right">
                    <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.1em]">Total price</p>
                    <p className="font-display font-black text-xl text-black mt-1">
                      {formatCurrency(item.pricingSnapshot.total, item.pricingSnapshot.currency)}
                    </p>
                  </div>
                ) : (
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500">Pricing pending</span>
                )}
                <div className="flex gap-2">
                  {item.isBulkOrder && (
                    <button
                      onClick={() => handleEdit(item, index)}
                      className="font-mono text-[9px] uppercase tracking-[0.15em] text-black hover:bg-neutral-50 border border-black px-2.5 py-1.5 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => removeMutation.mutate(index)}
                    className="font-mono text-[9px] uppercase tracking-[0.15em] text-red-600 hover:text-red-500 transition-colors flex items-center gap-1 border border-red-200 bg-red-50 px-2.5 py-1.5"
                  >
                    Remove [X]
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary Card */}
      {totals && (
        <div className="bg-white border border-neutral-200 p-6 mb-8 flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-display font-bold text-black text-sm uppercase tracking-tight">
              Total ({totals.itemCount} item{totals.itemCount !== 1 ? 's' : ''})
            </h3>
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500 mt-1">Including VAT &amp; standard shipping</p>
          </div>
          <div className="text-right">
            <span className="font-display font-black text-2xl text-[#FF007F]">
              {formatCurrency(totals.total, totals.currency)}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/bulk-order"
          className="border border-black hover:bg-neutral-50 text-black font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-3.5 transition-all text-center flex-1 sm:flex-none"
        >
          Add More Items
        </Link>
        <Link
          to="/checkout"
          className="bg-black hover:bg-neutral-800 text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3.5 transition-all text-center flex-1 sm:flex-none"
        >
          Proceed to Checkout
        </Link>
        <Link
          to="/checkout?mode=quote"
          className="bg-[#FF007F] hover:bg-[#e60072] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3.5 transition-all text-center flex-1 sm:flex-none"
        >
          Request Quote
        </Link>
      </div>
    </div>
  );
}
