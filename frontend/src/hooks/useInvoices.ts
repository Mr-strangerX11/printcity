'use client';

import { invoicesApi } from '@/lib/api';
import { Invoice, InvoiceStats, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface InvoicesParams {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface InvoiceListResult {
  items: Invoice[];
  meta: PaginatedResponse<Invoice>['meta'];
}

export function useInvoices(
  params: InvoicesParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<InvoiceListResult> {
  const cacheKey = `invoices:${JSON.stringify(params)}`;

  return useFetch<InvoiceListResult>(
    async () => {
      const { data } = await invoicesApi.list(params);
      return data.data as InvoiceListResult;
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}

export function useInvoice(
  id: string,
  options?: { ttl?: number },
): FetchState<Invoice> {
  const cacheKey = `invoice:${id}`;

  return useFetch<Invoice>(
    async () => {
      const { data } = await invoicesApi.get(id);
      return data.data as Invoice;
    },
    [id],
    { cacheKey, ttl: options?.ttl ?? 30_000, enabled: !!id },
  );
}

export function useInvoiceStats(options?: { ttl?: number; enabled?: boolean }): FetchState<InvoiceStats> {
  return useFetch<InvoiceStats>(
    async () => {
      const { data } = await invoicesApi.stats();
      return data.data as InvoiceStats;
    },
    [],
    { cacheKey: 'invoices:stats', ttl: options?.ttl ?? 60_000, enabled: options?.enabled ?? true },
  );
}
