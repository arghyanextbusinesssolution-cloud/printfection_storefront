import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../../services/api';
import { useBulkOrderStore } from '../../store/bulkOrderStore';
import { useCartStore } from '../../store/cartStore';
import { BulkOrderSteps } from '../../components/bulk-order/BulkOrderSteps';
import { GarmentTypeSelector } from '../../components/bulk-order/GarmentTypeSelector';
import { PrintingMethodSelector } from '../../components/bulk-order/PrintingMethodSelector';
import { SizeQuantityGrid } from '../../components/bulk-order/SizeQuantityGrid';
import { PrintLocationSelector } from '../../components/bulk-order/PrintLocationSelector';
import { PrintColourCountGrid } from '../../components/bulk-order/PrintColourCountGrid';
import { PricingSummary } from '../../components/bulk-order/PricingSummary';
import { LoadingSpinner, ErrorMessage } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '@printfection/shared';
import type { Product, BulkOrderSize, PrintLocation, GarmentCategory, ProductVariant } from '../../types';
import type { PaginatedResponse, PricingBreakdown } from '@printfection/types';

const QUANTITY_PRESETS = [25, 50, 100, 250, 500, 1000];

export function BulkOrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProduct = searchParams.get('product');
  const [addError, setAddError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const queryClient = useQueryClient();
  const store = useBulkOrderStore();
  const setCart = useCartStore((s) => s.setCart);

  // Track the highest step reached by user to progressively reveal cards
  const [maxStepReached, setMaxStepReached] = useState(store.step);

  useEffect(() => {
    if (store.step > maxStepReached) {
      setMaxStepReached(store.step);
    }
  }, [store.step, maxStepReached]);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const currentRef = stepRefs.current[store.step];
    if (currentRef) {
      currentRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [store.step]);

  // Query Garment Categories
  const { data: garmentCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ['garment-categories-bulk'],
    queryFn: () => apiGet<GarmentCategory[]>('/garment-categories'),
  });

  // Query Products filtered by Garment Category
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-bulk', store.garmentCategoryId],
    queryFn: () =>
      apiGet<PaginatedResponse<Product>>('/products', {
        limit: 100,
        garmentCategory: store.garmentCategoryId || undefined,
      }),
    enabled: !!store.garmentCategoryId,
  });

  // Query Product Config
  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['bulk-config', store.productId],
    queryFn: () =>
      apiGet<{
        product: { id: string; name: string; minimumOrderQuantity: number; currency: string };
        colours: { name: string; hex?: string; image?: string }[];
      }>(`/bulk-order/config/${store.productId}`),
    enabled: !!store.productId && store.step >= 4,
  });

  // Query Product Variants
  const { data: variants, isLoading: loadingVariants } = useQuery({
    queryKey: ['product-variants-bulk', store.productId],
    queryFn: () => apiGet<ProductVariant[]>(`/products/${store.productId}/variants`),
    enabled: !!store.productId && store.step >= 5,
  });

  // Query Print Locations
  const { data: printLocations, isLoading: loadingLocations } = useQuery({
    queryKey: ['print-locations-bulk'],
    queryFn: () => apiGet<PrintLocation[]>('/print-locations'),
    enabled: store.step >= 7,
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
        artworks: store.artworks || [],
        designId: store.designId || undefined,
      };

      if (store.editItemIndex !== null) {
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

  const getProductSizes = (): BulkOrderSize[] => {
    if (!variants) return [];
    const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));
    const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    uniqueSizes.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return a.localeCompare(b);
    });

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
    if (!store.productId) return;
    pricingMutation.mutate({
      productId: store.productId,
      variants: store.getVariantsPayload(),
      printLocations: store.getPrintLocationsPayload(),
    });
  };

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

  useEffect(() => {
    if (store.step === 9 && !store.pricing && variants && store.productId) {
      calculatePricing();
    }
  }, [store.step]);

  const totalQuantity = store.getTotalQuantity();
  const minQty = config?.product.minimumOrderQuantity || 25;
  const filteredProducts = products?.items.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brandName && p.brandName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderStepHeader = (stepNum: number, title: string, subtitle?: string) => {
    const isCompleted = store.step !== stepNum;

    return (
      <div className="flex items-center justify-between py-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-neutral-900 text-white'
                : 'bg-magenta text-white ring-4 ring-magenta/15 shadow-selected'
            }`}
          >
            {isCompleted ? '✓' : stepNum}
          </div>
          <div>
            <h3 className={`font-display font-black text-lg uppercase tracking-tight text-neutral-900`}>
              {title}
            </h3>
            {subtitle && <p className="text-xs text-neutral-500 font-mono tracking-wide">{subtitle}</p>}
          </div>
        </div>

        {isCompleted && (
          <button
            type="button"
            onClick={() => store.setStep(stepNum)}
            className="text-xs font-mono uppercase tracking-wider text-magenta hover:text-neutral-900 font-bold px-3.5 py-1.5 rounded bg-magenta/5 border border-magenta/20 transition-all hover:bg-magenta/10 cursor-pointer"
          >
            Edit Choice
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 lg:py-12 text-neutral-900">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="text-left">
          <span className="section-label mb-2 block">
            Custom Clothing Manufacturing
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-neutral-900 mt-1">
            Bulk Order Configurator
          </h1>
          <p className="mt-2 text-neutral-600 font-mono text-xs tracking-wide uppercase">
            Complete your configuration on a single guided page &middot; Step {store.step} of 9
          </p>
        </div>

        {/* Delete / Reset All button */}
        {maxStepReached > 1 && (
          <div className="flex-shrink-0 pt-1">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Start Over
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-2.5">
                <span className="font-mono text-xs text-red-700 font-bold">Clear all choices?</span>
                <button
                  type="button"
                  onClick={() => {
                    store.reset();
                    setMaxStepReached(1);
                    setConfirmReset(false);
                  }}
                  className="font-mono text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Yes, Delete All
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:border-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Navigation Header */}
      <BulkOrderSteps />

      <div className="space-y-6">
        {/* STEP 1: QUANTITY */}
        {1 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[1] = el)}
            className={`card transition-all duration-300 ${
              store.step === 1
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(1, '1. Quantity Target', 'Specify the order size upfront')}

              {/* Summary View when not active */}
              {store.step !== 1 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <span>Target Order Quantity: <strong className="text-neutral-900 font-bold text-base">{store.targetQuantity} units</strong></span>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {/* Active Content */}
              {store.step === 1 && (
                <div className="pt-6 space-y-6 step-enter">
                  <p className="text-xs font-mono text-neutral-600 uppercase tracking-wide">
                    Select your required quantity run. Minimum bulk order is <strong className="text-neutral-900 font-bold">25 items</strong>.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {QUANTITY_PRESETS.map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => store.setQuantity(qty)}
                        className={`px-6 py-3.5 rounded-xl font-mono text-sm font-bold border transition-all cursor-pointer ${
                          store.targetQuantity === qty
                            ? 'bg-magenta text-white border-magenta shadow-selected scale-105'
                            : 'bg-white border-neutral-200 text-neutral-800 hover:border-black hover:bg-neutral-50'
                        }`}
                      >
                        {qty} units
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs font-mono uppercase text-neutral-600 font-bold">Custom Quantity:</span>
                    <div className="flex items-center border-2 border-neutral-300 rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => store.setQuantity(Math.max(25, store.targetQuantity - 10))}
                        className="px-4 py-2.5 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 font-mono font-bold transition-colors cursor-pointer"
                      >
                        -10
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={store.targetQuantity}
                        onChange={(e) => store.setQuantity(parseInt(e.target.value) || 25)}
                        className="w-24 text-center bg-transparent py-2 text-neutral-900 font-mono font-bold text-base focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => store.setQuantity(store.targetQuantity + 10)}
                        className="px-4 py-2.5 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 font-mono font-bold transition-colors cursor-pointer"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => store.setStep(2)}
                      className="btn-magenta"
                    >
                      Continue to Garment Type →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: GARMENT TYPE */}
        {2 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[2] = el)}
            className={`card transition-all duration-300 ${
              store.step === 2
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(2, '2. Garment Type', 'Choose apparel category')}

              {store.step !== 2 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <span>Category: <strong className="text-neutral-900 font-bold text-base">{store.garmentCategoryName || 'Selected'}</strong></span>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {store.step === 2 && (
                <div className="pt-6 space-y-6 step-enter">
                  <GarmentTypeSelector
                    categories={garmentCategories || []}
                    selectedCategoryId={store.garmentCategoryId}
                    onSelectCategory={(id, name) => store.setGarmentCategory(id, name)}
                    isLoading={loadingCategories}
                  />

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => store.setStep(1)}
                      className="btn-ghost-dark text-xs"
                    >
                      ← Back to Quantity
                    </button>
                    {store.garmentCategoryId && (
                      <button
                        type="button"
                        onClick={() => store.setStep(3)}
                        className="btn-magenta"
                      >
                        Continue to Products →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: PRODUCT */}
        {3 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[3] = el)}
            className={`card transition-all duration-300 ${
              store.step === 3
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(3, '3. Select Product', 'Choose exact garment model')}

              {store.step !== 3 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <div className="flex items-center gap-3">
                    {store.productImages?.[0] && (
                      <img src={store.productImages[0]} alt={store.productName} className="w-10 h-10 object-cover rounded border border-neutral-200" />
                    )}
                    <span>Product: <strong className="text-neutral-900 font-bold text-base">{store.productName}</strong></span>
                  </div>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {store.step === 3 && (
                <div className="pt-6 step-enter">
                  {/* Step 3 Subheader Banner */}
                  <div className="text-center mb-6 max-w-2xl mx-auto">
                    <h3 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-neutral-900 flex items-center justify-center gap-2">
                      <span className="w-7 h-7 rounded-full border-2 border-neutral-900 inline-flex items-center justify-center text-sm font-serif italic">i</span>
                      3: CHOOSE YOUR <span className="text-magenta">{store.garmentCategoryName ? store.garmentCategoryName.toUpperCase() : 'PRODUCT'}</span>
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-600 font-sans mt-2 leading-relaxed">
                      Browse our most popular products here. Can&apos;t find the specific brand or style you&apos;re after? We can likely get it for you; just <span className="underline cursor-pointer font-semibold text-neutral-800">request a custom quote</span>.
                    </p>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-neutral-200 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <select className="px-3 py-2 border-2 border-neutral-300 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-white text-neutral-800 cursor-pointer focus:outline-none focus:border-black">
                        <option value="">FIT ▾</option>
                        <option value="regular">Regular Fit</option>
                        <option value="oversized">Oversized</option>
                        <option value="slim">Slim Fit</option>
                      </select>
                      <select className="px-3 py-2 border-2 border-neutral-300 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-white text-neutral-800 cursor-pointer focus:outline-none focus:border-black">
                        <option value="">WEIGHT ▾</option>
                        <option value="light">Lightweight (150-180 GSM)</option>
                        <option value="mid">Midweight (180-220 GSM)</option>
                        <option value="heavy">Heavyweight (220+ GSM)</option>
                      </select>
                      <select className="px-3 py-2 border-2 border-neutral-300 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-white text-neutral-800 cursor-pointer focus:outline-none focus:border-black">
                        <option value="">PRINT METHOD ▾</option>
                        <option value="screen">Screen Printing</option>
                        <option value="dtg">DTG</option>
                        <option value="embroidery">Embroidery</option>
                      </select>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="SEARCH BY NAME OR BRAND"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border-2 border-neutral-300 rounded-full font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-neutral-900 bg-white placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  {loadingProducts ? (
                    <LoadingSpinner />
                  ) : !filteredProducts || filteredProducts.length === 0 ? (
                    <ErrorMessage message="No products found matching your filter." />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                      {filteredProducts.map((product, idx) => {
                        const isSelected = store.productId === product._id;
                        const firstImg = product.images?.[0];
                        const badge = idx === 0 || idx === 1
                          ? { label: '★ POPULAR', color: '#a17409' }
                          : idx === 3
                          ? { label: '♥ STAFF PICK', color: '#a17409' }
                          : null;
                        return (
                          <div
                            key={product._id}
                            onClick={() => store.setProduct(product._id, product.name, product.images)}
                            className="cursor-pointer group flex flex-col justify-between"
                          >
                            <div>
                              {/* Image Container */}
                              <div
                                className={`relative overflow-hidden bg-[#e8e8e8] rounded shadow-sm mb-3 transition-all duration-200 ${
                                  isSelected ? 'ring-4 ring-magenta ring-offset-2' : 'group-hover:opacity-95'
                                }`}
                                style={{ aspectRatio: '4/5' }}
                              >
                                {firstImg ? (
                                  <img
                                    src={firstImg}
                                    alt={product.name}
                                    className="w-full h-full object-contain object-center p-2 transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-mono">No Image</div>
                                )}

                                {/* Badge overlay top left */}
                                {badge && (
                                  <span
                                    className="absolute top-0 left-0 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-br"
                                    style={{ backgroundColor: badge.color }}
                                  >
                                    {badge.label}
                                  </span>
                                )}

                                {/* Selected checkmark badge top right */}
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-7 h-7 bg-magenta rounded-full flex items-center justify-center shadow-md">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}

                                {/* Info circle bottom right */}
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute bottom-2 right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-serif italic shadow hover:scale-110 transition-transform"
                                  title="Product details"
                                >
                                  i
                                </button>
                              </div>

                              {/* Title & details below image */}
                              <h4 className="font-display font-black text-sm uppercase tracking-tight text-neutral-900 leading-snug line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase tracking-wider">
                                {product.brandName || 'Printfection'} &middot; {formatCurrency(product.basePrice, product.currency)}
                              </p>
                            </div>

                            <button
                              type="button"
                              className={`w-full mt-3 font-mono text-xs uppercase tracking-wider py-2 rounded font-bold transition-all ${
                                isSelected ? 'bg-magenta text-white' : 'bg-neutral-900 text-white hover:bg-magenta'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select Product'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-8 flex justify-between border-t border-neutral-200 mt-6">
                    <button
                      type="button"
                      onClick={() => store.setStep(2)}
                      className="btn-ghost-dark text-xs"
                    >
                      ← Back to Garment Type
                    </button>
                    {store.productId && (
                      <button
                        type="button"
                        onClick={() => store.setStep(4)}
                        className="btn-magenta"
                      >
                        Continue to Colour →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: COLOUR */}
        {4 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[4] = el)}
            className={`card transition-all duration-300 ${
              store.step === 4
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(4, '4. Garment Colour', 'Select product fabric colour')}

              {store.step !== 4 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <div className="flex items-center gap-2">
                    <span>Selected Colours:</span>
                    <div className="flex gap-2">
                      {store.selectedColours.map((c) => (
                        <span key={c.colourName} className="inline-flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded text-xs text-neutral-900 font-bold border border-neutral-200">
                          <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: c.colourHex || '#ddd' }} />
                          {c.colourName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {store.step === 4 && (
                <div className="pt-6 space-y-6 step-enter">
                  {loadingConfig ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <p className="text-xs font-mono text-neutral-600 uppercase tracking-wide">
                        Select fabric colour(s) for your order:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {config?.colours.map((colour) => {
                          const isSelected = store.selectedColours.some((c) => c.colourName === colour.name);
                          return (
                            <button
                              key={colour.name}
                              type="button"
                              onClick={() =>
                                store.toggleColour({
                                  colourName: colour.name,
                                  colourHex: colour.hex,
                                  colourImage: colour.image,
                                })
                              }
                              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-magenta/5 border-magenta shadow-selected scale-105'
                                  : 'bg-white border-neutral-200 hover:border-black'
                              }`}
                            >
                              <div
                                className="w-12 h-12 rounded-full border-2 border-neutral-300 shadow-sm mb-2 relative flex items-center justify-center"
                                style={{ backgroundColor: colour.hex || '#ccc' }}
                              >
                                {isSelected && <span className="text-white font-bold text-sm drop-shadow">✓</span>}
                              </div>
                              <span className="text-xs font-mono text-neutral-900 font-bold text-center">{colour.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => store.setStep(3)}
                          className="btn-ghost-dark text-xs"
                        >
                          ← Back to Product
                        </button>
                        <button
                          type="button"
                          onClick={() => store.setStep(5)}
                          disabled={store.selectedColours.length === 0}
                          className="btn-magenta disabled:opacity-40"
                        >
                          Continue to Sizes & Quantities →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: SIZES & QUANTITIES */}
        {5 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[5] = el)}
            className={`card transition-all duration-300 ${
              store.step === 5
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(5, '5. Sizes & Quantities', 'Distribute size matrix across colours')}

              {store.step !== 5 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <span>Total Configured Items: <strong className="text-neutral-900 font-bold text-base">{totalQuantity} units</strong> (Target: {store.targetQuantity})</span>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {store.step === 5 && (
                <div className="pt-6 space-y-6 step-enter">
                  {loadingVariants ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-4 rounded-xl">
                        <span className="text-xs font-mono text-neutral-700">
                          Target Run: <strong className="text-neutral-900 font-bold">{store.targetQuantity} units</strong> &middot; Configured Total: <strong className={totalQuantity >= minQty ? 'text-green-600 font-bold' : 'text-magenta font-bold'}>{totalQuantity} units</strong>
                        </span>
                        {totalQuantity < minQty && (
                          <span className="text-xs font-mono text-magenta font-bold">
                            Minimum order quantity is {minQty} units.
                          </span>
                        )}
                      </div>

                      <SizeQuantityGrid
                        selectedColours={store.selectedColours}
                        sizes={getProductSizes()}
                        minimumOrderQuantity={minQty}
                        targetQuantity={store.targetQuantity}
                        currency={config?.product.currency || 'GBP'}
                        onQuantityChange={(col, sz, qty, varId) => {
                          const matchVar = variants?.find((v) => v.colourName === col && v.size === sz);
                          store.setColourQuantity(col, sz, qty, matchVar?._id || varId);
                        }}
                      />

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => store.setStep(4)}
                          className="btn-ghost-dark text-xs"
                        >
                          ← Back to Colours
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (totalQuantity < minQty) {
                              store.showAlert(`Minimum order quantity is ${minQty} units. Your current size total is ${totalQuantity} units. Please add more sizes to proceed.`, "Minimum Quantity Required");
                            } else {
                              store.setStep(6);
                            }
                          }}
                          className="btn-magenta"
                        >
                          Continue to Printing Method →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: PRINTING OPTIONS */}
        {6 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[6] = el)}
            className={`card transition-all duration-300 ${
              store.step === 6
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(6, '6. Printing Method', 'Choose custom branding technique')}

              {store.step !== 6 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <span>Selected Method: <strong className="text-neutral-900 font-bold text-base">{store.printingMethod.replace('_', ' ')}</strong></span>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {store.step === 6 && (
                <div className="pt-6 space-y-6 step-enter">
                  <PrintingMethodSelector
                    selectedMethod={store.printingMethod}
                    onSelectMethod={(methodId) => store.setPrintingMethod(methodId)}
                  />

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => store.setStep(5)}
                      className="btn-ghost-dark text-xs"
                    >
                      ← Back to Sizes
                    </button>
                    <button
                      type="button"
                      onClick={() => store.setStep(7)}
                      className="btn-magenta"
                    >
                      Continue to Print Locations →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: PRINT LOCATIONS & COLOUR COUNTS */}
        {7 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[7] = el)}
            className={`card transition-all duration-300 ${
              store.step === 7
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(7, '7. Print Locations & Colours', 'Select placement positions and ink colour counts')}

              {store.step !== 7 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <div>
                    <span>Selected Positions ({store.selectedLocations.length}): </span>
                    <strong className="text-neutral-900 font-bold">
                      {store.selectedLocations.map((l) => `${l.locationName} (${l.colourCount} col)`).join(', ')}
                    </strong>
                  </div>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {store.step === 7 && (
                <div className="pt-6 space-y-6 step-enter">
                  {loadingLocations ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <PrintLocationSelector locations={printLocations || []} />

                      {store.selectedLocations.length > 0 && (
                        <div className="pt-4 border-t border-neutral-200">
                          <h4 className="font-display font-bold text-base uppercase text-neutral-900 mb-3">
                            Set Ink Colours per Position
                          </h4>
                          <PrintColourCountGrid />
                        </div>
                      )}

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => store.setStep(6)}
                          className="btn-ghost-dark text-xs"
                        >
                          ← Back to Printing Method
                        </button>
                        <button
                          type="button"
                          onClick={() => store.setStep(8)}
                          className="btn-magenta"
                        >
                          Continue to Review & Quote →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW */}
        {8 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[8] = el)}
            className={`card transition-all duration-300 ${
              store.step === 8
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(8, '8. Order Review', 'Verify configuration and instant live quote')}

              {store.step !== 8 && (
                <div className="p-4 flex items-center justify-between text-sm text-neutral-700 font-mono bg-white rounded-lg border border-neutral-200 mt-4">
                  <span>Order Quote Total: <strong className="text-neutral-900 font-bold text-base">{store.pricing ? formatCurrency(store.pricing.total, store.pricing.currency) : 'Calculated'}</strong></span>
                  <span className="text-xs text-magenta font-bold">✓ Confirmed</span>
                </div>
              )}

              {store.step === 8 && (
                <div className="pt-6 space-y-6 step-enter">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-5">
                      <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-xl space-y-4">
                        <span className="section-label mb-1 block">
                          Product Summary
                        </span>
                        <h4 className="font-display font-black text-neutral-900 uppercase text-base tracking-tight">
                          {store.productName}
                        </h4>

                        <div className="space-y-3">
                          {store.selectedColours.map((colour) => {
                            const totalQty = Object.values(colour.sizeQuantities).reduce((a, b) => a + b, 0);
                            return (
                              <div key={colour.colourName} className="border-t border-neutral-200 pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: colour.colourHex || '#ddd' }} />
                                    <span className="font-display font-bold text-xs uppercase text-neutral-900">{colour.colourName}</span>
                                  </div>
                                  <span className="font-mono text-xs text-neutral-600 font-bold">{totalQty} units</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(colour.sizeQuantities)
                                    .filter(([, qty]) => qty > 0)
                                    .map(([sz, qty]) => (
                                      <span key={sz} className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-neutral-300 text-neutral-900 font-bold">
                                        {sz}: {qty}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-xl space-y-3">
                        <span className="section-label mb-1 block">
                          Customisation Details
                        </span>
                        <p className="text-xs font-mono text-neutral-700">Method: <strong className="text-neutral-900 font-bold">{store.printingMethod.replace('_', ' ')}</strong></p>
                        <div className="space-y-2 pt-2 border-t border-neutral-200">
                          {store.selectedLocations.map((loc) => (
                            <div key={loc.locationId} className="flex justify-between items-center text-xs font-mono">
                              <span className="text-neutral-800 font-bold">{loc.locationName}</span>
                              <span className="bg-magenta/10 text-magenta px-2.5 py-0.5 rounded font-bold border border-magenta/20">
                                {loc.colourCount} Colour{loc.colourCount > 1 ? 's' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {pricingMutation.isPending && <LoadingSpinner label="Calculating custom quote..." />}
                      {store.pricing && <PricingSummary pricing={store.pricing} />}

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => store.setStep(7)}
                          className="btn-ghost-dark text-xs"
                        >
                          ← Back to Print Locations
                        </button>
                        <button
                          type="button"
                          onClick={() => store.setStep(9)}
                          className="btn-magenta"
                        >
                          Proceed to Checkout →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 9: CHECKOUT */}
        {9 <= maxStepReached && (
          <div
            ref={(el) => (stepRefs.current[9] = el)}
            className={`card transition-all duration-300 ${
              store.step === 9
                ? 'border-magenta/40 bg-white shadow-card-hover ring-1 ring-magenta/20'
                : 'bg-neutral-50/80 border-neutral-200'
            }`}
          >
            <div className="p-6">
              {renderStepHeader(9, '9. Add to Cart & Checkout', 'Finalize order placement')}

              {store.step === 9 && (
                <div className="pt-6 space-y-6 step-enter">
                  <p className="text-xs font-mono text-neutral-600 uppercase tracking-wide leading-relaxed">
                    Your bulk order run configuration is complete! Click below to add this customized order to your cart and complete checkout.
                  </p>

                  {addError && <p className="font-mono text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">{addError}</p>}

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => addToCartMutation.mutate()}
                      disabled={addToCartMutation.isPending || totalQuantity < minQty}
                      className="btn-magenta flex-1 py-4 text-xs font-bold"
                    >
                      {addToCartMutation.isPending ? 'Processing Order...' : 'Add Order to Cart & Continue'}
                    </button>
                    <button
                      type="button"
                      onClick={() => store.setStep(8)}
                      className="btn-ghost-dark py-4 text-xs"
                    >
                      Review Order Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Store Alert Modal */}
      {store.alertMessage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border-2 border-black max-w-sm w-full p-6 text-left shadow-2xl relative rounded-xl animate-scale-in">
            <button
              onClick={store.closeAlert}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
              aria-label="Close dialog"
            >
              ✕
            </button>
            <h3 className="font-display font-black text-xl uppercase text-neutral-900 tracking-tight mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-magenta inline-block animate-pulse rounded-full" />
              {store.alertTitle || 'Notice'}
            </h3>
            <p className="font-mono text-xs text-neutral-600 mb-6 leading-relaxed">
              {store.alertMessage}
            </p>
            <button
              onClick={store.closeAlert}
              className="bg-neutral-900 text-white px-5 py-3 font-mono text-xs uppercase tracking-wider hover:bg-magenta transition-colors w-full text-center font-bold rounded-lg"
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
