'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, SlidersHorizontal, Package } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/ui/ProductCard';
import { useProducts, useCategories } from '@/hooks';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc',label: 'Price: High → Low' },
  { value: 'popular',   label: 'Most Popular' },
];

const PRICE_PRESETS = [
  { label: 'Under Rs.500',      min: '',    max: '500' },
  { label: 'Rs.500–1,000',      min: '500', max: '1000' },
  { label: 'Rs.1,000–2,000',    min: '1000',max: '2000' },
  { label: 'Rs.2,000+',         min: '2000',max: '' },
];

const PAGE_SIZE = 20;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const search   = searchParams.get('search')   ?? '';
  const category = searchParams.get('category') ?? '';
  const sort     = searchParams.get('sort')     ?? 'newest';
  const page     = Number(searchParams.get('page') ?? 1);
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  useEffect(() => { setPriceMin(minPrice); setPriceMax(maxPrice); }, [minPrice, maxPrice]);

  const { data, loading } = useProducts({
    search, category, sort, page, limit: PAGE_SIZE,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
  });
  const { data: categories } = useCategories();

  const products    = data?.items ?? [];
  const total       = data?.meta.total ?? 0;
  const totalPages  = Math.ceil(total / PAGE_SIZE);
  const hasFilters  = !!(category || search || minPrice || maxPrice);

  const push = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const applyPrice = () => push({ minPrice: priceMin, maxPrice: priceMax });
  const clearAll   = () => { setPriceMin(''); setPriceMax(''); router.push('/products'); };

  const chips: { label: string; key: string }[] = [
    ...(category  ? [{ label: category.replace(/-/g, ' '),  key: 'category' }] : []),
    ...(search    ? [{ label: `"${search}"`,                 key: 'search'   }] : []),
    ...(minPrice  ? [{ label: `Min Rs.${minPrice}`,          key: 'minPrice' }] : []),
    ...(maxPrice  ? [{ label: `Max Rs.${maxPrice}`,          key: 'maxPrice' }] : []),
  ];

  const heading = search ? `Results for "${search}"` : category ? category.replace(/-/g, ' ') : 'All Products';

  return (
    <>
      <Navbar />
      <CategoryBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black capitalize text-[var(--text-heading)]">{heading}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {loading ? 'Loading products…' : `${total.toLocaleString()} products found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button onClick={() => setFiltersOpen(v => !v)}
              className={cn(
                'sm:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all',
                hasFilters
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-[var(--surface)] text-[var(--text-body)] border-[var(--border-color)] hover:bg-[var(--hover-bg)]',
              )}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
            {/* Sort */}
            <select value={sort} onChange={e => push({ sort: e.target.value })}
              className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer transition-all bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] focus:outline-none focus:ring-2 focus:ring-purple-500/25">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider">Filters:</span>
            {chips.map(chip => (
              <button key={chip.key} onClick={() => push({ [chip.key]: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors capitalize"
                style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.25)' }}>
                {chip.label} <X className="w-3 h-3" />
              </button>
            ))}
            <button onClick={clearAll}
              className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">

          {/* ── Filter sidebar ── */}
          <aside className={cn(
            'flex-shrink-0 w-56 space-y-5',
            filtersOpen ? 'block' : 'hidden sm:block',
          )}>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sticky top-32 space-y-5">

              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--text-heading)]">Filters</h3>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--text-faint)] mb-3">Category</p>
                <div className="space-y-0.5">
                  <button onClick={() => push({ category: '' })}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !category ? 'bg-purple-600 text-white font-semibold' : 'text-[var(--text-body)] hover:bg-[var(--hover-bg)]',
                    )}>
                    All Categories
                  </button>
                  {(categories ?? []).map(cat => (
                    <button key={cat.id} onClick={() => push({ category: cat.slug })}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
                        category === cat.slug ? 'bg-purple-600 text-white font-semibold' : 'text-[var(--text-body)] hover:bg-[var(--hover-bg)]',
                      )}>
                      <span>{cat.name}</span>
                      {cat._count && (
                        <span className={cn('text-xs tabular-nums', category === cat.slug ? 'text-white/70' : 'text-[var(--text-faint)]')}>
                          {cat._count.products}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--text-faint)] mb-3">Price Range (Rs.)</p>
                <div className="flex gap-2 mb-2.5">
                  <div className="flex-1">
                    <label className="text-[10px] text-[var(--text-faint)] mb-1 block">Min</label>
                    <input type="number" placeholder="0" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] focus:outline-none focus:ring-2 focus:ring-purple-500/25" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-[var(--text-faint)] mb-1 block">Max</label>
                    <input type="number" placeholder="Any" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] focus:outline-none focus:ring-2 focus:ring-purple-500/25" />
                  </div>
                </div>
                <button onClick={applyPrice}
                  className="w-full py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                  Apply
                </button>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {PRICE_PRESETS.map(p => (
                    <button key={p.label} onClick={() => push({ minPrice: p.min, maxPrice: p.max })}
                      className="px-2 py-1 text-[10px] font-medium rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--hover-bg)] transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ── Product grid ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border-color)]">
                    <div className="skeleton aspect-[4/3]" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                      <div className="skeleton h-8 rounded-xl mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 text-[var(--text-faint)]"
                  style={{ background: 'var(--surface-alt)' }}>
                  <Package className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-heading)] mb-2">No products found</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">
                  {hasFilters ? 'Try adjusting your filters or search terms.' : 'No products available yet.'}
                </p>
                {hasFilters && (
                  <button onClick={clearAll}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {[
                      { icon: '←', disabled: page <= 1, action: () => push({ page: String(page - 1) }) },
                    ].map(b => (
                      <button key="prev" onClick={b.action} disabled={b.disabled}
                        className="w-10 h-10 rounded-xl border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--hover-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                        {b.icon}
                      </button>
                    ))}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let p2 = i + 1;
                      if (totalPages > 7) {
                        if (page <= 4) p2 = i + 1;
                        else if (page >= totalPages - 3) p2 = totalPages - 6 + i;
                        else p2 = page - 3 + i;
                      }
                      return p2;
                    }).map(p2 => (
                      <button key={p2} onClick={() => push({ page: String(p2) })}
                        className={cn(
                          'w-10 h-10 rounded-xl text-sm font-semibold transition-all',
                          page === p2
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--hover-bg)]',
                        )}>
                        {p2}
                      </button>
                    ))}
                    <button onClick={() => push({ page: String(page + 1) })} disabled={page >= totalPages}
                      className="w-10 h-10 rounded-xl border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--hover-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--page-bg)' }} />}>
      <ProductsContent />
    </Suspense>
  );
}
