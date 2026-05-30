'use client';

import { useMemo } from 'react';
import { productionApi } from '@/lib/api';
import { PrintJob, QualityCheck, Shipment, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface ProductionParams {
  status?: string;
  page?: number;
  limit?: number;
}

interface PrintJobListResult {
  items: PrintJob[];
  meta?: PaginatedResponse<PrintJob>['meta'];
}

interface PrintJobStats {
  total: number;
  queued: number;
  inProgress: number;
  completed: number;
  failed: number;
}

export function usePrintJobs(
  params: ProductionParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<PrintJobListResult> {
  const stableParams = useMemo(() => params, [JSON.stringify(params)]); // JSON.stringify stabilises object identity
  const cacheKey = `print-jobs:${JSON.stringify(stableParams)}`;

  return useFetch<PrintJobListResult>(
    async () => {
      const { data } = await productionApi.listPrintJobs(stableParams);
      const raw = data.data;
      const items: PrintJob[] = Array.isArray(raw) ? raw : raw?.items ?? [];
      return { items, meta: Array.isArray(raw) ? undefined : raw?.meta };
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}

export function usePrintJobStats(options?: { ttl?: number; enabled?: boolean }): FetchState<PrintJobStats> {
  return useFetch<PrintJobStats>(
    async () => {
      const { data } = await productionApi.printJobStats();
      return data.data as PrintJobStats;
    },
    [],
    { cacheKey: 'print-jobs:stats', ttl: options?.ttl ?? 60_000, enabled: options?.enabled ?? true },
  );
}

export function useQualityChecks(
  params: ProductionParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<QualityCheck[]> {
  const stableParams = useMemo(() => params, [JSON.stringify(params)]); // JSON.stringify stabilises object identity
  const cacheKey = `qc:${JSON.stringify(stableParams)}`;

  return useFetch<QualityCheck[]>(
    async () => {
      const { data } = await productionApi.listQC(stableParams);
      const raw = data.data;
      return (Array.isArray(raw) ? raw : raw?.items ?? []) as QualityCheck[];
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}

export function useShipments(
  params: ProductionParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<Shipment[]> {
  const stableParams = useMemo(() => params, [JSON.stringify(params)]); // JSON.stringify stabilises object identity
  const cacheKey = `shipments:${JSON.stringify(stableParams)}`;

  return useFetch<Shipment[]>(
    async () => {
      const { data } = await productionApi.listShipments(stableParams);
      const raw = data.data;
      return (Array.isArray(raw) ? raw : raw?.items ?? []) as Shipment[];
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}
