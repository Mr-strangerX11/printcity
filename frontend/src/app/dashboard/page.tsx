'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, Upload, ShoppingCart, Heart, Star, Gift, Users, Copy,
  CheckCircle, Check, AlertTriangle, Zap, TrendingUp, Share2,
  MessageSquare, MapPin, CreditCard, Phone, Camera, Shield,
} from 'lucide-react';
import { useOrders } from '@/hooks';
import { useWishlistItems } from '@/hooks';
import { useNotifications, useUnreadCount } from '@/hooks';
import { useLoyaltyPoints, useLoyaltyTier, useLoyaltyRewards } from '@/hooks';
import { useReferralCode, useReferralStats } from '@/hooks';
import { useProducts } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { notificationsApi, loyaltyApi } from '@/lib/api';
import { formatPrice, formatDate, formatRelative } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/shared';
import { NotificationBell } from '@/components/shared';
import { toast } from 'sonner';

// ── Tier config ────────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  BRONZE: 'text-amber-700 bg-amber-50 border-amber-200',
  SILVER: 'text-slate-600 bg-slate-50 border-slate-200',
  GOLD: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  PLATINUM: 'text-purple-700 bg-purple-50 border-purple-200',
};
const TIER_NEXT_POINTS: Record<string, number> = {
  BRONZE: 1000, SILVER: 5000, GOLD: 10000, PLATINUM: 10000,
};

