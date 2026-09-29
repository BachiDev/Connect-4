import { Trash2 } from 'lucide-react';
import type { Player } from '@/lib/connect4';
import type { Difficulty } from '@/lib/ai';
import type { Stats } from '@/lib/stats';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface StatsStripProps {
  stats: Stats;
  vsComputer: boolean;
  difficulty: Difficulty;
  human: Player;
  onReset: () => void;
}

export default function StatsStrip({
  stats,
  vsComputer,
  difficulty,
  human,
  onReset,
}: StatsStripProps) {
  const humanFirst = human === '1';
  const line = vsComputer
    ? (() => {
        const bucket = stats.computer[difficulty];
        return `You ${bucket.human} · Computer ${bucket.computer} · Draws ${bucket.draws}`;
      })()
    : `Red ${stats.pvp.red} · Yellow ${stats.pvp.yellow} · Draws ${stats.pvp.draws}`;

  return (
    <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">Session</p>
      <p className="font-mono text-sm text-zinc-100" aria-live="polite">
        {line}
      </p>
      {vsComputer && (
        <p className="text-xs text-zinc-500">
          {difficulty} AI · you play {humanFirst ? 'first' : 'second'}
        </p>
      )}
      {stats.bestWinMoves !== null && (
        <p className="text-xs text-zinc-500">Best win: {stats.bestWinMoves} moves</p>
      )}
      <Button
        variant="ghost"
        size="sm"
        icon={<Trash2 size={14} aria-hidden="true" />}
        onClick={onReset}
        title="Clear stats stored in this browser"
        className="ml-auto"
      >
        Reset
      </Button>
    </Card>
  );
}
