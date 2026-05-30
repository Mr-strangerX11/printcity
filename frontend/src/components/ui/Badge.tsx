import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border-color)]',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-border)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
  danger:  'bg-[var(--color-danger-light)]  text-[var(--color-danger)]  border-[var(--color-danger-border)]',
  info:    'bg-[var(--color-info-light)]    text-[var(--color-info)]    border-[var(--color-info-border)]',
  purple:  'bg-[var(--color-brand-light)]   text-[var(--color-brand)]   border-[var(--color-brand-border)]',
  gray:    'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs     px-2   py-1   gap-1.5',
  lg: 'text-sm     px-2.5 py-1   gap-2',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  purple:  'bg-purple-500',
  gray:    'bg-gray-400',
};

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'md', dot = false, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full border',
      variantStyles[variant],
      sizeStyles[size],
      className,
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLORS[variant])} />}
      {children}
    </span>
  );
}

/** Maps common status strings to Badge variants */
export function StatusBadge({ status, size = 'md' }: { status: string; size?: BadgeSize }) {
  const map: Record<string, BadgeVariant> = {
    PENDING:          'warning',
    CONFIRMED:        'info',
    PRINTING:         'info',
    PACKED:           'purple',
    SHIPPED:          'purple',
    DELIVERED:        'success',
    CANCELLED:        'danger',
    REFUNDED:         'gray',
    PAID:             'success',
    UNPAID:           'warning',
    FAILED:           'danger',
    ACTIVE:           'success',
    INACTIVE:         'gray',
    APPROVED:         'success',
    REJECTED:         'danger',
    PENDING_APPROVAL: 'warning',
    DRAFT:            'gray',
    OPEN:             'info',
    IN_PROGRESS:      'warning',
    RESOLVED:         'success',
    CLOSED:           'gray',
    ISSUED:           'info',
    OVERDUE:          'danger',
  };
  const variant = map[status] ?? 'default';
  return (
    <Badge variant={variant} size={size} dot>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
