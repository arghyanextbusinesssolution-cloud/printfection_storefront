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

import { ALL_CATALOG_PRODUCTS, DEFAULT_PRODUCT_COLOURS } from '../../data/garmentCatalog';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStyle, setSelectedStyle] = useState<string>('ALL');
  const [selectedWeight, setSelectedWeight] = useState<string>('ALL');
  const [selectedOrganic, setSelectedOrganic] = useState<string>('ALL');
  const [selectedPrintMethod, setSelectedPrintMethod] = useState<string>('ALL');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  // All products
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-single'],
    queryFn: () => apiGet<PaginatedResponse<Product>>('/products', { limit: 100 }),
  });

  const availableProducts: Product[] = products?.items && products.items.length > 0
    ? [...products.items, ...ALL_CATALOG_PRODUCTS.filter((cp) => !products.items.some((p) => p._id === cp._id))]
    : ALL_CATALOG_PRODUCTS;

  const filteredAvailableProducts = availableProducts.filter((p) => {
    if (selectedCategory !== 'ALL') {
      const catSlug = (p.category?.slug || p.garmentCategory?.slug || p.category?.name || '').toLowerCase();
      if (!catSlug.includes(selectedCategory.toLowerCase())) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = (p.brandName || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchBrand && !matchDesc && !matchTags) return false;
    }
    const combinedText = (p.name + ' ' + (p.brandName || '') + ' ' + (p.description || '') + ' ' + (p.tags?.join(' ') || '')).toLowerCase();
    if (selectedStyle !== 'ALL') {
      if (selectedStyle === 'BOXY' && !combinedText.includes('boxy') && !combinedText.includes('relaxed')) return false;
      if (selectedStyle === 'REGULAR' && !combinedText.includes('regular') && !combinedText.includes('classic')) return false;
      if (selectedStyle === 'SLIM' && !combinedText.includes('slim') && !combinedText.includes('fitted')) return false;
    }
    if (selectedWeight !== 'ALL') {
      if (selectedWeight === 'LIGHT' && !combinedText.includes('light') && !combinedText.includes('180')) return false;
      if (selectedWeight === 'MEDIUM' && !combinedText.includes('medium') && !combinedText.includes('midweight') && !combinedText.includes('classic')) return false;
      if (selectedWeight === 'HEAVY' && !combinedText.includes('heavy') && !combinedText.includes('203') && !combinedText.includes('350')) return false;
    }
    if (selectedOrganic !== 'ALL') {
      if (selectedOrganic === 'ORGANIC' && !p.organic && !combinedText.includes('organic')) return false;
    }
    return true;
  });

  // Variants for selected product
  const { data: variants, isLoading: loadingVariants } = useQuery({
    queryKey: ['variants-single', selectedProduct?._id],
    queryFn: () => apiGet<ProductVariant[]>(`/single-order/variants/${selectedProduct!._id}`),
    enabled: !!selectedProduct && step >= 2,
  });

  const effectiveVariants: ProductVariant[] = (variants && variants.length > 0)
    ? variants
    : selectedProduct
      ? DEFAULT_PRODUCT_COLOURS.slice(0, 12).flatMap((c) =>
          ['S', 'M', 'L', 'XL', '2XL'].map((sz) => ({
            _id: `var-${selectedProduct._id}-${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${sz.toLowerCase()}`,
            product: selectedProduct._id,
            sku: `${selectedProduct.sku}-${sz}`,
            colourName: c.name,
            colourHex: c.hex,
            size: sz,
            price: selectedProduct.basePrice,
            stock: 999,
            isActive: true,
          }))
        )
      : [];

  // Group variants by colour
  const colourMap = effectiveVariants.reduce((acc, v) => {
    if (!acc[v.colourName]) acc[v.colourName] = [];
    acc[v.colourName].push(v);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

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
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-magenta mb-2">One-Off Custom</p>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-black">Single Piece Order</h1>
        <p className="mt-2 text-neutral-400 font-mono text-xs uppercase tracking-widest">
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
                  done ? 'bg-magenta text-white' : active ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                }`}>
                  {done ? '✓' : s}
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-[0.1em] mt-1.5 ${active ? 'text-black font-bold' : 'text-neutral-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 transition-colors ${done ? 'bg-magenta' : 'bg-neutral-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Choose Product ── */}
      {step === 1 && (
        <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-left">
          {/* Subheader Banner */}
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <p className="text-xs md:text-sm text-neutral-600 font-sans mt-1 leading-relaxed font-bold">
              Browse our most popular products here. Can&apos;t find the specific brand or style you&apos;re after? We can likely get it for you; just <span className="underline cursor-pointer font-bold text-neutral-900">request a custom quote</span>
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-neutral-200 pb-4 relative z-20">
            <div className="flex flex-wrap items-center gap-2 relative">
              {/* CATEGORY / GENDER PILL */}
              <button
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === 'ALL' ? 't-shirts' : 'ALL')}
                className={`px-4 py-2 border-2 rounded-full font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors ${
                  selectedCategory !== 'ALL'
                    ? 'border-[#10b981] bg-[#10b981] text-white'
                    : 'border-[#10b981] bg-[#10b981] text-white'
                }`}
              >
                <span>{selectedCategory !== 'ALL' ? selectedCategory.toUpperCase() : 'MENS'}</span>
                <span className="text-xs font-bold">✕ ▾</span>
              </button>

              {/* FIT DROPDOWN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'FIT' ? null : 'FIT')}
                  className={`px-4 py-2 border-2 rounded-full font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-colors ${
                    selectedStyle !== 'ALL'
                      ? 'border-magenta bg-magenta/10 text-magenta'
                      : 'border-neutral-300 bg-white text-neutral-900 hover:border-black'
                  }`}
                >
                  <span>FIT{selectedStyle !== 'ALL' ? `: ${selectedStyle}` : ''}</span>
                  <span className="w-4 h-4 bg-neutral-700 text-white rounded text-[10px] flex items-center justify-center font-mono font-bold">▾</span>
                </button>
                {openDropdown === 'FIT' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-neutral-900 rounded-xl shadow-2xl z-50 py-1 font-mono text-xs">
                    {[
                      { id: 'ALL', label: 'ALL FITS' },
                      { id: 'REGULAR', label: 'REGULAR FIT' },
                      { id: 'BOXY', label: 'BOXY / RELAXED' },
                      { id: 'SLIM', label: 'SLIM FIT' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setSelectedStyle(opt.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-bold uppercase transition-colors flex items-center justify-between ${
                          selectedStyle === opt.id ? 'bg-magenta text-white' : 'hover:bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedStyle === opt.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* WEIGHT DROPDOWN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'WEIGHT' ? null : 'WEIGHT')}
                  className={`px-4 py-2 border-2 rounded-full font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-colors ${
                    selectedWeight !== 'ALL'
                      ? 'border-magenta bg-magenta/10 text-magenta'
                      : 'border-neutral-300 bg-white text-neutral-900 hover:border-black'
                  }`}
                >
                  <span>WEIGHT{selectedWeight !== 'ALL' ? `: ${selectedWeight}` : ''}</span>
                  <span className="w-4 h-4 bg-neutral-700 text-white rounded text-[10px] flex items-center justify-center font-mono font-bold">▾</span>
                </button>
                {openDropdown === 'WEIGHT' && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white border-2 border-neutral-900 rounded-xl shadow-2xl z-50 py-1 font-mono text-xs">
                    {[
                      { id: 'ALL', label: 'ALL WEIGHTS' },
                      { id: 'LIGHT', label: 'LIGHTWEIGHT' },
                      { id: 'MEDIUM', label: 'MEDIUM WEIGHT' },
                      { id: 'HEAVY', label: 'HEAVYWEIGHT' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setSelectedWeight(opt.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-bold uppercase transition-colors flex items-center justify-between ${
                          selectedWeight === opt.id ? 'bg-magenta text-white' : 'hover:bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedWeight === opt.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ORGANIC DROPDOWN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'ORGANIC' ? null : 'ORGANIC')}
                  className={`px-4 py-2 border-2 rounded-full font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-colors ${
                    selectedOrganic !== 'ALL'
                      ? 'border-magenta bg-magenta/10 text-magenta'
                      : 'border-neutral-300 bg-white text-neutral-900 hover:border-black'
                  }`}
                >
                  <span>ORGANIC{selectedOrganic !== 'ALL' ? ': YES' : ''}</span>
                  <span className="w-4 h-4 bg-neutral-700 text-white rounded text-[10px] flex items-center justify-center font-mono font-bold">▾</span>
                </button>
                {openDropdown === 'ORGANIC' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-neutral-900 rounded-xl shadow-2xl z-50 py-1 font-mono text-xs">
                    {[
                      { id: 'ALL', label: 'ALL PRODUCTS' },
                      { id: 'ORGANIC', label: 'ORGANIC ONLY' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setSelectedOrganic(opt.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-bold uppercase transition-colors flex items-center justify-between ${
                          selectedOrganic === opt.id ? 'bg-magenta text-white' : 'hover:bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedOrganic === opt.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PRINT METHOD DROPDOWN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'PRINT' ? null : 'PRINT')}
                  className={`px-4 py-2 border-2 rounded-full font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-colors ${
                    selectedPrintMethod !== 'ALL'
                      ? 'border-magenta bg-magenta/10 text-magenta'
                      : 'border-neutral-300 bg-white text-neutral-900 hover:border-black'
                  }`}
                >
                  <span>PRINT METHOD{selectedPrintMethod !== 'ALL' ? `: ${selectedPrintMethod}` : ''}</span>
                  <span className="w-4 h-4 bg-neutral-700 text-white rounded text-[10px] flex items-center justify-center font-mono font-bold">▾</span>
                </button>
                {openDropdown === 'PRINT' && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white border-2 border-neutral-900 rounded-xl shadow-2xl z-50 py-1 font-mono text-xs">
                    {[
                      { id: 'ALL', label: 'ALL METHODS' },
                      { id: 'SCREEN_PRINT', label: 'SCREEN PRINTING' },
                      { id: 'EMBROIDERY', label: 'EMBROIDERY' },
                      { id: 'DTG', label: 'DIRECT TO GARMENT' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setSelectedPrintMethod(opt.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2 font-bold uppercase transition-colors flex items-center justify-between ${
                          selectedPrintMethod === opt.id ? 'bg-magenta text-white' : 'hover:bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedPrintMethod === opt.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative w-full sm:w-64">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="SEARCH BY NAME OR BRAND"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-neutral-300 rounded-full font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-neutral-900 bg-white placeholder:text-neutral-400"
              />
            </div>
          </div>

          {loadingProducts ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {filteredAvailableProducts.map((product, idx) => {
                const isSelected = selectedProduct?._id === product._id;
                const isImageFailed = failedImages[product._id];
                const imageSrc = !isImageFailed && product.images?.[0]
                  ? product.images[0]
                  : product.images?.[1] || '/images/products/classic_organic_t_shirt_black_1787252480190.png';

                const badge = idx === 0 || product.tags?.includes('Popular')
                  ? { label: '★ POPULAR', color: '#a17409' }
                  : idx === 1 || product.organic
                  ? { label: product.organic ? 'ORGANIC' : '♥ STAFF PICK', color: product.organic ? '#10b981' : '#a17409' }
                  : null;

                const fitText = product.tags?.find((t) => t.toLowerCase().includes('fit') || t.toLowerCase().includes('boxy')) || 'Regular';
                const weightText = product.tags?.find((t) => t.toLowerCase().includes('heavy') || t.toLowerCase().includes('cotton') || t.toLowerCase().includes('soft')) || 'Medium';

                return (
                  <div
                    key={product._id}
                    onClick={() => { setSelectedProduct(product); setSelectedColour(null); setSelectedVariant(null); setStep(2); }}
                    className="cursor-pointer group flex flex-col justify-between text-left"
                  >
                    <div>
                      {/* Image Container matching Screenshot 1 */}
                      <div
                        className={`relative overflow-hidden bg-[#e5e5e5] rounded shadow-sm mb-3 transition-all duration-200 aspect-square ${
                          isSelected ? 'ring-4 ring-[#10b981] ring-offset-2' : 'group-hover:shadow-md'
                        }`}
                      >
                        <img
                          src={imageSrc}
                          alt={product.name}
                          onError={() => setFailedImages((prev) => ({ ...prev, [product._id]: true }))}
                          className="w-full h-full object-contain object-center p-3 transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Badge overlay top left */}
                        {badge && (
                          <span
                            className="absolute top-0 left-0 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-br z-10"
                            style={{ backgroundColor: badge.color }}
                          >
                            {badge.label}
                          </span>
                        )}

                        {/* Selected checkmark badge top right */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-7 h-7 bg-[#10b981] rounded-full flex items-center justify-center shadow-md z-10">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Details below image */}
                      <h4 className="font-display font-black text-xs text-neutral-900 uppercase tracking-tight leading-snug group-hover:text-[#10b981] transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-neutral-600 font-sans mt-0.5 line-clamp-1">
                        {product.brandName || product.description || 'Premium Blank'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="text-[11px] text-neutral-600 font-sans leading-tight">
                          <div><strong className="font-bold text-neutral-800">Fit:</strong> {fitText}</div>
                          <div><strong className="font-bold text-neutral-800">Weight:</strong> {weightText}</div>
                          <div className="text-neutral-500 font-mono text-[10px] mt-0.5 font-bold">
                            From {formatCurrency(product.basePrice, product.currency)}
                          </div>
                        </div>

                        {/* Info Button at bottom right */}
                        <div className="flex flex-col items-center">
                          <span className="w-6 h-6 rounded-full bg-black text-white font-serif italic text-xs flex items-center justify-center font-bold shadow-sm">
                            i
                          </span>
                          <span className="text-[8px] font-mono font-black text-black tracking-tighter uppercase mt-0.5">
                            INFO
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => { setStep(2); }}
              disabled={!selectedProduct}
              className="bg-[#10b981] text-white font-mono text-xs uppercase tracking-widest px-8 py-3.5 rounded-full font-bold hover:bg-[#0e9f6e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
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
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4">Choose Size</p>
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
                              ? 'bg-magenta text-white border-magenta'
                              : outOfStock
                              ? 'bg-neutral-50 text-neutral-300 border-neutral-200 cursor-not-allowed line-through'
                              : 'bg-white text-neutral-600 border-neutral-300 hover:border-black hover:bg-neutral-100 hover:text-black'
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
                <div className="bg-neutral-50 border border-neutral-200 p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400">Single piece price</p>
                    <p className="font-display font-black text-2xl text-black mt-1">{formatCurrency(selectedVariant.price, selectedProduct.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400 mb-1">In stock</p>
                    <p className={`font-mono text-[11px] font-bold ${selectedVariant.stock > 10 ? 'text-green-600' : 'text-orange-500'}`}>
                      {selectedVariant.stock} available
                    </p>
                  </div>
                </div>
              )}

              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400 mb-6">
                {!selectedColour && '← Select a colour above'}
                {selectedColour && !selectedVariant && '← Now pick a size'}
              </p>
            </>
          )}

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="border border-neutral-300 text-neutral-500 font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-black hover:text-black transition-all"
            >Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedVariant}
              className="bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          <h2 className="font-display font-black text-xl uppercase tracking-tighter text-black mb-6">Review Your Order</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Product card */}
            <div className="bg-white border border-neutral-200 overflow-hidden">
              {designPreview ? (
                <img src={designPreview} alt="Your custom design" className="w-full h-48 object-contain bg-neutral-50 p-2" />
              ) : selectedVariant.image ? (
                <img src={selectedVariant.image} alt={selectedProduct.name} className="w-full h-48 object-cover" />
              ) : null}
              <div className="p-4 border-t border-neutral-100">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-magenta mb-1">{selectedProduct.brandName}</p>
                <h3 className="font-display font-bold text-black uppercase tracking-tight">{selectedProduct.name}</h3>
                <p className="font-mono text-[10px] text-neutral-400 mt-1">{selectedVariant.colourName} / {selectedVariant.size}</p>
                {designId && (
                  <p className="font-mono text-[9px] text-green-600 mt-2 uppercase tracking-[0.1em]">✓ Custom design attached</p>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white border border-neutral-200 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 border border-neutral-300 text-black font-display font-bold text-lg hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                    >−</button>
                    <span className="font-display font-black text-2xl text-black w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      className="w-9 h-9 border border-neutral-300 text-black font-display font-bold text-lg hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                    >+</button>
                  </div>
                  <p className="font-mono text-[9px] text-neutral-400 mt-1 uppercase tracking-[0.1em]">Max: {selectedVariant.stock}</p>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-2">Additional Notes</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions (optional)"
                    rows={3}
                    className="w-full bg-white border border-neutral-200 text-black font-mono text-[11px] p-3 placeholder-neutral-300 focus:outline-none focus:border-black resize-none transition-colors"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400">Total</span>
                  <span className="font-display font-black text-2xl text-magenta">
                    {formatCurrency(selectedVariant.price * quantity, selectedProduct.currency)}
                  </span>
                </div>
                <p className="font-mono text-[9px] text-neutral-300 mt-1 uppercase tracking-[0.1em]">
                  + printing charges at checkout
                </p>
              </div>
            </div>
          </div>

          {addError && <p className="mb-4 font-mono text-[11px] text-red-500">{addError}</p>}

          <div className="flex flex-wrap gap-3 justify-between">
            <button
              onClick={() => setStep(3)}
              className="border border-neutral-300 text-neutral-500 font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-black hover:text-black transition-all"
            >Back to Design</button>
            <button
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
              className="bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] px-10 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart →'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
