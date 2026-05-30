'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  /** Primary label (new) or legacy `label` prop */
  title?: string;
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
  /** Number percentage (new). Legacy: `{value:string, positive:boolean}` */
  trend?: number | { value: string; positive: boolean };
  trendLabel?: string;
  /** Short sub-text (legacy) */
  sub?: string;
  description?: string;
  color?: 'purple' | 'blue' | 'green' | 'amber' | 'red' | 'cyan';
  loading?: boolean;
  onClick?: () => void;
  href?: string;
}

const colorMap = {
  purple: { bg: 'rgba(124,58,237,0.10)', icon: '#7C3AED', ring: 'rgba(124,58,237,0.20)', bar: '#7C3AED' },
  blue:   { bg: 'rgba(37,99,235,0.10)',  icon: '#2563EB', ring: 'rgba(37,99,235,0.20)',  bar: '#2563EB' },
  green:  { bg: 'rgba(5,150,105,0.10)',  icon: '#059669', ring: 'rgba(5,150,105,0.20)',  bar: '#059669' },
  amber:  { bg: 'rgba(217,119,6,0.10)',  icon: '#D97706', ring: 'rgba(217,119,6,0.20)',  bar: '#D97706' },
  red:    { bg: 'rgba(220,38,38,0.10)',  icon: '#DC2626', ring: 'rgba(220,38,38,0.20)',  bar: '#DC2626' },
  cyan:   { bg: 'rgba(6,182,212,0.10)',  icon: '#0891B2', ring: 'rgba(6,182,212,0.20)',  bar: '#0891B2' },
};

export function StatCard({
  title, label, value, icon,
  trend, trendLabel, sub, description,
  color = 'purple', loading = false, onClick, href,
}: StatCardProps) {
  const c = colorMap[color];
  const displayTitle = title ?? label ?? '';
  const displayDesc = description ?? sub;

  // Normalise trend to a number or null
  let trendNum: number | undefined;
  let trendPos: boolean | undefined;
  if (typeof trend === 'number') {
    trendNum = Math.abs(trend);
    trendPos = trend >= 0;
  } else if (trend && typeof trend === 'object') {
    const pct = parseFloat(trend.value.replace(/[^0-9.-]/g, ''));
    trendNum = isNaN(pct) ? 0 : Math.abs(pct);
    trendPos = trend.positive;
  }

  const TrendIcon = trendNum === undefined ? null : trendPos ? TrendingUp : TrendingDown;
  const trendColor = trendPos ? 'text-emerald-500' : 'text-red-500';
  const trendBg   = trendPos ? 'bg-emerald-500/10' : 'bg-red-500/10';

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="skeleton w-14 h-5 rounded-full" />
        </div>
        <div className="skeleton h-8 w-2/5" />
        <div className="skeleton h-3 w-3/5" />
      </div>
    );
  }

  const inner = (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5',
      'transition-all duration-200',
      (onClick || href) && 'cursor-pointer hover:-translate-y-0.5 hover:border-purple-400/30 hover:shadow-lg',
    )}>
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${c.bar}, transparent)` }} />

      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: c.bg, color: c.icon, boxShadow: `0 0 0 1px ${c.ring}` }}>
            <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
          </div>
        )}
        {TrendIcon && trendNum !== undefined && (
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold', trendBg, trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {trendNum}%
          </div>
        )}
      </div>

      <p className="text-2xl font-black text-[var(--text-heading)] leading-none mb-1 tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{displayTitle}</p>
      {(displayDesc || trendLabel) && (
        <p className="text-xs text-[var(--text-faint)] mt-1.5 leading-relaxed">
          {displayDesc ?? trendLabel}
        </p>
      )}
    </div>
  );

  if (href) return <Link href={href} onClick={onClick}>{inner}</Link>;
  if (onClick) return <div onClick={onClick}>{inner}</div>;
  return inner;
}

export default StatCard;
