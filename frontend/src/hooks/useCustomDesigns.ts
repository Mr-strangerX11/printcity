'use client';

import { customDesignApi } from '@/lib/api';
import { CustomDesignOrder, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface CustomDesignsParams {
  status?: string;
  page?: number;
  limit?: number;
}

interface CustomDesignListResult {
  items: CustomDesignOrder[];
  meta?: PaginatedResponse<CustomDesignOrder>['meta'];
}

export function useCustomDesigns(
  params: CustomDesignsParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<CustomDesignListResult> {
  const cacheKey = `custom-designs:${JSON.stringify(params)}`;

  return useFetch<CustomDesignListResult>(
    async () => {
      const { data } = await customDesignApi.list(params);
      const raw = data.data;
      const items: CustomDesignOrder[] = Array.isArray(raw) ? raw : raw?.items ?? [];
      return { items, meta: Array.isArray(raw) ? undefined : raw?.meta };
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}

export function useCustomDesign(
  id: string,
  options?: { ttl?: number },
): FetchState<CustomDesignOrder> {
  const cacheKey = `custom-design:${id}`;

  return useFetch<CustomDesignOrder>(
    async () => {
      const { data } = await customDesignApi.get(id);
      return data.data as CustomDesignOrder;
    },
    [id],
    { cacheKey, ttl: options?.ttl ?? 30_000, enabled: !!id },
  );
}
