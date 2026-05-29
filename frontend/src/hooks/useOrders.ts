'use client';

import { ordersApi } from '@/lib/api';
import { Order, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface OrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

interface OrderListResult {
  items: Order[];
  meta: PaginatedResponse<Order>['meta'];
}

interface OrderStats {
  total: number;
  delivered: number;
  pending: number;
  cancelled: number;
  revenue?: number;
}

export function useOrders(
  params: OrdersParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<OrderListResult> {
  const cacheKey = `orders:${JSON.stringify(params)}`;

  return useFetch<OrderListResult>(
    async () => {
      const { data } = await ordersApi.list(params);
      return data.data as OrderListResult;
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}

export function useOrder(
  id: string,
  options?: { ttl?: number },
): FetchState<Order> {
  const cacheKey = `order:${id}`;

  return useFetch<Order>(
    async () => {
      const { data } = await ordersApi.get(id);
      return data.data as Order;
    },
    [id],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: !!id },
  );
}

export function useOrderStats(options?: { ttl?: number; enabled?: boolean }): FetchState<OrderStats> {
  return useFetch<OrderStats>(
    async () => {
      const { data } = await ordersApi.stats();
      return data.data as OrderStats;
    },
    [],
    { cacheKey: 'orders:stats', ttl: options?.ttl ?? 60_000, enabled: options?.enabled ?? true },
  );
}
