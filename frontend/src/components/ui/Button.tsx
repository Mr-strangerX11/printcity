import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white hover:opacity-90 shadow-sm hover:shadow-md active:scale-[0.98]',
  secondary: 'bg-[var(--surface-alt)] text-[var(--text-heading)] border border-[var(--border-color)] hover:bg-[var(--hover-bg)] active:scale-[0.98]',
  ghost:     'text-[var(--text-body)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)] active:scale-[0.98]',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]',
  outline:   'border border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] active:scale-[0.98]',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7  px-2.5 text-xs  gap-1   rounded-lg',
  sm: 'h-8  px-3.5 text-xs  gap-1.5 rounded-lg',
  md: 'h-10 px-4   text-sm  gap-2   rounded-xl',
  lg: 'h-11 px-5   text-sm  gap-2   rounded-xl',
  xl: 'h-12 px-7   text-base gap-2.5 rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
