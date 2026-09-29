import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500',
  secondary:
    'border border-white/10 bg-white/5 text-zinc-100 hover:border-white/20 hover:bg-white/10',
  ghost: 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
};

const SIZES: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-sm font-semibold',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
