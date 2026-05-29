'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  sub?: string;
  href?: string;
  className?: string;
}

function StatCardInner({
  label,
  value,
  icon,
  trend,
  sub,
  className,
}: Omit<StatCardProps, 'href'>) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500 leading-tight">{label}</p>
        {icon && (
          <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-600">
            {icon}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">
          {value}
        </span>

        {sub && (
          <span className="text-xs text-gray-400">{sub}</span>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium w-fit',
            trend.positive ? 'text-emerald-600' : 'text-red-500',
          )}
        >
          {trend.positive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}

export default function StatCard({ href, ...props }: StatCardProps) {
  if (href) {
    return (
      <Link href={href} className="block group">
        <StatCardInner
          {...props}
          className={cn(
            props.className,
            'transition-shadow duration-200 group-hover:shadow-md cursor-pointer',
          )}
        />
      </Link>
    );
  }

  return <StatCardInner {...props} />;
}

export { StatCard };
