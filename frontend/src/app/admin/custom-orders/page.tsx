'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from 'react';
import { customDesignApi } from '@/lib/api';
import { CustomDesignOrder } from '@/types';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Download, ExternalLink, Printer } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_FLOW = ['APPROVED', 'PRINTING', 'SHIPPED', 'DELIVERED'];

function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString('en-NP', { maximumFractionDigits: 0 })}`;
}

function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener';
  a.click();
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomDesignOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomDesignOrder | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [price, setPrice] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    customDesignApi.list().then(({ data }) => setOrders(data.data.items ?? [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openOrder = (order: CustomDesignOrder) => {
    setSelected(order);
    setAdminNotes((order as any).adminNotes ?? '');
    setPrice(order.price?.toString() ?? '');
  };

  const update = async (id: string, status: string) => {
    setUpdating(true);
    try {
      await customDesignApi.update(id, { status, adminNotes, price: price ? Number(price) : undefined });
      toast.success('Custom order updated');
      setSelected(null);
      load();
    } catch { toast.error('Failed to update order'); }
    finally { setUpdating(false); }
  };

  const previewImg = selected?.previewUrl || selected?.designUrl || '';
  const canDownload = !!(selected?.previewUrl || selected?.designUrl);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Custom Design Orders</h1>
        <span className="text-sm text-gray-400">{orders.length} orders</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Order list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4"><div className="h-14 bg-gray-100 rounded animate-pulse" /></div>
            )) : orders.length === 0 ? (
              <div className="py-16 text-center text-gray-400">No custom orders yet</div>
            ) : orders.map(order => {
              const thumb = order.previewUrl || order.designUrl;
              return (
                <button key={order.id}
                  onClick={() => openOrder(order)}
                  className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${selected?.id === order.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''}`}>
                  {thumb ? (
                    <img src={thumb} alt="Preview" className="w-14 h-14 rounded-xl object-contain bg-gray-50 border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Printer className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {order.productTitle ?? order.productType.replace(/-/g, ' ')}
                      </p>
                      <StatusBadge status={order.status} type="custom" />
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.user?.name}
                      {order.size && ` · ${order.size}`}
                      {order.color && ` / ${order.color}`}
                      {` × ${order.qty}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {order.printMethod && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">{order.printMethod}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900">Review Order</h2>
              <StatusBadge status={selected.status} type="custom" />
            </div>

            {/* Canvas preview */}
            {previewImg && (
              <div className="relative group rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <img src={previewImg} alt="Canvas Preview" className="w-full max-h-56 object-contain p-2" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {canDownload && (
                    <button
                      onClick={() => downloadDataUrl(previewImg, `order-${selected.id}-preview.png`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 rounded-xl text-xs font-semibold shadow-lg hover:bg-gray-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Preview
                    </button>
                  )}
                  {previewImg.startsWith('http') && (
                    <a href={previewImg} target="_blank" rel="noopener"
                      className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 rounded-xl text-xs font-semibold shadow-lg hover:bg-gray-50">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { l: 'Product', v: selected.productTitle ?? selected.productType },
                { l: 'Customer', v: selected.user?.name },
                { l: 'Email', v: selected.user?.email },
                { l: 'Quantity', v: selected.qty },
                { l: 'Size', v: selected.size ?? '—' },
                { l: 'Color', v: selected.color ?? '—' },
                { l: 'Print Method', v: selected.printMethod ?? '—' },
                { l: 'Print Sides', v: selected.printSides?.join(', ') ?? '—' },
              ].map(row => (
                <div key={row.l} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">{row.l}</p>
                  <p className="font-semibold text-gray-900 mt-0.5 capitalize text-sm">{row.v ?? '—'}</p>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            {selected.pricingBreakdown && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Customer Pricing Breakdown</p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-600">Base price × {selected.qty}</dt><dd className="font-semibold">{formatPrice(selected.pricingBreakdown.basePrice * selected.qty)}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Print cost</dt><dd className="font-semibold">{formatPrice(selected.pricingBreakdown.printCost)}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Setup fee</dt><dd className="font-semibold">{formatPrice(selected.pricingBreakdown.setupCost)}</dd></div>
                  {selected.pricingBreakdown.discount > 0 && (
                    <div className="flex justify-between text-green-600"><dt>Bulk discount</dt><dd>−{formatPrice(selected.pricingBreakdown.discount)}</dd></div>
                  )}
                  <div className="flex justify-between border-t border-indigo-200 pt-2 mt-1 font-black">
                    <dt className="text-gray-900">Total</dt>
                    <dd className="text-indigo-700">{formatPrice(selected.pricingBreakdown.total)}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Customer notes */}
            {selected.notes && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-semibold">Customer Notes</p>
                <p className="text-sm text-gray-700 mt-1">{selected.notes}</p>
              </div>
            )}

            {/* Admin price override */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Set / Override Price (Rs.)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 1499"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
            </div>

            {/* Admin notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Notes (visible to customer)</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
            </div>

            {/* Primary actions */}
            <div className="flex gap-2">
              <button onClick={() => update(selected.id, 'APPROVED')} disabled={updating}
                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors">
                Approve & Send Quote
              </button>
              <button onClick={() => update(selected.id, 'REJECTED')} disabled={updating}
                className="flex-1 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 disabled:opacity-60 transition-colors">
                Reject
              </button>
            </div>

            {/* Status flow */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Move to Status</p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_FLOW.map(s => (
                  <button key={s} onClick={() => update(selected.id, s)} disabled={updating || selected.status === s}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${selected.status === s ? 'bg-gray-900 text-white cursor-default' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-12 text-center flex items-center justify-center">
            <div>
              <Printer className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select an order to review its design</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
