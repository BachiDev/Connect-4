'use client';

import { Trophy } from 'lucide-react';
import type { Player } from '@/lib/connect4';
import type { Difficulty } from '@/lib/ai';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';

interface GameOverDialogProps {
  open: boolean;
  winner: Player | null;
  /** Human seat (vs computer) — decides "You win" vs "Computer wins". */
  human: Player;
  vsComputer: boolean;
  difficulty: Difficulty;
  moves: number;
  onPlayAgain: () => void;
  onReview: () => void;
}

export default function GameOverDialog({
  open,
  winner,
  human,
  vsComputer,
  difficulty,
  moves,
  onPlayAgain,
  onReview,
}: GameOverDialogProps) {
  let title = "It's a draw";
  if (winner !== null) {
    if (vsComputer) title = winner === human ? 'You win!' : 'Computer wins';
    else title = winner === '1' ? 'Red wins!' : 'Yellow wins!';
  }

  return (
    <Dialog open={open} onClose={onReview} title={title}>
      <div className="flex flex-col items-center gap-2 text-center">
        <Trophy size={32} aria-hidden="true" className="text-violet-400" />
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">{title}</h2>
        <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
          {moves} moves{winner !== null && vsComputer ? ` · ${difficulty} AI` : ''}
        </p>
        <div className="mt-4 flex w-full flex-col gap-2">
          <Button variant="primary" onClick={onPlayAgain} data-autofocus>
            Play again
          </Button>
          <Button variant="ghost" onClick={onReview}>
            Review board
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