// ── Account health config ──────────────────────────────────────────────────────
function useAccountHealth(user: { name?: string; phone?: string; avatar?: string } | null) {
  const steps = [
    { key: 'name', label: 'Profile name set', weight: 20, done: !!user?.name, href: '/dashboard/profile', icon: <Camera className="w-3.5 h-3.5" /> },
    { key: 'phone', label: 'Phone verified', weight: 15, done: !!user?.phone, href: '/dashboard/profile', icon: <Phone className="w-3.5 h-3.5" /> },
    { key: 'avatar', label: 'Profile photo', weight: 20, done: !!user?.avatar, href: '/dashboard/profile', icon: <Camera className="w-3.5 h-3.5" /> },
    { key: 'address', label: 'Address saved', weight: 20, done: false, href: '/dashboard/address', icon: <MapPin className="w-3.5 h-3.5" /> },
    { key: 'payment', label: 'Email verified', weight: 25, done: true, href: '/dashboard/profile', icon: <CreditCard className="w-3.5 h-3.5" /> },
  ];
  const score = steps.filter(s => s.done).reduce((sum, s) => sum + s.weight, 0);
  return { steps, score };
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [copied, setCopied] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  // Data hooks
  const { data: ordersData } = useOrders({ limit: 5 });
  const { data: wishlistItems } = useWishlistItems();
  const { data: notificationsData, refetch: refetchNotifs } = useNotifications({ limit: 15 });
  const notifications = notificationsData?.items ?? [];
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: loyaltyPoints } = useLoyaltyPoints();
  const { data: loyaltyTier } = useLoyaltyTier();
  const { data: rewards = [] } = useLoyaltyRewards();
  const { data: referralCode } = useReferralCode();
  const { data: referralStats } = useReferralStats();
  const { data: recommendedData } = useProducts({ limit: 6, sort: 'popular', status: 'ACTIVE' });

  const recentOrders = ordersData?.items ?? [];
  const wishlist = (wishlistItems ?? []).slice(0, 3);
  const recommendations = (recommendedData?.items ?? []).slice(0, 6);
  const { steps: healthSteps, score: healthScore } = useAccountHealth(user);

  const stats = {
    total: ordersData?.meta.total ?? 0,
    pending: recentOrders.filter(o =>
      ['PENDING', 'CONFIRMED', 'PRINTING', 'PACKED', 'SHIPPED'].includes(o.orderStatus)
    ).length,
    delivered: recentOrders.filter(o => o.orderStatus === 'DELIVERED').length,
  };

  const tierName = loyaltyTier?.currentTier ?? loyaltyPoints?.tierName ?? 'BRONZE';
  const tierPoints = loyaltyPoints?.availablePoints ?? 0;
  const tierNextPoints = TIER_NEXT_POINTS[tierName] ?? 1000;
  const tierProgress = Math.min((tierPoints / tierNextPoints) * 100, 100);

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    refetchNotifs();
  };
  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    refetchNotifs();
  };

  const handleCopyReferral = async () => {
    const code = referralCode?.code ?? '';
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral code copied!');
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeemingId(rewardId);
    try {
      const { data } = await loyaltyApi.redeemReward(rewardId);
      toast.success(`Reward redeemed! Code: ${data.data?.rewardCode ?? ''}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Redemption failed');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's what's happening with your account</p>
        </div>
        <NotificationBell
          notifications={notifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            isRead: !!n.readAt,
            createdAt: n.createdAt,
            actionUrl: n.actionUrl,
          }))}
          unreadCount={typeof unreadCount === 'number' ? unreadCount : 0}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
        />
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats.total}
          icon={<Package className="w-5 h-5 text-blue-500" />} href="/dashboard/orders" />
        <StatCard label="Active Orders" value={stats.pending}
          icon={<ShoppingCart className="w-5 h-5 text-yellow-500" />} href="/dashboard/orders" />
        <StatCard label="Points Balance" value={tierPoints.toLocaleString()}
          icon={<Gift className="w-5 h-5 text-purple-500" />}
          sub={tierName}
          trend={tierPoints > 0 ? { value: `${tierName} tier`, positive: true } : undefined} />
        <StatCard label="Cart Items" value={cart?.items.length ?? 0}
          icon={<ShoppingCart className="w-5 h-5 text-green-500" />} href="/cart" />
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div>
        <h2 className="font-black text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/products', icon: <Package className="w-5 h-5 text-white" />, label: 'Browse Products', sub: 'Shop designs', bg: 'bg-blue-600', light: 'bg-blue-50 border-blue-100 hover:bg-blue-100' },
            { href: '/design-studio', icon: <Upload className="w-5 h-5 text-white" />, label: 'Upload Design', sub: 'Custom print', bg: 'bg-purple-600', light: 'bg-purple-50 border-purple-100 hover:bg-purple-100' },
            { href: '/dashboard/orders', icon: <Package className="w-5 h-5 text-white" />, label: 'Track Orders', sub: 'View status', bg: 'bg-green-600', light: 'bg-green-50 border-green-100 hover:bg-green-100' },
            { href: '/dashboard/support', icon: <MessageSquare className="w-5 h-5 text-white" />, label: 'Get Support', sub: 'Open ticket', bg: 'bg-orange-600', light: 'bg-orange-50 border-orange-100 hover:bg-orange-100' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${a.light}`}>
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>{a.icon}</div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{a.label}</p>
                <p className="text-xs text-gray-500 truncate">{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Loyalty & Rewards ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              <h2 className="font-black text-gray-900">Loyalty & Rewards</h2>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_COLORS[tierName] ?? TIER_COLORS.BRONZE}`}>
              {tierName}
            </span>
          </div>

          {/* Points */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-gray-900">{tierPoints.toLocaleString()}</p>
              <p className="text-sm text-gray-500">available points</p>
            </div>
            {loyaltyTier?.nextTier && (
              <p className="text-xs text-gray-400 text-right">
                {loyaltyTier.pointsToNextTier.toLocaleString()} pts to {loyaltyTier.nextTier}
              </p>
            )}
          </div>

          {/* Tier progress */}
          <div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700"
                style={{ width: `${tierProgress}%` }} />
            </div>
          </div>

          {/* Rewards */}
          {rewards.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Redeem Rewards</p>
              <div className="space-y-2">
                {rewards.slice(0, 3).map((r: any) => (
                  <div key={r.id ?? r._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.pointsRequired.toLocaleString()} points required</p>
                    </div>
                    <button
                      onClick={() => handleRedeem(r.id ?? r._id)}
                      disabled={tierPoints < r.pointsRequired || redeemingId === (r.id ?? r._id)}
                      className="px-3 py-1.5 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {redeemingId === (r.id ?? r._id) ? '...' : 'Redeem'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Points breakdown */}
          {loyaltyPoints?.breakdown && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {Object.entries(loyaltyPoints.breakdown).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-500 capitalize">{key}</span>
                  <span className="font-semibold text-gray-700">{(val as number).toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Referral Widget ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="font-black text-gray-900">Referral Program</h2>
          </div>

          {referralCode ? (
            <>
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <p className="text-xs text-blue-500 font-semibold mb-1">Your Referral Code</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-2xl font-black text-blue-700 tracking-widest">{referralCode.code}</p>
                  <button onClick={handleCopyReferral}
                    className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                    {copied
                      ? <Check className="w-4 h-4 text-white" />
                      : <Copy className="w-4 h-4 text-white" />}
                  </button>
                </div>
                <p className="text-xs text-blue-400 mt-1">{referralCode.discountPercent}% off for friends</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Referred', value: referralStats?.totalReferred ?? 0, color: 'text-blue-600' },
                  { label: 'Successful', value: referralStats?.successfulReferrals ?? 0, color: 'text-green-600' },
                  { label: 'Pts Earned', value: referralStats?.totalRewardPoints ?? 0, color: 'text-purple-600' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Share buttons */}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const text = `Use my referral code ${referralCode.code} and get ${referralCode.discountPercent}% off at Print City!`;
                    if (navigator.share) await navigator.share({ text }).catch(() => {});
                    else { await navigator.clipboard.writeText(text); toast.success('Copied to clipboard!'); }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <Link href="/products"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                  Invite Friends
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Referral program loading…</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Wishlist Preview ─────────────────────────────────────────────────── */}
      {wishlist.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="font-black text-gray-900">Wishlist</h2>
            </div>
            <Link href="/dashboard/wishlist" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
              View all ({wishlistItems?.length ?? 0}) →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {wishlist.map((item: any) => {
              const img = item.product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400';
              const minPrice = item.product.variants?.length
                ? Math.min(...item.product.variants.map((v: any) => Number(v.price)))
                : Number(item.product.basePrice);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 flex gap-4 p-4 hover:shadow-md transition-shadow">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    <Image src={img} alt={item.product.title} fill unoptimized className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`}>
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors">{item.product.title}</p>
                    </Link>
                    <p className="font-black text-gray-900 text-sm mt-1">{formatPrice(minPrice)}</p>
                    <Link href={`/products/${item.product.slug}`}
                      className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                      <ShoppingCart className="w-3 h-3" /> Add to Cart
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recommendations ─────────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="font-black text-gray-900">Recommended For You</h2>
            </div>
            <Link href="/products?sort=popular" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
              See more →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map(p => {
              const img = p.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400';
              return (
                <Link key={p.id} href={`/products/${p.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative aspect-square bg-gray-50">
                    <Image src={img} alt={p.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">{p.title}</p>
                    <p className="text-xs font-black text-gray-900 mt-1">{formatPrice(p.basePrice)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Orders ───────────────────────────────────────────────────── */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View all →
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3">
                  <Link href={`/dashboard/orders/${order.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items.length} items</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <StatusBadge status={order.orderStatus} type="order" />
                    <p className="font-bold text-gray-900 text-sm">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Account Health ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h2 className="font-black text-gray-900">Account Health</h2>
          </div>
          <span className="text-sm font-black text-gray-900">{healthScore}%</span>
        </div>

        <div className="mb-5">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                healthScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600'
                : healthScore >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {healthScore >= 80 ? 'Great profile! You unlocked express checkout.' : `Complete ${100 - healthScore}% more to unlock benefits.`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {healthSteps.map(step => (
            <Link key={step.key} href={step.href}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                step.done ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {step.done
                  ? <Check className="w-3.5 h-3.5 text-white" />
                  : <span className="text-gray-400">{step.icon}</span>
                }
              </div>
              <span className={`text-xs font-medium ${step.done ? 'text-green-700' : 'text-gray-600'}`}>
                {step.label}
              </span>
              <span className="ml-auto text-xs text-gray-400">{step.weight}%</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
