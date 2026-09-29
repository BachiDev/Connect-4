'use client';

import { Bot, Users } from 'lucide-react';
import type { Player } from '@/lib/connect4';
import type { Difficulty } from '@/lib/ai';
import { DIFFICULTY_HINTS } from '@/data/meta';
import Card from '@/components/ui/Card';
import SegmentedControl from '@/components/ui/SegmentedControl';

export type GameMode = 'pvp' | 'computer';

interface ToolbarProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  /** Human seat: '1' = First/red, '2' = Second/yellow. */
  seat: Player;
  onSeatChange: (seat: Player) => void;
}

function Disc({ color }: { color: 'red' | 'yellow' }) {
  return (
    <span
      aria-hidden="true"
      className={
        color === 'red'
          ? 'inline-block h-4 w-4 rounded-full bg-red-500 ring-1 ring-red-300/60'
          : 'inline-block h-4 w-4 rounded-full bg-amber-400 ring-1 ring-amber-200/60'
      }
    />
  );
}

export default function Toolbar({
  mode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  seat,
  onSeatChange,
}: ToolbarProps) {
  const vsComputer = mode === 'computer';
  return (
    <Card className="space-y-4 p-4">
      <div className="space-y-2">
        <p className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Mode</p>
        <SegmentedControl<GameMode>
          label="Game mode"
          value={mode}
          onChange={onModeChange}
          options={[
            {
              value: 'pvp',
              label: (
                <>
                  <Users size={16} aria-hidden="true" /> Two players
                </>
              ),
            },
            {
              value: 'computer',
              label: (
                <>
                  <Bot size={16} aria-hidden="true" /> Vs computer
                </>
              ),
            },
          ]}
        />
      </div>

      {vsComputer && (
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Difficulty</p>
          <SegmentedControl<Difficulty>
            label="Difficulty"
            value={difficulty}
            onChange={onDifficultyChange}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'strong', label: 'Strong' },
            ]}
          />
          <p className="text-sm text-zinc-400">{DIFFICULTY_HINTS[difficulty]}</p>
        </div>
      )}

      {vsComputer && (
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-widest text-zinc-400 uppercase">You play</p>
          <SegmentedControl<Player>
            label="Your seat"
            value={seat}
            onChange={onSeatChange}
            options={[
              {
                value: '1',
                label: (
                  <>
                    First <Disc color="red" />
                  </>
                ),
                ariaLabel: 'Play first as red',
              },
              {
                value: '2',
                label: (
                  <>
                    Second <Disc color="yellow" />
                  </>
                ),
                ariaLabel: 'Play second as yellow',
              },
            ]}
          />
        </div>
      )}
    </Card>
  );
}
