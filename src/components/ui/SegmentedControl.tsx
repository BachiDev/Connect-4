'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  /** Visible group label (mono, uppercase). Also used as the radiogroup name. */
  label: string;
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-zinc-950 p-1 sm:rounded-full"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={typeof option.ariaLabel === 'string' ? option.ariaLabel : undefined}
              onClick={() => {
                if (!active) onChange(option.value);
              }}
              className={cn(
                'inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:rounded-full',
                active
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
