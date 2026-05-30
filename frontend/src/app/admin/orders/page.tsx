'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks';
import { OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Package } from 'lucide-react';

const STATUSES: OrderStatus[] = ['PENDING','CONFIRMED','PRINTING','PACKED','SHIPPED','DELIVERED','CANCELLED','REFUNDED'];

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const { data, loading } = useOrders({ status: status || undefined, page, limit: 20 });
  const orders = data?.items ?? [];
  const total = data?.meta.total ?? 0;

  const setStatus = (s: string) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    router.push(`/admin/orders?${p.toString()}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[var(--text-heading)]">Orders</h1>
        <span className="text-sm text-[var(--text-muted)] tabular-nums">{total.toLocaleString()} total</span>
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
              {loading ? (
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
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-[var(--hover-bg)] transition-colors">
                  <td className="px-4 py-3 font-semibold text-[var(--text-heading)] text-sm font-mono">
                    #{order.id.slice(-8).toUpperCase()}
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
                    <Link href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
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
