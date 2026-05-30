'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate, ORDER_STATUS_COLORS, ORDER_TIMELINE } from '@/lib/utils';
import { Search, Package, Truck, MapPin, Loader2, ArrowRight } from 'lucide-react';


export default function TrackOrderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    if (!user) { router.push(`/login?redirect=/track-order`); return; }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await ordersApi.get(orderId.trim());
      setOrder(data.data);
    } catch (err: any) {
      setError(err.response?.status === 404
        ? 'Order not found. Please check the ID and try again.'
        : 'Failed to fetch order. Please try again.');
    } finally { setLoading(false); }
  };

  const currentStep = order ? ORDER_TIMELINE.findIndex((s: any) => s.status === order.status) : -1;

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: 'var(--page-bg)' }}>

        {/* ── Hero ── */}
        <section className="py-16" style={{ background: 'linear-gradient(145deg,#1e0545 0%,#1a237e 50%,#0d1b4b 100%)' }}>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Truck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Track Your Order</h1>
            <p className="text-blue-200 text-sm">Enter your order ID to see the latest status and shipping updates.</p>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-4 -mt-6 pb-20">

          {/* Search card */}
          <div className="rounded-2xl border shadow-lg p-6 mb-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
            <form onSubmit={handleTrack} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                <input
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  placeholder="Enter your Order ID (e.g. clx1234…)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all"
                  style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' }}
                />
              </div>
              <button type="submit" disabled={loading || !orderId.trim()}
                className="px-5 py-3 text-white font-semibold rounded-xl disabled:opacity-50 transition-all text-sm flex items-center gap-2 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track
              </button>
            </form>

            {!user && (
              <p className="mt-3 text-xs text-[var(--text-faint)] text-center">
                You need to{' '}
                <Link href="/login?redirect=/track-order" className="text-purple-600 font-medium hover:underline">
                  sign in
                </Link>{' '}
                to track an order.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-2xl p-4 mb-6 text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* ── Order result ── */}
          {order && (
            <div className="space-y-4 animate-fade-in">

              {/* Status card */}
              <div className="rounded-2xl border p-6"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs text-[var(--text-faint)] font-medium mb-1 uppercase tracking-wider">Order ID</p>
                    <p className="font-mono text-sm font-bold text-[var(--text-heading)]">{order.id.slice(0, 16)}…</p>
                    <p className="text-xs text-[var(--text-faint)] mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {ORDER_TIMELINE.map((step: any, i: number) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm border-2 transition-all ${
                            done
                              ? 'text-white border-transparent'
                              : 'border-[var(--border-color)] text-[var(--text-faint)]'
                          } ${active ? 'ring-4' : ''}`}
                            style={{
                              background: done ? 'linear-gradient(135deg,#7C3AED,#2563EB)' : 'var(--surface-alt)',
                              ...(active ? { boxShadow: '0 0 0 4px rgba(124,58,237,0.15)' } : {}),
                            }}>
                            {done ? '✓' : i + 1}
                          </div>
                          {i < ORDER_TIMELINE.length - 1 && (
                            <div className="w-0.5 h-8 mt-1 transition-colors"
                              style={{ background: done && i < currentStep ? '#7C3AED' : 'var(--border-color)' }} />
                          )}
                        </div>
                        <div className="pb-4 pt-1 min-w-0">
                          <p className={`text-sm font-semibold ${done ? 'text-[var(--text-heading)]' : 'text-[var(--text-faint)]'}`}>
                            {step.icon} {step.label}
                          </p>
                          {active && (
                            <p className="text-xs text-purple-600 font-medium mt-0.5">Current status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping info */}
              {order.shippingAddress && (
                <div className="rounded-2xl border p-5"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[var(--text-faint)]" />
                    <h3 className="font-bold text-sm text-[var(--text-heading)]">Delivery Address</h3>
                  </div>
                  <p className="text-sm text-[var(--text-body)] leading-relaxed">
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                    {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  {order.trackingNumber && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-xs text-[var(--text-faint)] mb-1">Tracking Number</p>
                      <p className="font-mono text-sm font-bold text-[var(--text-heading)]">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="rounded-2xl border p-5"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
                <h3 className="font-bold text-sm text-[var(--text-heading)] mb-3">Items ({order.items?.length ?? 0})</h3>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--surface-alt)' }}>
                        <Package className="w-5 h-5 text-[var(--text-faint)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-heading)] truncate">{item.product?.title ?? 'Product'}</p>
                        <p className="text-xs text-[var(--text-faint)]">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-[var(--text-heading)] flex-shrink-0">
                        Rs. {Number(item.unitPrice * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 flex justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span className="font-bold text-[var(--text-heading)]">Total</span>
                  <span className="font-black text-[var(--text-heading)]">Rs. {Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <Link href="/dashboard/orders"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--hover-bg)]"
                style={{ background: 'var(--surface-alt)', color: 'var(--text-body)', border: '1px solid var(--border-color)' }}>
                View All Orders <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Helper state */}
          {!order && !loading && !error && (
            <div className="rounded-2xl border p-8 text-center"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
              <Package className="w-12 h-12 text-[var(--text-faint)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--text-body)] font-medium mb-1">Find your order ID</p>
              <p className="text-[var(--text-muted)] text-sm">
                Your order ID is in the confirmation email or in your{' '}
                <Link href="/dashboard/orders" className="text-purple-600 hover:underline">orders dashboard</Link>.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
