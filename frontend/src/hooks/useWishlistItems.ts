'use client';

import { wishlistApi } from '@/lib/api';
import { useFetch, FetchState } from './useFetch';

interface WishlistProduct {
  id: string;
  title: string;
  slug: string;
  basePrice: string | number;
  images: { url: string }[];
  variants: { price: string | number; color: string; size: string }[];
  vendor: { storeName: string; storeSlug: string } | null;
  category: { name: string } | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
}

export function useWishlistItems(options?: { ttl?: number; enabled?: boolean }): FetchState<WishlistItem[]> {
  return useFetch<WishlistItem[]>(
    async () => {
      const { data } = await wishlistApi.get();
      return (data.data ?? []) as WishlistItem[];
    },
    [],
    { cacheKey: 'wishlist:items', ttl: options?.ttl ?? 30_000, enabled: options?.enabled ?? true },
  );
}
