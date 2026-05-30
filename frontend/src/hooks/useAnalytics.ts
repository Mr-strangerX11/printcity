'use client';

import { analyticsApi } from '@/lib/api';
import { useFetch, FetchState } from './useFetch';

export type Period = '7d' | '30d' | '90d';

export interface KpiMetric {
  current: number;
  previous: number;
  trend: string;
}

export interface AdminKpis {
  revenue: KpiMetric;
  orders: KpiMetric;
  aov: KpiMetric;
  vendors?: KpiMetric;
  customers?: KpiMetric;
  pendingOrders?: number;
  deliveredOrders?: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  aov?: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface VendorRevenueData {
  vendorId: string;
  vendorName: string;
  revenue: number;
  orders: number;
  commission?: number;
  rating?: number;
}

export interface PaymentMethodData {
  method: string;
  transactionCount: number;
  totalAmount: number;
  successRate: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  services: Record<string, { status: string; responseTime?: number; successRate?: number }>;
}

export interface VendorSalesSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate?: number;
  customerRating?: number;
  ordersVsPrevious?: string;
  revenueVsPrevious?: string;
  dailySales?: RevenueDataPoint[];
}

export function useAdminKpis(period: Period = '30d'): FetchState<AdminKpis> {
  return useFetch<AdminKpis>(
    async () => {
      const { data } = await analyticsApi.adminKpis(period);
      return data.data as AdminKpis;
    },
    [period],
    { cacheKey: `analytics:kpis:${period}`, ttl: 300_000 },
  );
}

export function useRevenueAnalytics(period: Period = '30d'): FetchState<RevenueDataPoint[]> {
  return useFetch<RevenueDataPoint[]>(
    async () => {
      const { data } = await analyticsApi.adminRevenue(period);
      return (data.data ?? []) as RevenueDataPoint[];
    },
    [period],
    { cacheKey: `analytics:revenue:${period}`, ttl: 300_000 },
  );
}

export function useOrdersByStatus(): FetchState<OrderStatusData[]> {
  return useFetch<OrderStatusData[]>(
    async () => {
      const { data } = await analyticsApi.ordersByStatus();
      return (data.data ?? []) as OrderStatusData[];
    },
    [],
    { cacheKey: 'analytics:orders-status', ttl: 300_000 },
  );
}

export function useVendorsRevenue(limit = 10, period: Period = '30d'): FetchState<VendorRevenueData[]> {
  return useFetch<VendorRevenueData[]>(
    async () => {
      const { data } = await analyticsApi.vendorsRevenue(limit, period);
      return (data.data ?? []) as VendorRevenueData[];
    },
    [limit, period],
    { cacheKey: `analytics:vendors:${period}`, ttl: 300_000 },
  );
}

export function usePaymentMethods(): FetchState<PaymentMethodData[]> {
  return useFetch<PaymentMethodData[]>(
    async () => {
      const { data } = await analyticsApi.paymentMethods();
      return (data.data ?? []) as PaymentMethodData[];
    },
    [],
    { cacheKey: 'analytics:payments', ttl: 300_000 },
  );
}

export function useSystemHealth(): FetchState<SystemHealth> {
  return useFetch<SystemHealth>(
    async () => {
      const { data } = await analyticsApi.systemHealth();
      return data.data as SystemHealth;
    },
    [],
    { cacheKey: 'analytics:health', ttl: 60_000 },
  );
}

export function useVendorSales(period: Period = '30d'): FetchState<VendorSalesSummary> {
  return useFetch<VendorSalesSummary>(
    async () => {
      const { data } = await analyticsApi.vendorSales(period);
      return data.data as VendorSalesSummary;
    },
    [period],
    { cacheKey: `analytics:vendor-sales:${period}`, ttl: 300_000 },
  );
}

export function useVendorOrdersByStatus(): FetchState<OrderStatusData[]> {
  return useFetch<OrderStatusData[]>(
    async () => {
      const { data } = await analyticsApi.vendorOrdersByStatus();
      return (data.data ?? []) as OrderStatusData[];
    },
    [],
    { cacheKey: 'analytics:vendor-orders-status', ttl: 300_000 },
  );
}
