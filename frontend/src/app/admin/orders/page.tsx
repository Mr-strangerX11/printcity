'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks';
import { OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Package, RefreshCw } from 'lucide-react';

const STATUSES: OrderStatus[] = ['PENDING','CONFIRMED','PRINTING','PACKED','SHIPPED','DELIVERED','CANCELLED','REFUNDED'];
const POLL_INTERVAL = 30_000; // refresh every 30 s so new orders appear automatically

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const { data, loading, refetch } = useOrders(
    { status: status || undefined, page, limit: 20 },
    { ttl: 0 }, // always fetch fresh; admin panel must never serve stale orders
  );
  const orders = data?.items ?? [];
  const total  = data?.meta.total ?? 0;

  // Auto-poll so orders placed by customers appear without a manual refresh
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  useEffect(() => {
    const id = setInterval(() => refetchRef.current(), POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const setStatus = (s: string) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    router.push(`/admin/orders?${p.toString()}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-heading)]">Orders</h1>
          <p className="text-xs text-[var(--text-faint)] mt-0.5">{total.toLocaleString()} total · refreshes every 30 s</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--hover-bg)] disabled:opacity-50"
          style={{ border: '1px solid var(--border-color)', color: 'var(--text-body)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Status filter pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => setStatus('')}
          className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
          style={!status
            ? { background: 'linear-gradient(135deg,#7C3AED,#2563EB)', color: '#fff' }
            : { background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-body)' }}>
          All
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={status === s
              ? { background: 'linear-gradient(135deg,#7C3AED,#2563EB)', color: '#fff' }
              : { background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-body)' }}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--surface-alt)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide hidden md:table-cell">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide hidden sm:table-cell">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {loading && orders.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-4 rounded skeleton" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Package className="w-10 h-10 mx-auto mb-3 text-[var(--text-faint)] opacity-40" />
                    <p className="text-[var(--text-muted)] text-sm">No orders found</p>
                  </td>
                </tr>
              ) : orders.map(order => {
                const oid = order.id ?? (order as any)._id ?? '';
                return (
                <tr key={oid} className="hover:bg-[var(--hover-bg)] transition-colors">
                  <td className="px-4 py-3 font-semibold text-[var(--text-heading)] text-sm font-mono">
                    #{oid.toString().slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-body)] hidden md:table-cell">
                    {order.user?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden lg:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-body)] hidden md:table-cell">
                    {order.items?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 font-bold text-[var(--text-heading)] text-sm">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.orderStatus} type="order" />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${oid}`}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminOrdersContent />
    </Suspense>
  );
}
