'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type SkeletonVariant = 'card' | 'row' | 'chart' | 'text' | 'avatar';

interface SkeletonLoaderProps {
  variant: SkeletonVariant;
  count?: number;
  className?: string;
}

const pulse = 'bg-gray-100 animate-pulse rounded-xl';

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={cn(pulse, 'h-4 w-24')} />
        <div className={cn(pulse, 'h-10 w-10 rounded-xl')} />
      </div>
      <div className={cn(pulse, 'h-8 w-32')} />
      <div className={cn(pulse, 'h-3 w-20 rounded-full')} />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <div className={cn(pulse, 'h-4 w-4 rounded-sm flex-shrink-0')} />
      <div className={cn(pulse, 'h-9 w-9 rounded-full flex-shrink-0')} />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className={cn(pulse, 'h-4 w-2/5')} />
        <div className={cn(pulse, 'h-3 w-1/4')} />
      </div>
      <div className={cn(pulse, 'h-4 w-20 hidden sm:block')} />
      <div className={cn(pulse, 'h-6 w-16 rounded-full')} />
      <div className={cn(pulse, 'h-4 w-10')} />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className={cn(pulse, 'h-5 w-40')} />
          <div className={cn(pulse, 'h-3 w-28')} />
        </div>
        <div className={cn(pulse, 'h-8 w-28 rounded-lg')} />
      </div>
      {/* Bars */}
      <div className="flex items-end gap-2 h-40 pt-4">
        {[60, 85, 45, 70, 90, 55, 75, 40, 80, 65, 50, 95].map((h, i) => (
          <div
            key={i}
            className={cn(pulse, 'flex-1 rounded-t-md')}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      {/* X-axis labels */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={cn(pulse, 'flex-1 h-3')} />
        ))}
      </div>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn(pulse, 'h-4 w-full')} />
      <div className={cn(pulse, 'h-4 w-11/12')} />
      <div className={cn(pulse, 'h-4 w-3/4')} />
    </div>
  );
}

function AvatarSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(pulse, 'h-10 w-10 rounded-full flex-shrink-0')} />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className={cn(pulse, 'h-4 w-28')} />
        <div className={cn(pulse, 'h-3 w-20')} />
      </div>
    </div>
  );
}

const VARIANT_MAP: Record<SkeletonVariant, () => React.ReactElement> = {
  card: CardSkeleton,
  row: RowSkeleton,
  chart: ChartSkeleton,
  text: TextSkeleton,
  avatar: AvatarSkeleton,
};

export function SkeletonLoader({ variant, count = 1, className }: SkeletonLoaderProps) {
  const Component = VARIANT_MAP[variant];
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={cn('grid gap-4', className)}>
        {items.map((_, i) => (
          <Component key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

export default SkeletonLoader;
