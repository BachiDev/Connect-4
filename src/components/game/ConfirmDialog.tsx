'use client';

import { CONFIRM_NEW_GAME } from '@/data/meta';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';

interface ConfirmDialogProps {
  /** Null = closed. Holds the pending action to run on confirm. */
  action: (() => void) | null;
  onClose: () => void;
}

/** Mid-game guard: changing mode/difficulty/seat discards the live game. */
export default function ConfirmDialog({ action, onClose }: ConfirmDialogProps) {
  return (
    <Dialog open={action !== null} onClose={onClose} title={CONFIRM_NEW_GAME.title}>
      <h2 className="text-xl font-bold tracking-tight text-zinc-100">{CONFIRM_NEW_GAME.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{CONFIRM_NEW_GAME.body}</p>
      <div className="mt-5 flex flex-col gap-2">
        <Button
          variant="primary"
          onClick={() => {
            const run = action;
            onClose();
            run?.();
          }}
        >
          {CONFIRM_NEW_GAME.confirm}
        </Button>
        <Button variant="ghost" onClick={onClose} data-autofocus>
          {CONFIRM_NEW_GAME.cancel}
        </Button>
      </div>
    </Dialog>
  );
}
