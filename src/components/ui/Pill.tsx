import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export default function Pill({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5',
        'px-3 py-1 font-mono text-xs tracking-wide text-zinc-400 uppercase',
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
