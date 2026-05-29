'use client';

import { couponsApi } from '@/lib/api';
import { Coupon, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface CouponsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

interface CouponListResult {
  items: Coupon[];
  meta?: PaginatedResponse<Coupon>['meta'];
}

interface CouponStats {
  total: number;
  active: number;
  totalUsage: number;
  totalDiscount: number;
}

export function useCoupons(
  params: CouponsParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<CouponListResult> {
  const cacheKey = `coupons:${JSON.stringify(params)}`;

  return useFetch<CouponListResult>(
    async () => {
      const { data } = await couponsApi.list(params);
      const raw = data.data;
      const items: Coupon[] = Array.isArray(raw) ? raw : raw?.items ?? [];
      return { items, meta: Array.isArray(raw) ? undefined : raw?.meta };
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 30_000, enabled: options?.enabled ?? true },
  );
}

export function useCouponStats(options?: { ttl?: number; enabled?: boolean }): FetchState<CouponStats> {
  return useFetch<CouponStats>(
    async () => {
      const { data } = await couponsApi.stats();
      return data.data as CouponStats;
    },
    [],
    { cacheKey: 'coupons:stats', ttl: options?.ttl ?? 60_000, enabled: options?.enabled ?? true },
  );
}
