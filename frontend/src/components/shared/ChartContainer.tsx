'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonLoader } from './SkeletonLoader';

interface PeriodOption {
  value: string;
  label: string;
}

interface PeriodSelector {
  value: string;
  onChange: (v: string) => void;
  options: PeriodOption[];
}

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  periodSelector?: PeriodSelector;
  loading?: boolean;
  className?: string;
}

export default function ChartContainer({
  title,
  subtitle,
  children,
  periodSelector,
  loading = false,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 p-6 shadow-sm',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-black text-gray-900 leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>

        {periodSelector && !loading && (
          <select
            value={periodSelector.value}
            onChange={(e) => periodSelector.onChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
          >
            {periodSelector.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <SkeletonLoader variant="chart" />
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}

export { ChartContainer };
