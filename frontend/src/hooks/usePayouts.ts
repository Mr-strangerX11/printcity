'use client';

import { payoutsApi } from '@/lib/api';
import { Payout, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface PayoutsParams {
  page?: number;
  limit?: number;
  status?: string;
}

interface PayoutListResult {
  items: Payout[];
  meta?: PaginatedResponse<Payout>['meta'];
}

interface EarningsResult {
  totalEarnings: number;
  pendingEarnings?: number;
  paidOut?: number;
  pendingItemCount?: number;
  availableBalance?: number;
  pendingPayouts?: number;
  commissionRate?: number;
  thisMonthEarnings?: number;
  [key: string]: unknown;
}

export function usePayouts(
  params: PayoutsParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<PayoutListResult> {
  const cacheKey = `payouts:${JSON.stringify(params)}`;

  return useFetch<PayoutListResult>(
    async () => {
      const { data } = await payoutsApi.list(params);
      const raw = data.data;
      // API may return array or { items, meta }
      const items: Payout[] = Array.isArray(raw) ? raw : raw?.items ?? [];
      return { items, meta: Array.isArray(raw) ? undefined : raw?.meta };
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 30_000, enabled: options?.enabled ?? true },
  );
}

export function usePayoutEarnings(options?: { ttl?: number; enabled?: boolean }): FetchState<EarningsResult> {
  return useFetch<EarningsResult>(
    async () => {
      const { data } = await payoutsApi.earnings();
      return data.data as EarningsResult;
    },
    [],
    { cacheKey: 'payouts:earnings', ttl: options?.ttl ?? 30_000, enabled: options?.enabled ?? true },
  );
}
