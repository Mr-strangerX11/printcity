'use client';

import { referralApi } from '@/lib/api';
import { useFetch, FetchState } from './useFetch';

export interface ReferralCode {
  code: string;
  discountPercent: number;
  usesCount: number;
  referralLink?: string;
}

export interface ReferralStats {
  totalReferred: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewardPoints: number;
}

export function useReferralCode(options?: { enabled?: boolean }): FetchState<ReferralCode> {
  return useFetch<ReferralCode>(
    async () => {
      const { data } = await referralApi.getCode();
      return data.data as ReferralCode;
    },
    [],
    { cacheKey: 'referral:code', ttl: 300_000, enabled: options?.enabled ?? true },
  );
}

export function useReferralStats(options?: { enabled?: boolean }): FetchState<ReferralStats> {
  return useFetch<ReferralStats>(
    async () => {
      const { data } = await referralApi.getStats();
      return data.data as ReferralStats;
    },
    [],
    { cacheKey: 'referral:stats', ttl: 60_000, enabled: options?.enabled ?? true },
  );
}
