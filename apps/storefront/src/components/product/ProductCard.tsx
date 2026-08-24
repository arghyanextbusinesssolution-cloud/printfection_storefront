import { Link } from 'react-router-dom';
import { useState } from 'react';
import { formatCurrency } from '@printfection/shared';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const primaryImage = !imgError && product.images?.[0] ? product.images[0] : null;
  const hoverImage = product.images?.[1] ?? null;

  return (
    <article className="group relative bg-white border border-neutral-200 hover:border-black overflow-hidden flex flex-col transition-all duration-300 shadow-sm">
      <Link to={`/products/${product.slug}`} className="block flex-1 flex flex-col">

        {/* ── Image area ── */}
        <div className="aspect-square relative overflow-hidden bg-neutral-50">
          {primaryImage ? (
            <>
              {/* Primary image */}
              <img
                src={primaryImage}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                }`}
                onError={() => setImgError(true)}
                loading="lazy"
              />
              {/* Hover image (second image swap) */}
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt={`${product.name} – alternate view`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            /* No-image placeholder */
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-neutral-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em]">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.organic && (
              <span className="bg-[#21a732] text-white font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5">
                Organic
              </span>
            )}
            {product.plusSizeAvailable && (
              <span className="bg-neutral-800 text-white font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5">
                Plus Size
              </span>
            )}
          </div>

          {/* Quick-action overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <span className="bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 hover:bg-magenta hover:text-black">
              View Product
            </span>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-5 flex flex-col gap-1 flex-1">
          {/* Brand + Category */}
          <div className="flex items-center gap-2 mb-1">
            {product.brandName && (
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-magenta">
                {product.brandName}
              </span>
            )}
            {product.brandName && product.category?.name && (
              <span className="text-neutral-300 text-[9px]">·</span>
            )}
            {product.category?.name && (
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-display font-bold text-[15px] text-black leading-snug line-clamp-2 group-hover:text-magenta transition-colors duration-200">
            {product.name}
          </h3>

          {/* Fabric / Gender pills */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {product.fabric && (
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500 border border-neutral-200 px-1.5 py-0.5">
                {product.fabric}
              </span>
            )}
            {product.gender && (
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500 border border-neutral-200 px-1.5 py-0.5">
                {product.gender}
              </span>
            )}
            {product.weight && (
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500 border border-neutral-200 px-1.5 py-0.5">
                {product.weight}
              </span>
            )}
          </div>

          {/* Price + MOQ */}
          <div className="mt-auto pt-4 flex items-end justify-between border-t border-neutral-100 mt-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400 mb-0.5">from</p>
              <p className="font-display font-bold text-lg text-black leading-none">
                {formatCurrency(product.basePrice, product.currency)}
              </p>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400">
              MOQ: {product.minimumOrderQuantity}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
