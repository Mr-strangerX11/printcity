'use client';

import React from 'react';
import Link from 'next/link';
import { X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertPriority = 'critical' | 'warning' | 'info';

interface AlertCardProps {
  priority: AlertPriority;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onDismiss?: () => void;
  timestamp?: string;
  className?: string;
}

const PRIORITY_STYLES: Record<
  AlertPriority,
  { container: string; icon: string; action: string; iconComponent: React.ElementType }
> = {
  critical: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    action: 'text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200',
    iconComponent: AlertTriangle,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    action: 'text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200',
    iconComponent: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    action: 'text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200',
    iconComponent: Info,
  },
};

export default function AlertCard({
  priority,
  title,
  message,
  actionLabel,
  actionHref,
  onDismiss,
  timestamp,
  className,
}: AlertCardProps) {
  const styles = PRIORITY_STYLES[priority];
  const IconComponent = styles.iconComponent;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex gap-3',
        styles.container,
        className,
      )}
      role="alert"
    >
      {/* Icon */}
      <span className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        <IconComponent className="w-5 h-5" />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{title}</p>

          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss alert"
              className="flex-shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="mt-0.5 text-sm text-gray-600 leading-snug">{message}</p>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
                styles.action,
              )}
            >
              {actionLabel}
            </Link>
          )}

          {timestamp && (
            <span className="text-xs text-gray-400">{timestamp}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export { AlertCard };
