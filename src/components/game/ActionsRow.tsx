'use client';

import { Eye, Redo2, RotateCcw, Undo2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ActionsRowProps {
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Terminal position reviewed (dialog dismissed) — offer to reopen it. */
  showResult: boolean;
  onShowResult: () => void;
}

export default function ActionsRow({
  onNewGame,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showResult,
  onShowResult,
}: ActionsRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="ghost"
        icon={<Undo2 size={16} aria-hidden="true" />}
        onClick={onUndo}
        disabled={!canUndo}
        title={canUndo ? 'Take back your last move' : 'Nothing to undo'}
      >
        Undo
      </Button>
      <Button
        variant="primary"
        icon={<RotateCcw size={16} aria-hidden="true" />}
        onClick={onNewGame}
      >
        New game
      </Button>
      <Button
        variant="ghost"
        icon={<Redo2 size={16} aria-hidden="true" />}
        onClick={onRedo}
        disabled={!canRedo}
        title={canRedo ? 'Replay the move you took back' : 'Nothing to redo'}
      >
        Redo
      </Button>
      {showResult && (
        <Button variant="ghost" icon={<Eye size={16} aria-hidden="true" />} onClick={onShowResult}>
          Show result
        </Button>
      )}
    </div>
  );
}
