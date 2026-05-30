'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, DollarSign, TrendingUp, TrendingDown, Eye, Plus, AlertCircle,
  ArrowUpRight, Star, Clock, BarChart2, ShoppingBag, ChevronRight,
  Lightbulb, MessageSquare, RefreshCw, CheckCircle, Target,
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  useProducts, usePayouts, usePayoutEarnings, useVendorProfile,
  useVendorSales, useVendorOrdersByStatus, useOrders,
} from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { reviewsApi, ordersApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard, ChartContainer, SkeletonLoader, AlertCard } from '@/components/shared';
import { toast } from 'sonner';
import type { Period } from '@/hooks';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PRINTING: '#8b5cf6',
  SHIPPED: '#06b6d4', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
};

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'text-amber-700', SILVER: 'text-slate-600', GOLD: 'text-yellow-600', PLATINUM: 'text-purple-600',
};

// ── Performance Suggestion card ────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '📸', title: 'Add more product images', message: 'Products with 4+ images have 35% higher conversion.', action: 'Upload Images', href: '/vendor/designs' },
  { icon: '⭐', title: 'Ask for more reviews', message: '32% of your buyers haven\'t left a review yet.', action: 'View Orders', href: '/vendor/orders' },
  { icon: '📦', title: 'Check inventory levels', message: 'Some variants may be running low on stock.', action: 'Manage', href: '/vendor/designs' },
  { icon: '💬', title: 'Respond to support tickets', message: 'Quick responses improve your seller rating.', action: 'Open Support', href: '/dashboard/support' },
];

