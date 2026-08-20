import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '@printfection/shared';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DesignStudioAdapter } from '../../components/design/DesignStudioAdapter';
import type { Product, ProductVariant } from '../../types';
import type { PaginatedResponse } from '@printfection/types';

type Step = 1 | 2 | 3 | 4;

export function SingleOrderPage() {
  const navigate = useNavigate();
  const setCart = useCartStore((s) => s.setCart);

  const [step, setStep] = useState<Step>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addError, setAddError] = useState('');
  const [designId, setDesignId] = useState<string | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  // All products
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-single'],
    queryFn: () => apiGet<PaginatedResponse<Product>>('/products', { limit: 100 }),
  });

  // Variants for selected product
  const { data: variants, isLoading: loadingVariants } = useQuery({
    queryKey: ['variants-single', selectedProduct?._id],
    queryFn: () => apiGet<ProductVariant[]>(`/single-order/variants/${selectedProduct!._id}`),
    enabled: !!selectedProduct && step >= 2,
  });

  // Group variants by colour
  const colourMap = variants
    ? variants.reduce((acc, v) => {
        if (!acc[v.colourName]) acc[v.colourName] = [];
        acc[v.colourName].push(v);
        return acc;
      }, {} as Record<string, ProductVariant[]>)
    : {};

  const sizesForColour = selectedColour ? colourMap[selectedColour] ?? [] : [];

  const addToCartMutation = useMutation({
    mutationFn: () =>
      apiPost('/single-order/add-to-cart', {
        productId: selectedProduct!._id,
        productName: selectedProduct!.name,
        variantId: selectedVariant!._id,
        colourName: selectedVariant!.colourName,
        colourHex: selectedVariant!.colourHex,
        size: selectedVariant!.size,
        quantity,
        notes,
        designId,
      }),
    onSuccess: async () => {
      const cartData = await apiGet('/cart');
      setCart(cartData as Parameters<typeof setCart>[0]);
      navigate('/cart');
    },
    onError: (err) => setAddError(err instanceof Error ? err.message : 'Failed to add to cart'),
  });

  // ── Step labels
  const STEPS = ['Choose Product', 'Pick Colour & Size', 'Design Studio', 'Review & Add to Cart'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF007F] mb-2">One-Off Custom</p>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white">Single Piece Order</h1>
        <p className="mt-2 text-[#777] font-mono text-xs uppercase tracking-widest">
          Order just one custom-printed garment — no minimum quantity
        </p>
      </div>

      {/* Step bar */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => {
          const s = (i + 1) as Step;
          const done = step > s;
          const active = step === s;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center font-display font-black text-sm transition-all ${
                  done ? 'bg-[#FF007F] text-white' : active ? 'bg-white text-black' : 'bg-[#1a1a1a] text-[#444] border border-[#333]'
                }`}>
                  {done ? '✓' : s}
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-[0.1em] mt-1.5 ${active ? 'text-white' : 'text-[#444]'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 transition-colors ${done ? 'bg-[#FF007F]' : 'bg-[#222]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Choose Product ── */}
      {step === 1 && (
        <section>
          <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white mb-6">Choose a Garment</h2>
          {loadingProducts ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products?.items.map((product) => {
                const isSelected = selectedProduct?._id === product._id;
                const firstImage = product.images?.[0];
                return (
                  <button
                    key={product._id}
                    onClick={() => { setSelectedProduct(product); setSelectedColour(null); setSelectedVariant(null); setStep(2); }}
                    className={`bg-[#111] border text-left transition-all duration-200 group overflow-hidden ${
                      isSelected
                        ? 'border-[#FF007F] shadow-[0_0_24px_rgba(255,0,127,0.2)]'
                        : 'border-[#333] hover:border-[#FF007F]'
                    }`}
                  >
                    <div className="relative h-48 bg-[#0d0d0d] overflow-hidden">
                      {firstImage ? (
                        <img src={firstImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-[#222]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute top-3 right-3 bg-[#FF007F] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white">✓ Selected</span>
                      )}
                      {product.organic && (
                        <span className="absolute top-3 left-3 bg-black/70 border border-[#333] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#22c55e]">Organic</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF007F] mb-1">{product.brandName}</p>
                      <h3 className="font-display font-bold text-white text-base uppercase tracking-tight group-hover:text-[#FF007F] transition-colors">{product.name}</h3>
                      <p className="font-mono text-[10px] text-[#555] mt-2 uppercase tracking-widest">
                        From {formatCurrency(product.basePrice, product.currency)} per piece
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => { setStep(2); }}
              disabled={!selectedProduct}
              className="bg-[#FF007F] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-[#e60072] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next: Pick Colour &amp; Size →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 2: Colour & Size ── */}
      {step === 2 && selectedProduct && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white">
              Colour &amp; Size — <span className="text-[#FF007F]">{selectedProduct.name}</span>
            </h2>
            <button onClick={() => setStep(1)} className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#FF007F] hover:text-white transition-colors">Change garment</button>
          </div>

          {loadingVariants ? <LoadingSpinner /> : (
            <>
              {/* Colour selector */}
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#555] mb-4">Choose Colour</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
                {Object.entries(colourMap).map(([colourName, cvs]) => {
                  const hex = cvs[0]?.colourHex;
                  const img = cvs[0]?.image;
                  const isSelCol = selectedColour === colourName;
                  const isLight = hex && (
                    parseInt(hex.slice(1, 3), 16) * 0.299 +
                    parseInt(hex.slice(3, 5), 16) * 0.587 +
                    parseInt(hex.slice(5, 7), 16) * 0.114
                  ) > 160;
                  return (
                    <button
                      key={colourName}
                      onClick={() => { setSelectedColour(colourName); setSelectedVariant(null); }}
                      className={`relative h-24 overflow-hidden border-2 transition-all duration-200 ${
                        isSelCol
                          ? 'border-[#FF007F] shadow-[0_0_16px_rgba(255,0,127,0.3)] scale-[1.03]'
                          : 'border-[#333] hover:border-[#666]'
                      }`}
                      style={{ backgroundColor: hex || '#333' }}
                      data-colour={colourName}
                    >
                      {img && <img src={img} alt={colourName} className="absolute inset-0 w-full h-full object-cover" />}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className={`absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[0.1em] z-10 ${isLight && !img ? 'text-[#111]' : 'text-white'}`}>
                        {colourName}
                      </span>
                      {isSelCol && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF007F] flex items-center justify-center z-10">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Size selector */}
              {selectedColour && (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#555] mb-4">Choose Size</p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {sizesForColour.sort((a, b) => {
                      const order = ['XS','S','M','L','XL','2XL','3XL'];
                      return order.indexOf(a.size) - order.indexOf(b.size);
                    }).map((v) => {
                      const isSelV = selectedVariant?._id === v._id;
                      const outOfStock = v.stock < 1;
                      return (
                        <button
                          key={v._id}
                          onClick={() => !outOfStock && setSelectedVariant(v)}
                          disabled={outOfStock}
                          className={`w-16 h-16 font-display font-bold text-sm border-2 transition-all ${
                            isSelV
                              ? 'bg-[#FF007F] text-white border-[#FF007F]'
                              : outOfStock
                              ? 'bg-transparent text-[#333] border-[#1a1a1a] cursor-not-allowed line-through'
                              : 'bg-transparent text-[#888] border-[#333] hover:border-[#FF007F] hover:text-white'
                          }`}
                        >
                          {v.size}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Price callout */}
              {selectedVariant && (
                <div className="bg-[#111] border border-[#222] p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Single piece price</p>
                    <p className="font-display font-black text-2xl text-white mt-1">{formatCurrency(selectedVariant.price, selectedProduct.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#555] mb-1">In stock</p>
                    <p className={`font-mono text-[11px] ${selectedVariant.stock > 10 ? 'text-[#22c55e]' : 'text-orange-400'}`}>
                      {selectedVariant.stock} available
                    </p>
                  </div>
                </div>
              )}

              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#444] mb-6">
                {!selectedColour && '← Select a colour above'}
                {selectedColour && !selectedVariant && '← Now pick a size'}
              </p>
            </>
          )}

          <div className="mt-4 flex justify-between">
            <button onClick={() => setStep(1)} className="border border-[#333] text-[#888] font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-[#666] hover:text-white transition-all">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedVariant}
              className="bg-[#FF007F] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-[#e60072] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Design Your Print →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 3: Design Studio ── */}
      {step === 3 && selectedProduct && selectedVariant && (
        <section>
          <DesignStudioAdapter
            productId={selectedProduct._id}
            productName={selectedProduct.name}
            colourName={selectedVariant.colourName}
            colourImage={selectedVariant.image || null}
            selectedLocations={[
              {
                locationId: 'full-front',
                locationName: 'Full Front',
                colourCount: 4,
              },
            ]}
            designId={designId}
            onSave={(id, designsData) => {
              setDesignId(id);
              // Grab preview from first location
              const firstKey = Object.keys(designsData)[0];
              if (firstKey && designsData[firstKey]?.previewUrl) {
                setDesignPreview(designsData[firstKey].previewUrl);
              }
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        </section>
      )}

      {/* ── STEP 4: Review & Add to Cart ── */}
      {step === 4 && selectedProduct && selectedVariant && (
        <section>
          <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white mb-6">Review Your Order</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Product card */}
            <div className="bg-[#111] border border-[#222] overflow-hidden">
              {designPreview ? (
                <img src={designPreview} alt="Your custom design" className="w-full h-48 object-contain bg-[#0d0d0d] p-2" />
              ) : selectedVariant.image ? (
                <img src={selectedVariant.image} alt={selectedProduct.name} className="w-full h-48 object-cover" />
              ) : null}
              <div className="p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF007F] mb-1">{selectedProduct.brandName}</p>
                <h3 className="font-display font-bold text-white uppercase tracking-tight">{selectedProduct.name}</h3>
                <p className="font-mono text-[10px] text-[#555] mt-1">{selectedVariant.colourName} / {selectedVariant.size}</p>
                {designId && (
                  <p className="font-mono text-[9px] text-[#22c55e] mt-2 uppercase tracking-[0.1em]">✓ Custom design attached</p>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-[#111] border border-[#222] p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555] mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 border border-[#333] text-white font-display font-bold text-lg hover:border-[#FF007F] transition-colors flex items-center justify-center">−</button>
                    <span className="font-display font-black text-2xl text-white w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      className="w-9 h-9 border border-[#333] text-white font-display font-bold text-lg hover:border-[#FF007F] transition-colors flex items-center justify-center">+</button>
                  </div>
                  <p className="font-mono text-[9px] text-[#444] mt-1 uppercase tracking-[0.1em]">Max: {selectedVariant.stock}</p>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555] mb-2">Additional Notes</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions (optional)"
                    rows={3}
                    className="w-full bg-[#0d0d0d] border border-[#333] text-white font-mono text-[11px] p-3 placeholder-[#333] focus:outline-none focus:border-[#FF007F] resize-none transition-colors"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#222]">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">Total</span>
                  <span className="font-display font-black text-2xl text-[#FF007F]">
                    {formatCurrency(selectedVariant.price * quantity, selectedProduct.currency)}
                  </span>
                </div>
                <p className="font-mono text-[9px] text-[#333] mt-1 uppercase tracking-[0.1em]">
                  + printing charges at checkout
                </p>
              </div>
            </div>
          </div>

          {addError && <p className="mb-4 font-mono text-[11px] text-red-400">{addError}</p>}

          <div className="flex flex-wrap gap-3 justify-between">
            <button onClick={() => setStep(3)} className="border border-[#333] text-[#888] font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-[#666] hover:text-white transition-all">Back to Design</button>
            <button
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
              className="bg-[#FF007F] text-white font-mono text-[11px] uppercase tracking-[0.15em] px-10 py-3 hover:bg-[#e60072] transition-colors disabled:opacity-50"
            >
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart →'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
