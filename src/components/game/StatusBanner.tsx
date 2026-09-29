import { Handshake, Loader2, Trophy } from 'lucide-react';
import type { Player } from '@/lib/connect4';

interface StatusBannerProps {
  winner: Player | null;
  draw: boolean;
  vsComputer: boolean;
  currentPlayer: Player;
  /** Human seat. */
  human: Player;
  colors: Record<Player, string>;
  isThinking: boolean;
  moves: number;
}

function Swatch({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-6 w-6 rounded-full border border-white/20 ${className}`}
    />
  );
}

export default function StatusBanner({
  winner,
  draw,
  vsComputer,
  currentPlayer,
  human,
  colors,
  isThinking,
  moves,
}: StatusBannerProps) {
  let icon = <Swatch className={colors[currentPlayer]} />;
  let text: string;

  if (winner !== null) {
    icon = <Trophy size={20} aria-hidden="true" className="shrink-0 text-violet-400" />;
    if (vsComputer) {
      text = winner === human ? 'You win!' : 'Computer wins';
    } else {
      text = winner === '1' ? 'Red wins!' : 'Yellow wins!';
    }
    text += ` · ${moves} moves`;
  } else if (draw) {
    icon = <Handshake size={20} aria-hidden="true" className="shrink-0 text-zinc-400" />;
    text = "It's a draw — board full";
  } else if (vsComputer && currentPlayer !== human) {
    icon = isThinking ? (
      <Loader2 size={20} aria-hidden="true" className="shrink-0 animate-spin text-violet-400" />
    ) : (
      <Swatch className={colors[currentPlayer]} />
    );
    text = isThinking ? 'Computer is thinking…' : "Computer's turn";
  } else if (vsComputer) {
    text = 'Your turn';
  } else {
    text = currentPlayer === '1' ? 'Red to move' : 'Yellow to move';
  }

  return (
    <div
      aria-live="polite"
      className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
    >
      {icon}
      <p className="text-base font-medium text-zinc-100">{text}</p>
    </div>
  );
}
