import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({ icon, title, description, action, className, size = 'md' }: EmptyStateProps) {
  const sizes = {
    sm: { wrap: 'py-8', icon: 'w-10 h-10 mb-3', title: 'text-sm', desc: 'text-xs' },
    md: { wrap: 'py-12', icon: 'w-12 h-12 mb-4', title: 'text-base', desc: 'text-sm' },
    lg: { wrap: 'py-20', icon: 'w-16 h-16 mb-5', title: 'text-xl', desc: 'text-base' },
  };
  const s = sizes[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', s.wrap, className)}>
      {icon && (
        <div className={cn('rounded-2xl flex items-center justify-center bg-[var(--surface-alt)] text-[var(--text-faint)]', s.icon)}>
          {icon}
        </div>
      )}
      <h3 className={cn('font-bold text-[var(--text-heading)] mb-1', s.title)}>{title}</h3>
      {description && (
        <p className={cn('text-[var(--text-muted)] max-w-xs', s.desc)}>{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button variant={action.variant ?? 'primary'} size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
