'use client';

import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface ProductsParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: string;
  maxPrice?: string;
  status?: string;
}

interface ProductListResult {
  items: Product[];
  meta: PaginatedResponse<Product>['meta'];
}

export function useProducts(
  params: ProductsParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<ProductListResult> {
  const cacheKey = `products:${JSON.stringify(params)}`;

  return useFetch<ProductListResult>(
    async () => {
      const { data } = await productsApi.list(params);
      return data.data as ProductListResult;
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 30_000, enabled: options?.enabled ?? true },
  );
}

export function useProduct(
  slug: string,
  options?: { ttl?: number; enabled?: boolean },
): FetchState<Product> {
  const cacheKey = `product:${slug}`;

  return useFetch<Product>(
    async () => {
      const { data } = await productsApi.get(slug);
      return data.data as Product;
    },
    [slug],
    { cacheKey, ttl: options?.ttl ?? 60_000, enabled: (options?.enabled ?? true) && !!slug },
  );
}

export function useCategories(options?: { ttl?: number; enabled?: boolean }): FetchState<Category[]> {
  return useFetch<Category[]>(
    async () => {
      const { data } = await categoriesApi.list();
      return data.data as Category[];
    },
    [],
    { cacheKey: 'categories', ttl: options?.ttl ?? 120_000, enabled: options?.enabled ?? true },
  );
}
