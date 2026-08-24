import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductFiltersPanel } from '../../components/product/ProductFilters';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/common/LoadingSpinner';
import type { Product } from '../../types';
import type { FilterOptions, PaginatedResponse } from '@printfection/types';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    category: searchParams.get('category') || undefined,
    brand:    searchParams.get('brand')    || undefined,
    gender:   searchParams.get('gender')   || undefined,
    fabric:   searchParams.get('fabric')   || undefined,
    organic:  searchParams.get('organic')  === 'true' ? true : undefined,
    plusSizeAvailable: searchParams.get('plusSizeAvailable') === 'true' ? true : undefined,
    search:   searchParams.get('search')   || undefined,
    sort:     searchParams.get('sort')     || undefined,
    page:     parseInt(searchParams.get('page') || '1', 10),
  };

  const { data: filterOptions } = useQuery({
    queryKey: ['product-filters'],
    queryFn: () => apiGet<FilterOptions>('/products/filters'),
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      apiGet<PaginatedResponse<Product>>('/products', {
        ...filters,
        page: String(filters.page),
      } as Record<string, unknown>),
  });

  const updateFilter = (key: string, value: string | boolean | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', search || undefined);
  };

  const activeFilterCount = [
    filters.category, filters.brand, filters.gender, filters.fabric,
    filters.organic, filters.plusSizeAvailable, filters.search,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white text-black">

      {/* ── Page Header ── */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[64px] py-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-magenta mb-3">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            {' '}&rsaquo;{' '}Products
          </p>
          <h1 className="font-display font-black text-[clamp(36px,5vw,64px)] leading-none uppercase tracking-tighter text-black mb-4">
            The Full Catalog.
          </h1>
          <p className="text-neutral-600 text-lg max-w-xl">
            Premium blanks from the world's leading garment mills — ready for your artwork.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-[64px] py-8">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-stretch sm:items-center">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 max-w-lg gap-0">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-white border border-neutral-300 text-black text-sm px-4 py-2.5 placeholder-neutral-400 focus:outline-none focus:border-magenta transition-colors"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="bg-black text-white font-mono text-[10px] uppercase tracking-[0.15em] px-5 hover:bg-magenta hover:text-black transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort */}
          <select
            value={filters.sort || ''}
            onChange={(e) => updateFilter('sort', e.target.value || undefined)}
            className="bg-white border border-neutral-300 text-neutral-800 text-sm px-4 py-2.5 focus:outline-none focus:border-magenta font-mono appearance-none cursor-pointer sm:w-52"
            aria-label="Sort products"
          >
            <option value="">Sort: Name A–Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Mobile filter toggle */}
          <button
            className="sm:hidden flex items-center gap-2 bg-white border border-neutral-300 text-black font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2.5"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span className="material-symbols-outlined text-base">tune</span>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Product count */}
          {data && (
            <span className="hidden lg:block font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400 ml-auto whitespace-nowrap">
              {data.pagination.total} product{data.pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'category', label: 'Category', value: filters.category },
              { key: 'brand',    label: 'Brand',    value: filters.brand },
              { key: 'gender',   label: 'Gender',   value: filters.gender },
              { key: 'fabric',   label: 'Fabric',   value: filters.fabric },
              filters.organic ? { key: 'organic', label: 'Organic', value: 'true' } : null,
              filters.plusSizeAvailable ? { key: 'plusSizeAvailable', label: 'Plus Size', value: 'true' } : null,
              { key: 'search', label: 'Search', value: filters.search },
            ].filter(Boolean).filter((f) => f!.value).map((f) => (
              <button
                key={f!.key}
                onClick={() => updateFilter(f!.key, undefined)}
                className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 text-magenta font-mono text-[9px] uppercase tracking-[0.1em] px-2.5 py-1.5 hover:border-magenta hover:text-black transition-colors"
              >
                {f!.label}: {f!.value}
                <span className="text-[11px] leading-none">✕</span>
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400 hover:text-black transition-colors px-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">

          {/* ── Sidebar filters (desktop always visible, mobile toggle) ── */}
          <aside
            className={`flex-shrink-0 w-64 ${filtersOpen ? 'block' : 'hidden'} sm:block`}
            aria-label="Product filters"
          >
            <div className="sticky top-24 bg-neutral-50 border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black">Filters</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400 hover:text-magenta transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              {filterOptions ? (
                <ProductFiltersPanel
                  filters={filterOptions}
                  selected={{
                    category: filters.category,
                    brand: filters.brand,
                    gender: filters.gender,
                    fabric: filters.fabric,
                    organic: filters.organic,
                    plusSizeAvailable: filters.plusSizeAvailable,
                    search: filters.search,
                    sort: filters.sort,
                  }}
                  onChange={updateFilter}
                  onClear={clearFilters}
                />
              ) : (
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-[0.1em]">Loading…</p>
              )}
            </div>
          </aside>

          {/* ── Product grid ── */}
          <div className="flex-1 min-w-0">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <LoadingSpinner label="Loading products…" />
              </div>
            )}

            {error && (
              <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />
            )}

            {data && data.items.length === 0 && (
              <EmptyState
                title="No products found"
                description="Try adjusting your filters or search terms."
                action={
                  <button
                    onClick={clearFilters}
                    className="bg-[#FF007F] text-black font-mono text-[10px] uppercase tracking-[0.2em] px-6 py-3 hover:bg-white transition-colors"
                  >
                    Clear Filters
                  </button>
                }
              />
            )}

            {data && data.items.length > 0 && (
              <>
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.items.map((product) => (
                    <div key={product._id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
                    <button
                      onClick={() => updateFilter('page', String(Math.max(1, filters.page - 1)))}
                      disabled={filters.page <= 1}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400 px-3 py-2 border border-neutral-200 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      ←
                    </button>
                    {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', String(page))}
                        className={`font-mono text-[10px] uppercase tracking-[0.1em] w-9 h-9 border transition-colors ${
                          page === data.pagination.page
                            ? 'bg-magenta border-magenta text-white font-bold'
                            : 'border-neutral-200 text-neutral-400 hover:border-black hover:text-black'
                        }`}
                        aria-current={page === data.pagination.page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => updateFilter('page', String(Math.min(data.pagination.totalPages, filters.page + 1)))}
                      disabled={filters.page >= data.pagination.totalPages}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400 px-3 py-2 border border-neutral-200 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      →
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
