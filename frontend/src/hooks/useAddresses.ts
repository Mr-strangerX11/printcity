'use client';

import { addressesApi } from '@/lib/api';
import { useFetch, FetchState } from './useFetch';

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  country: string;
  isDefault: boolean;
}

export function useAddresses(options?: { ttl?: number; enabled?: boolean }): FetchState<Address[]> {
  return useFetch<Address[]>(
    async () => {
      const { data } = await addressesApi.list();
      return (data.data ?? []) as Address[];
    },
    [],
    { cacheKey: 'addresses', ttl: options?.ttl ?? 60_000, enabled: options?.enabled ?? true },
  );
}
