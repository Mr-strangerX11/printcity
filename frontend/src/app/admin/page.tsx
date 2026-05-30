'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Users, DollarSign, Package,
  CheckCircle, XCircle, ArrowUpRight,
  Activity, Database, CreditCard, Mail, Server,
  Zap, BarChart2, Target,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useOrders, useOrderStats } from '@/hooks';
import { useVendors } from '@/hooks';
import { useProducts } from '@/hooks';
import {
  useAdminKpis, useRevenueAnalytics, useOrdersByStatus,
  useVendorsRevenue, usePaymentMethods, useSystemHealth,
} from '@/hooks';
import { vendorsApi } from '@/lib/api';
import { StatCard, ChartContainer, AlertCard, SkeletonLoader } from '@/components/shared';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Period } from '@/hooks';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PRINTING: '#8b5cf6',
  PACKED: '#6366f1', SHIPPED: '#06b6d4', DELIVERED: '#22c55e',
  CANCELLED: '#ef4444', REFUNDED: '#6b7280',
};


export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('30d');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Existing hooks
  const { data: ordersData, loading: ordersLoading } = useOrders({ limit: 10 });
  const { data: orderStats } = useOrderStats();
  const { data: pendingVendors = [], refetch: refetchVendors } = useVendors({ status: 'PENDING', limit: 5 });
  const { data: productsData } = useProducts({ limit: 1 });

  // Analytics hooks (require new backend module)
  const { data: kpis, loading: kpisLoading } = useAdminKpis(period);
  const { data: revenueData = [], loading: revenueLoading } = useRevenueAnalytics(period);
  const { data: orderStatusData = [] } = useOrdersByStatus();
  const { data: vendorsRevenue = [] } = useVendorsRevenue(10, period);
  const { data: paymentData = [] } = usePaymentMethods();
  const { data: health } = useSystemHealth();

  const recentOrders = ordersData?.items ?? [];

  // Build derived stats from existing data when analytics not available
  const revenue = kpis?.revenue?.current ?? (orderStats as any)?.totalRevenue ?? 0;
  const totalOrders = kpis?.orders?.current ?? (orderStats as any)?.totalOrders ?? ordersData?.meta?.total ?? 0;
  const pendingCount = kpis?.pendingOrders ?? (orderStats as any)?.pendingOrders ?? 0;
  const pendingVendorCount = Array.isArray(pendingVendors) ? pendingVendors.length : 0;
  // Alerts derived from existing data
  const alerts = [
    pendingCount > 0 && { id: 'pending-orders', priority: 'warning' as const, title: `${pendingCount} orders pending`, message: 'Orders waiting for confirmation', actionLabel: 'View Orders', actionHref: '/admin/orders?status=PENDING' },
    pendingVendorCount > 0 && { id: 'pending-vendors', priority: 'info' as const, title: `${pendingVendorCount} vendors awaiting approval`, message: 'Review and approve vendor applications', actionLabel: 'View Vendors', actionHref: '/admin/vendors?status=PENDING' },
  ].filter(Boolean).filter(a => a && !dismissedAlerts.includes((a as any).id)) as any[];

  const handleVendorAction = async (vendorId: string, action: 'approve' | 'reject') => {
    setApprovingId(vendorId);
    try {
      await vendorsApi.updateStatus(vendorId, action === 'approve' ? 'ACTIVE' : 'SUSPENDED');
      refetchVendors();
    } finally { setApprovingId(null); }
  };

  const periodOptions = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
  ];

  const trendFromKpi = (metric: { trend?: string; current?: number; previous?: number } | undefined) => {
    if (!metric) return undefined;
    if (metric.trend) {
      const positive = !metric.trend.startsWith('-');
      return { value: metric.trend, positive };
    }
    return undefined;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Platform overview and operations</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {periodOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a: any) => (
            <AlertCard
              key={a.id}
              priority={a.priority}
              title={a.title}
              message={a.message}
              actionLabel={a.actionLabel}
              actionHref={a.actionHref}
              onDismiss={() => setDismissedAlerts(p => [...p, a.id])}
            />
          ))}
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      {kpisLoading ? (
        <SkeletonLoader variant="card" count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatPrice(revenue)}
            icon={<DollarSign className="w-5 h-5 text-green-500" />}
            trend={trendFromKpi(kpis?.revenue)}
            sub={`${period} period`}
            href="/admin/payouts"
          />
          <StatCard
            label="Total Orders"
            value={totalOrders.toLocaleString()}
            icon={<ShoppingBag className="w-5 h-5 text-blue-500" />}
            trend={trendFromKpi(kpis?.orders)}
            sub={pendingCount > 0 ? `${pendingCount} pending` : 'All fulfilled'}
            href="/admin/orders"
          />
          <StatCard
            label="Avg Order Value"
            value={formatPrice(kpis?.aov?.current ?? (revenue / Math.max(totalOrders, 1)))}
            icon={<Target className="w-5 h-5 text-purple-500" />}
            trend={trendFromKpi(kpis?.aov)}
            href="/admin/orders"
          />
          <StatCard
            label="Active Vendors"
            value={(kpis?.vendors?.current ?? 0).toLocaleString() || '—'}
            icon={<Users className="w-5 h-5 text-yellow-500" />}
            trend={trendFromKpi(kpis?.vendors)}
            sub={pendingVendorCount > 0 ? `${pendingVendorCount} pending` : 'All active'}
            href="/admin/vendors"
          />
        </div>
      )}

      {/* ── Charts Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <ChartContainer
          title="Revenue Trend"
          subtitle="Daily revenue"
          className="lg:col-span-2"
          loading={revenueLoading}
          periodSelector={{ value: period, onChange: v => setPeriod(v as Period), options: periodOptions }}
        >
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)}
                  tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `Rs.${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [formatPrice(v), 'Revenue']}
                  labelFormatter={l => `Date: ${l}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
                  dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="orders" stroke="#a855f7" strokeWidth={1.5}
                  dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                Analytics module loading…
              </div>
            </div>
          )}
        </ChartContainer>

        {/* Orders by Status */}
        <ChartContainer title="Orders by Status" subtitle="Current breakdown">
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderStatusData} dataKey="count" nameKey="status"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {orderStatusData.map((entry: any, i: number) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [v, name]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v: string) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No data yet
              </div>
            </div>
          )}
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors by Revenue */}
        <ChartContainer title="Top Vendors" subtitle="By revenue this period"
          periodSelector={{ value: period, onChange: v => setPeriod(v as Period), options: periodOptions }}>
          {vendorsRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vendorsRevenue.slice(0, 8)} layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="vendorName" width={80} tick={{ fontSize: 10 }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => v.length > 12 ? `${v.slice(0, 12)}…` : v} />
                <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                Analytics module loading…
              </div>
            </div>
          )}
        </ChartContainer>

        {/* Payment Methods */}
        <ChartContainer title="Payment Methods" subtitle="Transaction breakdown">
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="method" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number, n: string) => [n === 'totalAmount' ? formatPrice(v) : v, n === 'totalAmount' ? 'Amount' : 'Count']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Bar dataKey="transactionCount" name="Transactions" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No payment data
              </div>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* ── System Health ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            <h2 className="font-black text-gray-900">System Health</h2>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            health?.status === 'healthy' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
            {health?.status === 'healthy' ? 'All Systems Operational' : (health ? 'Degraded' : 'Checking…')}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'api', label: 'API', icon: <Server className="w-4 h-4" />, fallback: 'operational' },
            { key: 'database', label: 'Database', icon: <Database className="w-4 h-4" />, fallback: 'operational' },
            { key: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" />, fallback: 'operational' },
            { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, fallback: 'operational' },
            { key: 'storage', label: 'Storage', icon: <Server className="w-4 h-4" />, fallback: 'operational' },
            { key: 'cache', label: 'Redis', icon: <Zap className="w-4 h-4" />, fallback: 'operational' },
          ].map(s => {
            const svc = health?.services?.[s.key];
            const status = svc?.status ?? s.fallback;
            const isOk = status === 'operational';
            return (
              <div key={s.key} className={`p-3 rounded-xl border ${isOk ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className={`flex items-center gap-1.5 mb-1 ${isOk ? 'text-green-600' : 'text-red-500'}`}>
                  {s.icon}
                  <span className="text-xs font-bold">{s.label}</span>
                </div>
                <p className={`text-xs font-semibold ${isOk ? 'text-green-700' : 'text-red-600'}`}>
                  {isOk ? '🟢 OK' : '🔴 Down'}
                </p>
                {svc?.responseTime && (
                  <p className="text-xs text-gray-400 mt-0.5">{svc.responseTime}ms</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Orders + Pending Vendors ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-black text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {ordersLoading ? (
            <div className="p-4"><SkeletonLoader variant="row" count={5} /></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-400 text-sm">No orders yet</div>
              ) : recentOrders.slice(0, 7).map(order => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 truncate">{order.user?.name} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:block"><StatusBadge status={order.paymentStatus} type="payment" /></span>
                    <StatusBadge status={order.orderStatus} type="order" />
                    <p className="text-sm font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-black text-gray-900">Pending Vendors</h2>
            <Link href="/admin/vendors" className="text-xs text-blue-600 font-semibold hover:text-blue-700">View all</Link>
          </div>
          {pendingVendorCount === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">All caught up!</p>
              <p className="text-xs text-gray-400">No pending applications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(Array.isArray(pendingVendors) ? pendingVendors : []).map((v: any) => (
                <div key={v.id} className="px-5 py-3.5">
                  <div className="mb-2">
                    <p className="font-bold text-sm text-gray-900 truncate">{v.storeName}</p>
                    <p className="text-xs text-gray-400 truncate">{v.user?.email ?? v.email}</p>
                    <p className="text-xs text-gray-400">{formatDate(v.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleVendorAction(v.id, 'approve')}
                      disabled={approvingId === v.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {approvingId === v.id ? '…' : 'Approve'}
                    </button>
                    <button onClick={() => handleVendorAction(v.id, 'reject')}
                      disabled={approvingId === v.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-700 disabled:opacity-60 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Reports ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/payouts', label: 'Payout Report', sub: 'Vendor earnings & payouts', icon: <DollarSign className="w-4 h-4" />, color: 'bg-green-50 border-green-100 text-green-700' },
          { href: '/admin/orders', label: 'Orders Report', sub: 'Order history & status', icon: <ShoppingBag className="w-4 h-4" />, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { href: '/admin/invoices', label: 'Invoice Report', sub: 'Billing & revenue data', icon: <BarChart2 className="w-4 h-4" />, color: 'bg-purple-50 border-purple-100 text-purple-700' },
        ].map(r => (
          <Link key={r.href} href={r.href}
            className={`flex items-center gap-3 p-4 rounded-2xl border hover:shadow-sm transition-all ${r.color}`}>
            <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">{r.icon}</div>
            <div>
              <p className="font-bold text-sm">{r.label}</p>
              <p className="text-xs opacity-70">{r.sub}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 ml-auto opacity-60" />
          </Link>
        ))}
      </div>
    </div>
  );
}
