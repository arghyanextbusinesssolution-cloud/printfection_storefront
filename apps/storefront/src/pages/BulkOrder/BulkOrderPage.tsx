import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../services/api';
import { useBulkOrderStore } from '../../store/bulkOrderStore';
import { useCartStore } from '../../store/cartStore';
import { BulkOrderSteps } from '../../components/bulk-order/BulkOrderSteps';
import { SizeQuantityGrid } from '../../components/bulk-order/SizeQuantityGrid';
import { PrintLocationSelector } from '../../components/bulk-order/PrintLocationSelector';
import { PricingSummary } from '../../components/bulk-order/PricingSummary';
import { LoadingSpinner, ErrorMessage } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '@printfection/shared';
import type { Product, BulkOrderSize, PrintLocation } from '../../types';
import type { PaginatedResponse, PricingBreakdown } from '@printfection/types';
import { DesignStudioAdapter } from '../../components/design/DesignStudioAdapter';

export function BulkOrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProduct = searchParams.get('product');
  const [addError, setAddError] = useState('');

  const store = useBulkOrderStore();
  const setCart = useCartStore((s) => s.setCart);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [store.step]);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-bulk'],
    queryFn: () => apiGet<PaginatedResponse<Product>>('/products', { limit: 100 }),
  });

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['bulk-config', store.productId],
    queryFn: () => apiGet<{
      product: { id: string; name: string; minimumOrderQuantity: number; currency: string };
      colours: { name: string; hex?: string; image?: string }[];
    }>(`/bulk-order/config/${store.productId}`),
    enabled: !!store.productId && store.step >= 2,
  });

  const { data: sizesData, isLoading: loadingSizes } = useQuery({
    queryKey: ['bulk-sizes', store.productId, store.colourName],
    queryFn: () => apiGet<{ minimumOrderQuantity: number; sizes: BulkOrderSize[] }>(
      `/bulk-order/sizes/${store.productId}/${encodeURIComponent(store.colourName!)}`
    ),
    enabled: !!store.productId && !!store.colourName && store.step >= 3,
  });

  const { data: printLocations } = useQuery({
    queryKey: ['print-locations'],
    queryFn: () => apiGet<PrintLocation[]>('/print-locations'),
    enabled: store.step >= 4,
  });

  const { data: designData } = useQuery({
    queryKey: ['order-design', store.designId],
    queryFn: () => apiGet<{ configuration?: { locations?: Record<string, { previewUrl?: string; elements?: any[] }> } }>(`/designs/${store.designId}`),
    enabled: !!store.designId && store.step === 6,
  });

  const pricingMutation = useMutation({
    mutationFn: (payload: {
      productId: string;
      variants: { variantId: string; size: string; quantity: number }[];
      printLocations: { locationId: string; colourCount: number }[];
    }) => apiPost<PricingBreakdown>('/pricing/calculate', payload),
    onSuccess: (data) => store.setPricing(data),
  });

  const validateMutation = useMutation({
    mutationFn: () => {
      const variants = buildVariants();
      return apiPost<{ valid: boolean; errors: string[] }>('/bulk-order/validate', {
        productId: store.productId,
        colourName: store.colourName,
        variants,
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: () => {
      const variants = buildVariants();
      return apiPost('/cart/items', {
        productId: store.productId,
        productName: store.productName,
        colourName: store.colourName,
        colourHex: store.colourHex,
        variants,
        printLocations: store.getPrintLocationsPayload(),
        designId: store.designId,
      });
    },
    onSuccess: async () => {
      const cartData = await apiGet('/cart');
      setCart(cartData as Parameters<typeof setCart>[0]);
      store.reset();
      navigate('/cart');
    },
    onError: (err) => setAddError(err instanceof Error ? err.message : 'Failed to add to cart'),
  });

  function buildVariants() {
    if (!sizesData) return [];
    return sizesData.sizes
      .filter((s) => (store.quantities[s.size] || 0) > 0)
      .map((s) => ({
        variantId: s.variantId,
        size: s.size,
        quantity: store.quantities[s.size],
      }));
  }

  function calculatePricing() {
    pricingMutation.mutate({
      productId: store.productId!,
      variants: buildVariants(),
      printLocations: store.getPrintLocationsPayload(),
    });
  }

  useEffect(() => {
    if (preselectedProduct && !store.productId && products?.items) {
      const product = products.items.find((p) => p._id === preselectedProduct);
      if (product) store.setProduct(product._id, product.name);
    }
  }, [preselectedProduct, products, store.productId]);

  useEffect(() => {
    if (store.step === 6 && !store.pricing && sizesData) {
      calculatePricing();
    }
  }, [store.step]);

  const total = store.getTotalQuantity();
  const minQty = sizesData?.minimumOrderQuantity ?? config?.product.minimumOrderQuantity ?? 25;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF007F] mb-2">Custom Garment Printing</p>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white">Bulk Order</h1>
        <p className="mt-2 text-[#777] font-mono text-xs uppercase tracking-widest">Configure your garment order step by step</p>
      </div>

      <BulkOrderSteps />

      {store.step === 1 && (
        <section>
          <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white mb-6">Choose a Product</h2>
          {loadingProducts ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products?.items.map((product) => {
                const isSelected = store.productId === product._id;
                const firstImage = product.images?.[0];
                return (
                  <button
                    key={product._id}
                    onClick={() => store.setProduct(product._id, product.name)}
                    className={`bg-[#111] border text-left transition-all duration-200 group overflow-hidden ${
                      isSelected
                        ? 'border-[#FF007F] shadow-[0_0_24px_rgba(255,0,127,0.2)]'
                        : 'border-[#333] hover:border-[#FF007F]'
                    }`}
                  >
                    {/* Product image */}
                    <div className="relative h-52 bg-[#0d0d0d] overflow-hidden">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-[#222]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Selected badge */}
                      {isSelected && (
                        <span className="absolute top-3 right-3 bg-[#FF007F] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white">
                          ✓ Selected
                        </span>
                      )}
                      {/* Category badge */}
                      {product.organic && (
                        <span className="absolute top-3 left-3 bg-black/70 border border-[#333] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#22c55e]">
                          Organic
                        </span>
                      )}
                    </div>

                    {/* Text info */}
                    <div className="p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF007F] mb-1">{product.brandName}</p>
                      <h3 className="font-display font-bold text-white text-base uppercase tracking-tight group-hover:text-[#FF007F] transition-colors">{product.name}</h3>
                      <p className="font-mono text-[10px] text-[#555] mt-2 uppercase tracking-widest">
                        From {formatCurrency(product.basePrice, product.currency)} · MOQ {product.minimumOrderQuantity}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}


      {store.step === 2 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white">
              Choose Colour — <span className="text-[#FF007F]">{store.productName}</span>
            </h2>
            <button onClick={() => store.setStep(1)} className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#FF007F] hover:text-white transition-colors">Change product</button>
          </div>
          {loadingConfig ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {config?.colours.map((colour) => {
                const isSelected = store.colourName === colour.name;
                const isLight = colour.hex && (
                  parseInt(colour.hex.slice(1,3),16)*0.299 +
                  parseInt(colour.hex.slice(3,5),16)*0.587 +
                  parseInt(colour.hex.slice(5,7),16)*0.114
                ) > 160;
                return (
                  <button
                    key={colour.name}
                    onClick={() => store.setColour(colour.name, colour.hex)}
                    className={`relative h-32 overflow-hidden border-2 transition-all duration-200 group ${
                      isSelected
                        ? 'border-[#FF007F] shadow-[0_0_20px_rgba(255,0,127,0.3)] scale-[1.02]'
                        : 'border-[#333] hover:border-[#666]'
                    }`}
                    style={{ backgroundColor: colour.hex || '#333' }}
                  >
                    {/* Subtle dark gradient at bottom for legibility */}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Colour name label */}
                    <span className={`absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.15em] z-10 ${
                      isLight ? 'text-[#111]' : 'text-white'
                    }`}>
                      {colour.name}
                    </span>
                    {/* Selected checkmark */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-[#FF007F] flex items-center justify-center z-10">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {store.step === 3 && (
        <section>
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Sizes & Quantities — {store.colourName}</h2>
            <button onClick={() => store.setStep(2)} className="text-sm text-brand-accent hover:underline">Change colour</button>
          </div>
          {loadingSizes ? <LoadingSpinner /> : sizesData ? (
            <>
              <SizeQuantityGrid sizes={sizesData.sizes} quantities={store.quantities}
                minimumOrderQuantity={minQty} currency={config?.product.currency || 'GBP'}
                onQuantityChange={store.setQuantity} />
              <div className="mt-8 flex justify-between">
                <button onClick={() => store.setStep(2)} className="btn-outline text-sm">Back</button>
                <button onClick={() => store.setStep(4)} disabled={total < minQty} className="btn-primary text-sm">
                  Configure Printing
                </button>
              </div>
            </>
          ) : <ErrorMessage message="No sizes available" />}
        </section>
      )}

      {store.step === 4 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white">Print Locations</h2>
            <button onClick={() => store.setStep(3)} className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#FF007F] hover:text-white transition-colors">Back to sizes</button>
          </div>
          {printLocations ? (
            <>
              <PrintLocationSelector locations={printLocations} />
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555] mt-4">Select print locations and colour counts, or skip if no printing required.</p>
              <div className="mt-8 flex justify-between">
                <button onClick={() => store.setStep(3)} className="border border-[#333] text-[#888] font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-[#666] hover:text-white transition-all">Back</button>
                <button onClick={() => store.setStep(5)} className="bg-[#FF007F] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-2.5 hover:bg-[#e60072] transition-colors">Continue to Design</button>
              </div>
            </>
          ) : <LoadingSpinner />}
        </section>
      )}

      {store.step === 5 && (
        <section>
          {store.printLocations.length === 0 ? (
            <div className="bg-[#111] border border-[#222] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 border border-[#333] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mb-2">No Printing Required</h3>
              <p className="font-mono text-[10px] text-[#555] mb-6 max-w-sm mx-auto">
                You have not selected any print locations in Step 4. You can skip designing and review your order.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => store.setStep(4)} className="border border-[#333] text-[#888] font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-[#666] hover:text-white transition-all">Back</button>
                <button onClick={() => store.setStep(6)} className="bg-[#FF007F] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-2.5 hover:bg-[#e60072] transition-colors">Continue to Summary</button>
              </div>
            </div>
          ) : (
            <DesignStudioAdapter
              productId={store.productId!}
              productName={store.productName}
              colourName={store.colourName}
              colourImage={config?.colours.find(c => c.name === store.colourName)?.image || null}
              selectedLocations={store.printLocations}
              designId={store.designId}
              onSave={(id) => {
                store.setDesignId(id);
                store.setStep(6);
              }}
              onBack={() => store.setStep(4)}
            />
          )}
        </section>
      )}


      {store.step === 6 && sizesData && (
        <section>
          <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white mb-6">Order Summary</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#111] border border-[#222] p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF007F] mb-1">Order Details</p>
              <h3 className="font-display font-black text-white uppercase tracking-tight text-base mb-1">{store.productName}</h3>
              <p className="font-mono text-[11px] text-[#555] mb-4">Colour: {store.colourName}</p>
              {store.printLocations.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555] mb-2">Print locations &amp; Designs:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {store.printLocations.map((l) => {
                      const locationDesign = (designData?.configuration as any)?.locations?.[l.locationId];
                      return (
                        <div key={l.locationId} className="border border-[#222] bg-[#0d0d0d] p-3 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="font-display font-bold text-white text-xs uppercase tracking-tight">{l.locationName}</span>
                            <span className="font-mono text-[9px] uppercase text-[#FF007F]">{l.colourCount} Col</span>
                          </div>
                          {locationDesign?.previewUrl ? (
                            <div className="relative border border-[#222] bg-[#151515] h-28 overflow-hidden flex items-center justify-center">
                              <img src={locationDesign.previewUrl} alt={l.locationName} className="max-w-full max-h-full object-contain" />
                            </div>
                          ) : (
                            <div className="relative border border-[#222] bg-[#151515] h-28 flex items-center justify-center text-[#333] font-mono text-[9px] uppercase tracking-wider">
                              No Design Created
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <table className="w-full mt-2">
                <thead>
                  <tr className="border-b border-[#333]">
                    <th className="text-left py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Size</th>
                    <th className="text-right py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {sizesData.sizes.filter((s) => (store.quantities[s.size] || 0) > 0).map((s) => (
                    <tr key={s.size} className="border-b border-[#1a1a1a]">
                      <td className="py-2 font-display font-bold text-white text-sm uppercase">{s.size}</td>
                      <td className="text-right py-2 font-mono text-[11px] text-[#aaa]">{store.quantities[s.size]}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#333]">
                    <td className="py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#666]">Total</td>
                    <td className="text-right py-3 font-display font-black text-white">{total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {pricingMutation.isPending && <LoadingSpinner label="Calculating price..." />}
            {store.pricing && <PricingSummary pricing={store.pricing} />}
          </div>

          {validateMutation.data && !validateMutation.data.valid && (
            <div className="mt-4 p-4 bg-red-950/50 border border-red-800" role="alert">
              <ul className="font-mono text-[11px] text-red-400 list-disc list-inside space-y-1">
                {validateMutation.data.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {addError && <p className="mt-4 font-mono text-[11px] text-red-400">{addError}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => store.setStep(5)} className="border border-[#333] text-[#888] font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-[#666] hover:text-white transition-all">Back</button>
            <button onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending} className="border border-[#333] text-[#888] font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-[#666] hover:text-white transition-all disabled:opacity-30">
              Validate
            </button>
            <button onClick={() => calculatePricing()} disabled={pricingMutation.isPending} className="border border-[#333] text-[#888] font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-[#666] hover:text-white transition-all disabled:opacity-30">
              Recalculate Price
            </button>
            <button onClick={() => addToCartMutation.mutate()} disabled={addToCartMutation.isPending || total < minQty}
              className="bg-[#FF007F] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-2.5 hover:bg-[#e60072] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={store.reset} className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#444] hover:text-[#888] transition-colors">Start Over</button>
          </div>
        </section>
      )}
    </div>
  );
}
