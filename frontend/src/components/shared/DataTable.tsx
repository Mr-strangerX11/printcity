'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, i: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string;
  filters?: React.ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search…',
  searchKeys,
  pageSize = 10,
  emptyTitle = 'No data',
  emptyDescription = 'Nothing to show here yet.',
  emptyIcon,
  actions,
  onRowClick,
  rowKey,
  filters,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const visibleCols = columns.filter(c => !c.hidden);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    const keys = searchKeys ?? (Object.keys(data[0] ?? {}) as (keyof T)[]);
    return data.filter(row =>
      keys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    );
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
    setPage(1);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="skeleton h-9 w-56 rounded-xl" />
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="skeleton h-8 w-8 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-1/3" />
                <div className="skeleton h-3 w-1/4" />
              </div>
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-3.5 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Toolbar */}
      {(searchable || actions || filters) && (
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] pointer-events-none" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className={cn(
                  'w-full pl-9 pr-4 py-2 text-sm rounded-xl border transition-all',
                  'bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)]',
                  'placeholder:text-[var(--text-faint)]',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500/50',
                )}
              />
            </div>
          )}
          {filters && <div className="flex items-center gap-2">{filters}</div>}
          {actions && <div className="flex items-center gap-2 sm:ml-auto">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border-color)' }}>
              {visibleCols.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--text-faint)] whitespace-nowrap select-none',
                    col.sortable && 'cursor-pointer hover:text-[var(--text-muted)] transition-colors',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    'text-left',
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp className="w-3 h-3 text-purple-500" />
                          : <ChevronDown className="w-3 h-3 text-purple-500" />
                        : <ChevronUp className="w-3 h-3 opacity-25" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--surface-alt)] text-[var(--text-faint)]">
                      {emptyIcon ?? <Search className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--text-heading)]">
                        {query ? 'No results found' : emptyTitle}
                      </p>
                      <p className="text-xs text-[var(--text-faint)] mt-0.5">
                        {query ? `No matches for "${query}"` : emptyDescription}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row) : i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors hover:bg-[var(--hover-bg)]',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {visibleCols.map(col => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-5 py-3.5 text-[var(--text-body)] whitespace-nowrap',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.render ? col.render(row, (page - 1) * pageSize + i) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > pageSize && (
        <div
          className="px-5 py-3.5 flex items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border-color)', background: 'var(--surface-alt)' }}
        >
          <p className="text-xs text-[var(--text-faint)]">
            Showing <span className="font-semibold text-[var(--text-body)]">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)}</span> of <span className="font-semibold text-[var(--text-body)]">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
              }
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-semibold transition-all',
                    p === page
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-[var(--hover-bg)]',
                  )}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
