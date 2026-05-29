'use client';

import { supportApi } from '@/lib/api';
import { SupportTicket, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface SupportParams {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

interface TicketListResult {
  items?: SupportTicket[];
  meta?: PaginatedResponse<SupportTicket>['meta'];
}

interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export function useSupportTickets(
  params: SupportParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<SupportTicket[]> {
  const cacheKey = `support:${JSON.stringify(params)}`;

  return useFetch<SupportTicket[]>(
    async () => {
      const { data } = await supportApi.list(params);
      const raw = data.data;
      return (Array.isArray(raw) ? raw : raw?.items ?? []) as SupportTicket[];
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}

export function useSupportTicket(
  id: string,
  options?: { ttl?: number },
): FetchState<SupportTicket> {
  const cacheKey = `support-ticket:${id}`;

  return useFetch<SupportTicket>(
    async () => {
      const { data } = await supportApi.get(id);
      return data.data as SupportTicket;
    },
    [id],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: !!id },
  );
}

export function useSupportStats(options?: { ttl?: number; enabled?: boolean }): FetchState<SupportStats> {
  return useFetch<SupportStats>(
    async () => {
      const { data } = await supportApi.stats();
      return data.data as SupportStats;
    },
    [],
    { cacheKey: 'support:stats', ttl: options?.ttl ?? 60_000, enabled: options?.enabled ?? true },
  );
}
