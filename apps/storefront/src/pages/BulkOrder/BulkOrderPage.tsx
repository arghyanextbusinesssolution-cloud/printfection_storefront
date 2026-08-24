import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../../services/api';
import { useBulkOrderStore } from '../../store/bulkOrderStore';
import { useCartStore } from '../../store/cartStore';
import { BulkOrderSteps } from '../../components/bulk-order/BulkOrderSteps';
import { SizeQuantityGrid } from '../../components/bulk-order/SizeQuantityGrid';
import { PrintLocationSelector } from '../../components/bulk-order/PrintLocationSelector';
import { PrintColourCountGrid } from '../../components/bulk-order/PrintColourCountGrid';
import { PricingSummary } from '../../components/bulk-order/PricingSummary';
import { LoadingSpinner, ErrorMessage } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '@printfection/shared';
import type { Product, BulkOrderSize, PrintLocation, GarmentCategory, ProductVariant } from '../../types';
import type { PaginatedResponse, PricingBreakdown } from '@printfection/types';

export function BulkOrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProduct = searchParams.get('product');
  const [addError, setAddError] = useState('');

  const queryClient = useQueryClient();
  const store = useBulkOrderStore();
  const setCart = useCartStore((s) => s.setCart);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [store.step]);

  // Step 1: Query Garment Categories
  const { data: garmentCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ['garment-categories-bulk'],
    queryFn: () => apiGet<GarmentCategory[]>('/garment-categories'),
  });

  // Step 2: Query Products filtered by Garment Category
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-bulk', store.garmentCategoryId],
    queryFn: () =>
      apiGet<PaginatedResponse<Product>>('/products', {
        limit: 100,
        garmentCategory: store.garmentCategoryId || undefined,
      }),
    enabled: !!store.garmentCategoryId,
  });

  // Step 3: Query Product Colours Config
  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['bulk-config', store.productId],
    queryFn: () =>
      apiGet<{
        product: { id: string; name: string; minimumOrderQuantity: number; currency: string };
        colours: { name: string; hex?: string; image?: string }[];
      }>(`/bulk-order/config/${store.productId}`),
    enabled: !!store.productId && store.step >= 3,
  });

  // Step 4: Query Product Variants (to get accurate variant IDs, stocks & prices per size/colour)
  const { data: variants, isLoading: loadingVariants } = useQuery({
    queryKey: ['product-variants-bulk', store.productId],
    queryFn: () => apiGet<ProductVariant[]>(`/products/${store.productId}/variants`),
    enabled: !!store.productId && store.step >= 4,
  });

  // Step 5: Query Print Locations
  const { data: printLocations, isLoading: loadingLocations } = useQuery({
    queryKey: ['print-locations-bulk'],
    queryFn: () => apiGet<PrintLocation[]>('/print-locations'),
    enabled: store.step >= 5,
  });

  const pricingMutation = useMutation({
    mutationFn: (payload: {
      productId: string;
      variants: { variantId: string; size: string; quantity: number }[];
      printLocations: { locationId: string; colourCount: number }[];
    }) => apiPost<PricingBreakdown>('/pricing/calculate', payload),
    onSuccess: (data) => store.setPricing(data),
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      // Send the unified bulk order payload
      const payload = {
        isBulkOrder: true,
        productId: store.productId,
        productName: store.productName,
        colours: store.selectedColours.map((c) => ({
          colourName: c.colourName,
          colourHex: c.colourHex,
          colourImage: c.colourImage,
          variants: c.variants,
        })),
        printLocations: store.getPrintLocationsPayload(),
        artworks: store.artworks || [], // preserve existing artworks when editing!
      };

      if (store.editItemIndex !== null) {
        // Delete original item first
        await apiDelete(`/cart/items/${store.editItemIndex}`);
      }

      return apiPost('/cart/items', payload);
    },
    onSuccess: async () => {
      const cartData = await apiGet('/cart');
      setCart(cartData as Parameters<typeof setCart>[0]);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['cart-header'] });
      store.reset();
      navigate('/cart');
    },
    onError: (err) => setAddError(err instanceof Error ? err.message : 'Failed to add to cart'),
  });

  // Flat helper to format sizes for SizeQuantityGrid
  const getProductSizes = (): BulkOrderSize[] => {
    if (!variants) return [];
    // Extract unique sizes from the variants list
    const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));
    // Sort them in standard order
    const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    uniqueSizes.sort((a, b) => order.indexOf(a) - order.indexOf(b));

    return uniqueSizes.map((sz) => {
      const match = variants.find((v) => v.size === sz);
      return {
        variantId: match?._id || '',
        size: sz,
        price: match?.price || 0,
        stock: variants.filter((v) => v.size === sz).reduce((max, v) => Math.max(max, v.stock), 0),
        sku: match?.sku || '',
      };
    });
  };

  const calculatePricing = () => {
    pricingMutation.mutate({
      productId: store.productId!,
      variants: store.getVariantsPayload(),
      printLocations: store.getPrintLocationsPayload(),
    });
  };

  // Preselection trigger
  useEffect(() => {
    if (preselectedProduct && !store.productId && products?.items) {
      const prod = products.items.find((p) => p._id === preselectedProduct);
      if (prod) {
        if (prod.garmentCategory) {
          store.setGarmentCategory(prod.garmentCategory._id, prod.garmentCategory.name);
        }
        store.setProduct(prod._id, prod.name, prod.images);
      }
    }
  }, [preselectedProduct, products, store.productId]);

  // Recalculate price when reaching summary step
  useEffect(() => {
    if (store.step === 7 && !store.pricing && variants) {
      calculatePricing();
    }
  }, [store.step]);

  const totalQuantity = store.getTotalQuantity();
  const minQty = config?.product.minimumOrderQuantity || 25;
  const meetsMinimum = totalQuantity >= minQty;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 lg:py-16">
      {/* Editorial Header */}
      <div className="mb-10 text-left">
        <span className="section-label mb-2 block">Custom Clothing Manufacturing</span>
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter text-on-surface leading-none">
          Bulk Custom Order
        </h1>
        <p className="mt-3 text-on-surface-variant font-mono text-[11px] uppercase tracking-widest">
          Premium Production Wizard &middot; Step {store.step} of 7
        </p>
      </div>

      {/* Progress Steps Indicators */}
      <BulkOrderSteps />

      {/* STEP 1: Garment Category Selection */}
      {store.step === 1 && (
        <section className="step-enter">
          <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-on-surface mb-6">
            Select Garment Type
          </h2>
          {loadingCategories ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {garmentCategories?.map((gcat) => {
                const isSelected = store.garmentCategoryId === gcat._id;
                return (
                  <button
                    key={gcat._id}
                    onClick={() => store.setGarmentCategory(gcat._id, gcat.name)}
                    className={`card-interactive p-5 text-left flex items-center gap-5 ${isSelected ? 'card-selected animate-select-pulse' : ''
                      }`}
                  >
                    <span className="text-4xl flex-shrink-0 w-12 h-12 flex items-center justify-center" role="img" aria-label={gcat.name}>
                      {gcat.icon || '👕'}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-on-surface uppercase text-base tracking-tight mb-1">
                        {gcat.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {gcat.description || 'Custom customisation templates available'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* STEP 2: Product Selection (filtered by category) */}
      {store.step === 2 && (
        <section className="step-enter">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-on-surface">
              Choose Product
            </h2>
            <button
              onClick={() => store.setStep(1)}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-magenta hover:text-on-surface transition-colors"
            >
              Back to category
            </button>
          </div>
          {loadingProducts ? (
            <LoadingSpinner />
          ) : products?.items.length === 0 ? (
            <ErrorMessage message="No products found in this category yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products?.items.map((product) => {
                const isSelected = store.productId === product._id;
                const firstImage = product.images?.[0];
                return (
                  <div
                    key={product._id}
                    onClick={() => store.setProduct(product._id, product.name, product.images)}
                    className={`card-interactive text-left group overflow-hidden flex flex-col justify-between cursor-pointer ${isSelected ? 'card-selected animate-select-pulse' : ''
                      }`}
                  >
                    <div>
                      <div className="relative h-56 bg-surface-container overflow-hidden image-zoom-wrap">
                        {firstImage ? (
                          <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-outline">No Image</div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-magenta mb-1 block">
                          {product.brandName}
                        </span>
                        <h3 className="font-display font-bold text-on-surface text-base uppercase tracking-tight mb-2">
                          {product.name}
                        </h3>
                        <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                          From {formatCurrency(product.basePrice, product.currency)} · MOQ {product.minimumOrderQuantity}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-0 flex gap-2 w-full mt-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          store.setProduct(product._id, product.name, product.images);
                        }}
                        className={`flex-1 font-mono text-[10px] uppercase tracking-[0.15em] py-2.5 text-center font-bold transition-all ${isSelected
                            ? 'bg-magenta text-white'
                            : 'bg-black text-white hover:bg-magenta hover:text-black'
                          }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                      <a
                        href={`/products/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="border border-neutral-300 hover:border-black text-black font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2.5 transition-all flex items-center justify-center gap-1.5"
                      >
                        View Product
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* STEP 3: Multiple Garment Colour Selection */}
      {store.step === 3 && (
        <section className="step-enter">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-on-surface">
              Select Garment Colours
            </h2>
            <button
              onClick={() => store.setStep(2)}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-magenta hover:text-on-surface transition-colors"
            >
              Back to products
            </button>
          </div>
          {loadingConfig ? (
            <LoadingSpinner />
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant mb-4">
                Choose one or more fabric colours for your order run:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {config?.colours.map((colour) => {
                  const isSelected = store.selectedColours.some((c) => c.colourName === colour.name);
                  return (
                    <button
                      key={colour.name}
                      onClick={() =>
                        store.toggleColour({
                          colourName: colour.name,
                          colourHex: colour.hex,
                          colourImage: colour.image,
                        })
                      }
                      className={`colour-swatch ${isSelected ? 'colour-swatch-selected' : 'colour-swatch-unselected'
                        }`}
                      style={{ backgroundColor: colour.hex || '#ddd' }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-white">
                        {colour.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-magenta text-white rounded-full flex items-center justify-center border border-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-10 flex justify-between">
                <button onClick={() => store.setStep(2)} className="btn-ghost-dark text-sm">
                  Back
                </button>
                <button
                  onClick={() => store.setStep(4)}
                  disabled={store.selectedColours.length === 0}
                  className="btn-magenta text-sm disabled:opacity-50"
                >
                  Continue to Sizes
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* STEP 4: Size & Quantity Matrix configuration per selected garment colour */}
      {store.step === 4 && (
        <section className="step-enter">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-on-surface">
              Sizes &amp; Quantities
            </h2>
            <button
              onClick={() => store.setStep(3)}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-magenta hover:text-on-surface transition-colors"
            >
              Back to colours
            </button>
          </div>
          {loadingVariants ? (
            <LoadingSpinner />
          ) : (
            <>
              <SizeQuantityGrid
                selectedColours={store.selectedColours}
                sizes={getProductSizes()}
                minimumOrderQuantity={minQty}
                currency={config?.product.currency || 'GBP'}
                onQuantityChange={(col, sz, qty, varId) => {
                  // Map size selection to correct color variant ID
                  const matchVar = variants?.find((v) => v.colourName === col && v.size === sz);
                  store.setColourQuantity(col, sz, qty, matchVar?._id || varId);
                }}
              />
              <div className="mt-10 flex justify-between">
                <button onClick={() => store.setStep(3)} className="btn-ghost-dark text-sm">
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!meetsMinimum) {
                      store.showAlert(`Minimum order quantity is ${minQty} units. Your current total is ${totalQuantity} units. Please adjust your sizes and quantities.`, "Minimum Quantity Required");
                    } else {
                      store.setStep(5);
                    }
                  }}
                  className="btn-magenta text-sm"
                >
                  Continue to Printing
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* STEP 5: Print Location Selection using garment position SVGs */}
      {store.step === 5 && (
        <section className="step-enter">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-on-surface">
              Print Positions
            </h2>
            <button
              onClick={() => store.setStep(4)}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-magenta hover:text-on-surface transition-colors"
            >
              Back to sizes
            </button>
          </div>
          {loadingLocations ? (
            <LoadingSpinner />
          ) : (
            <>
              <PrintLocationSelector locations={printLocations || []} />
              <div className="mt-10 flex justify-between">
                <button onClick={() => store.setStep(4)} className="btn-ghost-dark text-sm">
                  Back
                </button>
                <button
                  onClick={() => store.setStep(store.selectedLocations.length > 0 ? 6 : 7)}
                  className="btn-magenta text-sm"
                >
                  {store.selectedLocations.length > 0 ? 'Continue to Print Colours' : 'Skip to Summary'}
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* STEP 6: Print Colour Count configuration separately for each selected location */}
      {store.step === 6 && (
        <section className="step-enter">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-on-surface">
              Print Colours count
            </h2>
            <button
              onClick={() => store.setStep(5)}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-magenta hover:text-on-surface transition-colors"
            >
              Back to positions
            </button>
          </div>
          <PrintColourCountGrid />
          <div className="mt-10 flex justify-between">
            <button onClick={() => store.setStep(5)} className="btn-ghost-dark text-sm">
              Back
            </button>
            <button onClick={() => store.setStep(7)} className="btn-magenta text-sm">
              Continue to Summary
            </button>
          </div>
        </section>
      )}

      {/* STEP 7: Order Summary (Bypass online studio completely) */}
      {store.step === 7 && (
        <section className="step-enter">
          <h2 className="font-display font-black text-xl uppercase tracking-tighter text-on-surface mb-6">
            Order Review
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Summary details */}
            <div className="space-y-6">
              <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-step">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-magenta mb-1 block">
                  Product
                </span>
                <h3 className="font-display font-black text-on-surface uppercase tracking-tight text-base mb-3">
                  {store.productName}
                </h3>

                {/* Colours and sizes breakdown */}
                <div className="space-y-4">
                  {store.selectedColours.map((colour) => {
                    const totalQty = Object.values(colour.sizeQuantities).reduce((a, b) => a + b, 0);
                    return (
                      <div key={colour.colourName} className="border-t border-outline-variant/60 pt-3 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-outline"
                              style={{ backgroundColor: colour.colourHex || '#ddd' }}
                            />
                            <span className="font-display font-bold text-xs uppercase text-on-surface">
                              {colour.colourName}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-on-surface-variant font-semibold">
                            {totalQty} units
                          </span>
                        </div>
                        {/* Sizes list */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(colour.sizeQuantities)
                            .filter(([, qty]) => qty > 0)
                            .map(([sz, qty]) => (
                              <span key={sz} className="font-mono text-[10px] bg-surface-container-low px-2 py-1 border border-outline-variant text-on-surface font-medium">
                                {sz}: {qty}
                              </span>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Print positions summary */}
              {store.selectedLocations.length > 0 && (
                <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-step">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-magenta mb-3 block">
                    Print customisations
                  </span>
                  <div className="space-y-3">
                    {store.selectedLocations.map((loc) => (
                      <div key={loc.locationId} className="flex justify-between items-center py-2 border-b border-outline-variant/60 last:border-0 last:pb-0">
                        <span className="font-display font-bold text-xs uppercase text-on-surface">
                          {loc.locationName}
                        </span>
                        <span className="font-mono text-[10px] bg-primary-container text-magenta px-2.5 py-0.5 rounded font-bold">
                          {loc.colourCount} Color{loc.colourCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calculations & pricing breakdown */}
            <div className="space-y-6">
              {pricingMutation.isPending && <LoadingSpinner label="Calculating estimate..." />}
              {store.pricing && <PricingSummary pricing={store.pricing} />}

              {addError && <p className="font-mono text-[11px] text-error">{addError}</p>}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => addToCartMutation.mutate()}
                  disabled={addToCartMutation.isPending || totalQuantity < minQty}
                  className="btn-accent py-4 font-display font-black text-sm uppercase tracking-wider"
                >
                  {addToCartMutation.isPending ? 'Adding to Cart...' : 'Add to Shopping Cart'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => store.setStep(store.selectedLocations.length > 0 ? 6 : 5)}
                    className="btn-outline flex-1 text-xs py-3"
                  >
                    Modify configuration
                  </button>
                  <button onClick={store.reset} className="btn-outline flex-1 text-xs py-3 text-error border-error/50 hover:bg-error hover:text-white">
                    Cancel run
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Custom styled store alert modal popup */}
      {store.alertMessage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border-2 border-black max-w-sm w-full p-6 text-left shadow-2xl relative animate-scale-in">
            {/* Close button */}
            <button
              onClick={store.closeAlert}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-display font-black text-xl uppercase text-black tracking-tight mb-3 pr-8 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-magenta inline-block animate-pulse" />
              {store.alertTitle || 'Notice'}
            </h3>

            <p className="font-mono text-[11px] text-neutral-600 mb-6 leading-relaxed">
              {store.alertMessage}
            </p>

            <button
              onClick={store.closeAlert}
              className="bg-black text-white px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-magenta hover:text-black transition-colors w-full text-center font-bold"
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