export default function VendorDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('30d');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);

  // Data hooks
  const { data: productsData, loading: l1 } = useProducts({ limit: 6 });
  const { data: earnings, loading: l2 } = usePayoutEarnings();
  const { data: vendorProfile, loading: l3 } = useVendorProfile();
  const { data: payoutsData, loading: l4 } = usePayouts({ limit: 3 });
  const { data: vendorSales, loading: salesLoading } = useVendorSales(period);
  const { data: orderStatusData = [] } = useVendorOrdersByStatus();
  const { data: ordersData } = useOrders({ limit: 5 });

  const products = productsData?.items ?? [];
  const payouts = payoutsData?.items ?? [];
  const recentOrders = ordersData?.items ?? [];
  const loading = l1 || l2 || l3 || l4;

  const isPending = vendorProfile?.status === 'PENDING';
  const isSuspended = vendorProfile?.status === 'SUSPENDED';
  const commissionRate = (vendorProfile?.commissionRate ?? 0.1) * 100;
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
  const pendingProducts = products.filter(p => p.status === 'PENDING_APPROVAL').length;

  // Financial derived values
  const grossSales = vendorSales?.totalRevenue ?? (earnings as any)?.totalEarnings ?? 0;
  const netEarnings = grossSales * (1 - (vendorProfile?.commissionRate ?? 0.1));
  const commission = grossSales - netEarnings;

  const periodOptions = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
  ];

  const trendBadge = (v?: string) => {
    if (!v) return null;
    const pos = !v.startsWith('-');
    return (
      <span className={`flex items-center gap-0.5 text-xs font-bold ${pos ? 'text-green-600' : 'text-red-500'}`}>
        {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {v}
      </span>
    );
  };

  if (loading) return (
    <div className="space-y-4"><SkeletonLoader variant="card" count={4} /></div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
            {(vendorProfile?.storeName ?? user?.name ?? 'V')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-heading)] leading-tight">
              {vendorProfile?.storeName ?? 'Your Store'}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value as Period)}
            className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25"
            style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' }}>
            {periodOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Link href="/vendor/designs/new"
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all hover:opacity-90 shadow-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
            <Plus className="w-4 h-4" /> New Design
          </Link>
        </div>
      </div>

      {/* ── Status Banners ───────────────────────────────────────────────── */}
      {isPending && (
        <AlertCard priority="warning" title="Store Pending Approval"
          message="Your store is under review. You can upload designs now — they'll go live once approved." />
      )}
      {isSuspended && (
        <AlertCard priority="critical" title="Store Suspended"
          message="Your store has been suspended. Please contact support to resolve this." actionLabel="Contact Support" actionHref="/dashboard/support" />
      )}
      {pendingProducts > 0 && (
        <AlertCard priority="info" title={`${pendingProducts} product(s) awaiting approval`}
          message="Products need admin review before going live." actionLabel="View Products" actionHref="/vendor/designs" />
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={(vendorSales?.totalOrders ?? recentOrders.length).toLocaleString()}
          icon={<ShoppingBag className="w-5 h-5 text-blue-500" />}
          trend={vendorSales?.ordersVsPrevious ? { value: vendorSales.ordersVsPrevious, positive: !vendorSales.ordersVsPrevious.startsWith('-') } : undefined}
          sub={`${period} period`}
          href="/vendor/orders"
        />
        <StatCard
          label="Revenue"
          value={formatPrice(grossSales)}
          icon={<DollarSign className="w-5 h-5 text-green-500" />}
          trend={vendorSales?.revenueVsPrevious ? { value: vendorSales.revenueVsPrevious, positive: !vendorSales.revenueVsPrevious.startsWith('-') } : undefined}
          sub={`${commissionRate.toFixed(0)}% commission`}
          href="/vendor/earnings"
        />
        <StatCard
          label="Avg Order Value"
          value={formatPrice(vendorSales?.averageOrderValue ?? (grossSales / Math.max(vendorSales?.totalOrders ?? 1, 1)))}
          icon={<Target className="w-5 h-5 text-purple-500" />}
          href="/vendor/orders"
        />
        <StatCard
          label="Active Products"
          value={activeProducts.toLocaleString()}
          icon={<Package className="w-5 h-5 text-orange-500" />}
          sub={pendingProducts > 0 ? `${pendingProducts} pending review` : 'All active'}
          href="/vendor/designs"
        />
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <ChartContainer title="Sales Trend" subtitle="Revenue over time" className="lg:col-span-2"
          loading={salesLoading}
          periodSelector={{ value: period, onChange: v => setPeriod(v as Period), options: periodOptions }}>
          {(vendorSales?.dailySales ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={vendorSales!.dailySales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)}
                  tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
                  dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Analytics coming soon</p>
              </div>
            </div>
          )}
        </ChartContainer>

        {/* Orders by Status */}
        <ChartContainer title="Order Status" subtitle="Current breakdown">
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatusData} dataKey="count" nameKey="status"
                  cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {orderStatusData.map((entry: any, i: number) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No order data</p>
              </div>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* ── Performance Suggestions ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="font-black text-[var(--text-heading)]">Performance Suggestions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.filter((_, i) => !dismissedSuggestions.includes(i)).slice(0, 4).map((s, i) => (
            <div key={i} className="rounded-2xl border p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
              <span className="text-2xl flex-shrink-0">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text-heading)] text-sm">{s.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.message}</p>
                <Link href={s.href}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                  {s.action} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <button onClick={() => setDismissedSuggestions(p => [...p, i])}
                className="text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors text-xs flex-shrink-0">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial Breakdown ── */}
      <div className="rounded-2xl border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h2 className="font-black text-[var(--text-heading)]">Financial Breakdown</h2>
          </div>
          <Link href="/vendor/earnings" className="text-xs text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 transition-colors">
            View History <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Earnings Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-widest">This Period</h3>
            {[
              { label: 'Gross Sales', value: formatPrice(grossSales), extra: '' },
              { label: `Commission (${commissionRate.toFixed(0)}%)`, value: `-${formatPrice(commission)}`, extra: 'text-red-500' },
              { label: 'Net Earnings', value: formatPrice(netEarnings), extra: 'text-green-600 font-black text-base' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 last:border-0"
                style={{ borderBottom: '1px solid var(--border-color)' }}>
                <span className="text-sm text-[var(--text-body)]">{row.label}</span>
                <span className={`text-sm font-bold text-[var(--text-heading)] ${row.extra}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Payout Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-widest">Payout Schedule</h3>
            <div className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-body)]">Available Balance</span>
                <span className="font-black text-green-600">{formatPrice((earnings as any)?.availableBalance ?? (earnings as any)?.pendingEarnings ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-body)]">Commission Rate</span>
                <span className="font-bold text-[var(--text-heading)]">{commissionRate.toFixed(0)}%</span>
              </div>
              <Link href="/vendor/earnings"
                className="flex items-center justify-center gap-2 w-full mt-3 py-2 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
                View Payout History
              </Link>
            </div>

            {payouts.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-faint)] mb-2">Recent payouts</p>
                {payouts.slice(0, 2).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-[var(--text-muted)] text-xs">{formatDate(p.periodEnd)}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} type="payment" />
                      <span className="font-bold text-[var(--text-heading)]">{formatPrice(p.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      {recentOrders.length > 0 && (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="font-black text-[var(--text-heading)]">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-xs text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {recentOrders.slice(0, 5).map(order => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--hover-bg)] transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[var(--text-heading)] font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-[var(--text-faint)]">{formatDate(order.createdAt)} · {order.items.length} items</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.orderStatus} type="order" />
                  <p className="text-sm font-black text-[var(--text-heading)]">{formatPrice(order.totalAmount)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/vendor/designs/new', icon: <Plus className="w-5 h-5 text-white" />, label: 'Upload Design', bg: 'linear-gradient(135deg,#2563EB,#1d4ed8)' },
          { href: '/vendor/designs', icon: <Package className="w-5 h-5 text-white" />, label: 'Manage Products', bg: 'linear-gradient(135deg,#7C3AED,#6d28d9)' },
          { href: '/vendor/earnings', icon: <DollarSign className="w-5 h-5 text-white" />, label: 'View Earnings', bg: 'linear-gradient(135deg,#16a34a,#15803d)' },
          { href: '/vendor/settings', icon: <Eye className="w-5 h-5 text-white" />, label: 'Store Settings', bg: 'linear-gradient(135deg,#374151,#1f2937)' },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-3 p-4 rounded-2xl border hover:shadow-sm transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: a.bg }}>{a.icon}</div>
            <span className="text-sm font-semibold text-[var(--text-heading)] truncate">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
