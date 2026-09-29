'use client';

import { useMemo, useRef, useState } from 'react';
import type { Board, Player } from '@/lib/connect4';
import { ROWS, COLS } from '@/lib/connect4';
import { cn } from '@/lib/cn';

interface BoardProps {
  board: Board;
  colors: Record<Player, string>;
  winLine: ReadonlyArray<readonly [number, number]>;
  /** True when the game is over or the AI is computing — columns go inert. */
  disabled: boolean;
  currentPlayer: Player;
  onDrop: (col: number) => void;
}

const RINGS: Record<Player, string> = {
  '1': 'ring-red-300/60',
  '2': 'ring-amber-200/60',
};

/** Lowest empty row in a column, or -1 when full. */
function landingRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) return row;
  }
  return -1;
}

export default function Board({
  board,
  colors,
  winLine,
  disabled,
  currentPlayer,
  onDrop,
}: BoardProps) {
  const [activeCol, setActiveCol] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const winSet = useMemo(() => new Set(winLine.map(([r, c]) => `${r}-${c}`)), [winLine]);

  const focusColumn = (col: number) => {
    if (col < 0 || col >= COLS) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-col="${col}"]`)?.focus();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-2 sm:p-3">
      <div
        ref={gridRef}
        role="group"
        aria-label="Connect-4 board. Tab to a column and press Enter to drop your disc."
        className="mx-auto grid w-full max-w-[560px] grid-cols-7 gap-1.5 sm:gap-2"
      >
        {Array.from({ length: COLS }, (_, col) => {
          const landing = landingRow(board, col);
          const full = landing === -1;
          const columnDisabled = disabled || full;
          const showPreview = activeCol === col && !columnDisabled;
          return (
            <button
              key={col}
              type="button"
              data-col={col}
              disabled={columnDisabled}
              aria-label={`Drop disc in column ${col + 1}${full ? ' (full)' : ''}`}
              onClick={() => {
                if (!columnDisabled) onDrop(col);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  focusColumn(col - 1);
                } else if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  focusColumn(col + 1);
                }
              }}
              onMouseEnter={() => setActiveCol(col)}
              onMouseLeave={() => setActiveCol((current) => (current === col ? null : current))}
              onFocus={() => setActiveCol(col)}
              onBlur={() => setActiveCol((current) => (current === col ? null : current))}
              className={cn(
                'flex min-w-0 flex-col gap-1.5 rounded-lg p-1 transition-colors sm:gap-2',
                columnDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'
              )}
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const cell = board[row][col];
                const isWin = winSet.has(`${row}-${col}`);
                const isLanding = showPreview && row === landing;
                return (
                  <span
                    key={row}
                    className="relative aspect-square rounded-full border border-black/60 bg-zinc-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]"
                  >
                    {cell !== null && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-[7%] rounded-full',
                          colors[cell],
                          'ring-2',
                          RINGS[cell],
                          'shadow-[0_2px_8px_rgba(0,0,0,0.5)]',
                          !isWin && 'animate-fall',
                          isWin && 'z-10 animate-radiate ring-violet-400'
                        )}
                      />
                    )}
                    {cell === null && isLanding && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-[7%] rounded-full opacity-40 ring-1',
                          colors[currentPlayer],
                          RINGS[currentPlayer]
                        )}
                      />
                    )}
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
