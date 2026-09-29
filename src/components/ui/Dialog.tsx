'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Minimal accessible modal: Escape to close, overlay click to close,
 * initial focus on [data-autofocus] (else first button), focus restore +
 * scroll lock while open. Rendered inline (no portal needed for one dialog).
 */
export default function Dialog({ open, onClose, title, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;

    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
      panelRef.current?.querySelector<HTMLElement>('button');
    // Next tick so the panel is painted before focus moves.
    const timer = setTimeout(() => focusTarget?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Overlay click is a pointer-only convenience for dismissal; keyboard
    // users dismiss via Escape (global keydown above) or the action buttons.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/50"
      >
        {children}
      </div>
    </div>
  );
}
