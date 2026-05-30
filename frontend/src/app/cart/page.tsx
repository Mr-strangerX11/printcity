'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, Truck, Clock, Shield, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { formatPrice, getErrorMsg } from '@/lib/utils';
import { toast } from 'sonner';

const DELIVERY_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
})();

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [showGiftMessage, setShowGiftMessage] = useState(false);

  const handleUpdate = async (itemId: string, qty: number) => {
    try { await updateItem(itemId, qty); }
    catch (err: any) { toast.error(getErrorMsg(err, 'Failed to update')); }
  };

  const handleRemove = async (itemId: string) => {
    try { await removeItem(itemId); toast.success('Item removed'); }
    catch { toast.error('Failed to remove'); }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    toast.info('Coupon codes are not available yet. Check back soon!');
    setCouponCode('');
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 rounded-2xl skeleton" />
        ))}
      </div>
    </>
  );

  if (!cart || cart.items.length === 0) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'var(--surface-alt)' }}>
          <ShoppingBag className="w-12 h-12 text-[var(--text-faint)]" />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-heading)] mb-2">Your cart is empty</h2>
        <p className="text-[var(--text-muted)] mb-8 max-w-xs">Looks like you haven't added anything yet. Explore our collection!</p>
        <Link href="/products"
          className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-sm"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <Footer />
    </>
  );

  const subtotal = cart.subtotal;
  const shippingThreshold = 2000;
  const shippingFee = subtotal >= shippingThreshold ? 0 : 150;
  const total = subtotal + shippingFee;
  const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-heading)]">Your Cart</h1>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Link href="/products" className="text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors">
            + Add more items
          </Link>
        </div>

        {/* Free shipping progress */}
        {subtotal < shippingThreshold && (
          <div className="mb-6 p-4 rounded-2xl border"
            style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.15)' }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Add {formatPrice(shippingThreshold - subtotal)} for FREE shipping
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(37,99,235,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%`, background: 'linear-gradient(90deg,#7C3AED,#2563EB)' }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id}
                className="rounded-2xl border p-4 sm:p-5 flex gap-3 sm:gap-4 hover:shadow-sm transition-all"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
                <Link href={`/products/${item.variant.product.slug}`}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--surface-alt)' }}>
                  <Image
                    src={item.variant.product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'}
                    alt={item.variant.product.title}
                    fill unoptimized className="object-cover"
                    sizes="80px"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.variant.product.slug}`}
                    className="font-bold text-[var(--text-heading)] hover:text-purple-600 transition-colors line-clamp-1 text-sm">
                    {item.variant.product.title}
                  </Link>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {item.variant.size} / {item.variant.color}
                  </p>
                  <p className="text-xs text-[var(--text-faint)] mt-0.5">
                    {item.variant.product.vendor?.storeName}
                  </p>
                  <p className="font-black text-[var(--text-heading)] mt-1.5 text-sm">{formatPrice(item.variant.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                  <button onClick={() => handleRemove(item.id)}
                    className="text-[var(--text-faint)] hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center rounded-xl overflow-hidden border"
                    style={{ borderColor: 'var(--border-color)' }}>
                    <button onClick={() => handleUpdate(item.id, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[var(--hover-bg)] transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-black text-[var(--text-heading)]">{item.qty}</span>
                    <button onClick={() => handleUpdate(item.id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[var(--hover-bg)] transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-black text-[var(--text-heading)]">
                    {formatPrice(Number(item.variant.price) * item.qty)}
                  </p>
                </div>
              </div>
            ))}

            {/* Gift message */}
            <div className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => setShowGiftMessage(!showGiftMessage)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--hover-bg)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🎁</span>
                  <span className="font-semibold text-sm text-[var(--text-body)]">Add a gift message</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--text-faint)] transition-transform duration-200 ${showGiftMessage ? 'rotate-180' : ''}`} />
              </button>
              {showGiftMessage && (
                <div className="px-5 pb-4">
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Write a personal message for the recipient..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all"
                    style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div>
            <div className="rounded-2xl border p-5 lg:sticky lg:top-20 space-y-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
              <h3 className="font-black text-[var(--text-heading)] text-lg">Order Summary</h3>

              {/* Coupon code */}
              <div>
                <p className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-wider mb-2">Promo Code</p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-faint)]" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="SAVE10"
                      disabled={couponApplied}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-500/25 disabled:opacity-50 transition-all"
                      style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' }}
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || couponApplied}
                    className="px-3.5 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-color)' }} />

              {/* Line items */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-[var(--text-body)]">
                  <span>Subtotal ({cart.items.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span className="font-semibold text-[var(--text-heading)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--text-body)]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Shipping
                  </span>
                  {shippingFee === 0
                    ? <span className="text-green-600 font-bold">Free</span>
                    : <span className="font-semibold text-[var(--text-heading)]">{formatPrice(shippingFee)}</span>
                  }
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Promo discount</span>
                    <span className="font-bold">−{formatPrice(0)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-between font-black text-[var(--text-heading)]"
                style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="text-lg">Total</span>
                <span className="text-xl">{formatPrice(total)}</span>
              </div>

              {/* Estimated delivery */}
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400">Estimated delivery</p>
                  <p className="text-xs text-green-600 dark:text-green-500">{DELIVERY_DATE}</p>
                </div>
              </div>

              <button onClick={() => router.push('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-4 text-white font-black rounded-2xl hover:opacity-90 transition-opacity shadow-md text-base"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <Link href="/products" className="block text-center text-sm text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors">
                ← Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
                  <Shield className="w-3.5 h-3.5 text-green-500" /> Secure checkout
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
                  <Truck className="w-3.5 h-3.5 text-blue-500" /> Fast delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
