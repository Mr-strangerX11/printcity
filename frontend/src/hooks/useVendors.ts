'use client';

import { vendorsApi } from '@/lib/api';
import { Vendor } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface VendorsParams {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface VendorListResult {
  items?: Vendor[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export function useVendors(
  params: VendorsParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<Vendor[]> {
  const cacheKey = `vendors:${JSON.stringify(params)}`;

  return useFetch<Vendor[]>(
    async () => {
      const { data } = await vendorsApi.list(params);
      // API returns either array or { items, meta }
      const raw = data.data;
      return (Array.isArray(raw) ? raw : (raw as VendorListResult).items ?? []) as Vendor[];
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 30_000, enabled: options?.enabled ?? true },
  );
}

export function useVendor(
  slug: string,
  options?: { ttl?: number },
): FetchState<Vendor> {
  const cacheKey = `vendor:${slug}`;

  return useFetch<Vendor>(
    async () => {
      const { data } = await vendorsApi.get(slug);
      return data.data as Vendor;
    },
    [slug],
    { cacheKey, ttl: options?.ttl ?? 60_000, enabled: !!slug },
  );
}

export function useVendorProfile(options?: { ttl?: number; enabled?: boolean }): FetchState<Vendor> {
  return useFetch<Vendor>(
    async () => {
      const { data } = await vendorsApi.getProfile();
      return data.data as Vendor;
    },
    [],
    { cacheKey: 'vendor:me', ttl: options?.ttl ?? 60_000, enabled: options?.enabled ?? true },
  );
}
