import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-5 md:p-6',
  lg:   'p-6 md:p-8',
};

export function Card({ children, className, padding = 'md', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border transition-all duration-200',
        'bg-[var(--surface)] border-[var(--border-color)]',
        hover && 'hover:border-purple-400/30 hover:shadow-lg cursor-pointer hover:-translate-y-0.5',
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-base font-bold text-[var(--text-heading)]', className)}>
      {children}
    </h3>
  );
}

export function CardSection({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div className={cn('pt-4 mt-4 border-t border-[var(--border-color)]', className)}>
      {label && <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-faint)] mb-3">{label}</p>}
      {children}
    </div>
  );
}
