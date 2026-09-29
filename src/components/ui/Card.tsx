import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export default function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/[0.02]', className)}>
      {children}
    </div>
  );
}
