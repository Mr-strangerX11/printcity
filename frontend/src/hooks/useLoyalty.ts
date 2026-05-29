'use client';

import { loyaltyApi } from '@/lib/api';
import { useFetch, FetchState } from './useFetch';

export interface LoyaltyPoints {
  totalPoints: number;
  availablePoints: number;
  tierName: string;
  breakdown?: { purchases: number; referrals: number; reviews: number; birthday: number };
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discountAmount?: number;
  category: string;
  isActive: boolean;
}

export interface LoyaltyTierStatus {
  currentTier: string;
  pointsInTier: number;
  nextTier: string | null;
  pointsToNextTier: number;
}

export function useLoyaltyPoints(options?: { enabled?: boolean }): FetchState<LoyaltyPoints> {
  return useFetch<LoyaltyPoints>(
    async () => {
      const { data } = await loyaltyApi.getPoints();
      return data.data as LoyaltyPoints;
    },
    [],
    { cacheKey: 'loyalty:points', ttl: 60_000, enabled: options?.enabled ?? true },
  );
}

export function useLoyaltyRewards(options?: { enabled?: boolean }): FetchState<LoyaltyReward[]> {
  return useFetch<LoyaltyReward[]>(
    async () => {
      const { data } = await loyaltyApi.getRewards();
      return (data.data ?? []) as LoyaltyReward[];
    },
    [],
    { cacheKey: 'loyalty:rewards', ttl: 300_000, enabled: options?.enabled ?? true },
  );
}

export function useLoyaltyTier(options?: { enabled?: boolean }): FetchState<LoyaltyTierStatus> {
  return useFetch<LoyaltyTierStatus>(
    async () => {
      const { data } = await loyaltyApi.getTierStatus();
      return data.data as LoyaltyTierStatus;
    },
    [],
    { cacheKey: 'loyalty:tier', ttl: 300_000, enabled: options?.enabled ?? true },
  );
}
