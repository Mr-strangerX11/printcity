'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 30_000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 800;

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[],
  options?: { cacheKey?: string; ttl?: number; retries?: number; enabled?: boolean },
): FetchState<T> {
  const { cacheKey, ttl = DEFAULT_TTL, retries = MAX_RETRIES, enabled = true } = options ?? {};

  const [data, setData] = useState<T | null>(() => {
    if (!cacheKey) return null;
    const entry = cache.get(cacheKey) as CacheEntry<T> | undefined;
    return entry && entry.expiresAt > Date.now() ? entry.data : null;
  });
  const [loading, setLoading] = useState(enabled && !data);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const attemptRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async () => {
    if (!enabled) return;

    if (cacheKey) {
      const entry = cache.get(cacheKey) as CacheEntry<T> | undefined;
      if (entry && entry.expiresAt > Date.now()) {
        if (mountedRef.current) { setData(entry.data); setLoading(false); setError(null); }
        return;
      }
    }

    if (mountedRef.current) { setLoading(true); setError(null); }

    attemptRef.current = 0;

    while (attemptRef.current <= retries) {
      try {
        const result = await fetchFn();
        if (!mountedRef.current) return;
        if (cacheKey) cache.set(cacheKey, { data: result, expiresAt: Date.now() + ttl });
        setData(result);
        setLoading(false);
        return;
      } catch (err: unknown) {
        attemptRef.current++;
        if (attemptRef.current > retries) {
          if (!mountedRef.current) return;
          const msg = extractMessage(err);
          setError(msg);
          setLoading(false);
          return;
        }
        await sleep(RETRY_BASE_DELAY * 2 ** (attemptRef.current - 1));
      }
    }
  }, [enabled, cacheKey, ttl, retries, ...deps]); // deps spread intentional

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

function extractMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Something went wrong';
  const e = err as Record<string, unknown>;
  const raw = (e.response as Record<string, unknown> | undefined)?.data;
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (typeof r.message === 'string') return r.message;
    if (Array.isArray(r.message) && r.message.length) return String(r.message[0]);
  }
  if (typeof e.message === 'string') return e.message;
  return 'Something went wrong';
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
