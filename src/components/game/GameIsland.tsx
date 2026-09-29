'use client';

import { useEffect, useRef, useState } from 'react';
import { moveCount } from '@/lib/connect4';
import type { Player } from '@/lib/connect4';
import type { Difficulty } from '@/lib/ai';
import { useGame } from '@/app/hooks/useGame';
import Toolbar, { type GameMode } from '@/components/game/Toolbar';
import StatusBanner from '@/components/game/StatusBanner';
import Board from '@/components/game/Board';
import ActionsRow from '@/components/game/ActionsRow';
import StatsStrip from '@/components/game/StatsStrip';
import HowToPlay from '@/components/game/HowToPlay';
import GameOverDialog from '@/components/game/GameOverDialog';
import ConfirmDialog from '@/components/game/ConfirmDialog';

/**
 * The only client island on the page: owns game state and wires
 * toolbar → board → dialogs → stats. Everything around it is static.
 */
export default function GameIsland() {
  const game = useGame();
  const terminal = game.winner !== null || game.draw;
  const moves = moveCount(game.board);

  // Mid-game guard: toolbar changes discard the live game.
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const requestChange = (action: () => void) => {
    if (moves > 0 && !terminal) setConfirmAction(() => action);
    else action();
  };

  // Result dialog: opens once per terminal position, reopens on demand.
  const [resultOpen, setResultOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const wasTerminal = useRef(false);
  useEffect(() => {
    if (terminal && !wasTerminal.current) {
      setResultOpen(true);
      setReviewed(false);
    }
    if (!terminal) setReviewed(false);
    wasTerminal.current = terminal;
  }, [terminal]);

  const mode: GameMode = game.vsComputer ? 'computer' : 'pvp';

  const applyMode = (next: GameMode) => {
    game.setVsComputer(next === 'computer');
    game.resetGame();
  };
  const applyDifficulty = (difficulty: Difficulty) => {
    game.setDifficulty(difficulty);
    game.resetGame();
  };
  const applySeat = (seat: Player) => {
    game.setStartingPlayer(seat);
    game.resetGame();
  };

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:justify-center lg:gap-6">
      <div className="order-1 lg:col-start-1 lg:row-start-1">
        <Toolbar
          mode={mode}
          onModeChange={(next) => requestChange(() => applyMode(next))}
          difficulty={game.difficulty}
          onDifficultyChange={(next) => requestChange(() => applyDifficulty(next))}
          seat={game.chosenStartingPlayer}
          onSeatChange={(next) => requestChange(() => applySeat(next))}
        />
      </div>

      <div className="order-2 lg:col-start-1 lg:row-start-2">
        <StatusBanner
          winner={game.winner}
          draw={game.draw}
          vsComputer={game.vsComputer}
          currentPlayer={game.currentPlayer}
          human={game.chosenStartingPlayer}
          colors={game.playerColors}
          isThinking={game.isThinking}
          moves={moves}
        />
      </div>

      <div className="order-3 space-y-4 lg:col-start-2 lg:row-start-1 lg:row-span-4">
        <ActionsRow
          onNewGame={game.resetGame}
          onUndo={game.undo}
          onRedo={game.redo}
          canUndo={game.canUndo}
          canRedo={game.canRedo}
          showResult={terminal && reviewed && !resultOpen}
          onShowResult={() => {
            setReviewed(false);
            setResultOpen(true);
          }}
        />
        <Board
          board={game.board}
          colors={game.playerColors}
          winLine={game.winningPieces}
          disabled={terminal || game.isThinking}
          currentPlayer={game.currentPlayer}
          onDrop={game.dropPiece}
        />
      </div>

      <div className="order-4 lg:col-start-1 lg:row-start-3">
        <StatsStrip
          stats={game.stats}
          vsComputer={game.vsComputer}
          difficulty={game.difficulty}
          human={game.chosenStartingPlayer}
          onReset={game.resetStats}
        />
      </div>

      <div className="order-5 lg:col-start-1 lg:row-start-4">
        <HowToPlay />
      </div>

      <GameOverDialog
        open={resultOpen}
        winner={game.winner}
        human={game.chosenStartingPlayer}
        vsComputer={game.vsComputer}
        difficulty={game.difficulty}
        moves={moves}
        onPlayAgain={() => {
          setResultOpen(false);
          game.resetGame();
        }}
        onReview={() => {
          setResultOpen(false);
          setReviewed(true);
        }}
      />

      <ConfirmDialog action={confirmAction} onClose={() => setConfirmAction(null)} />
    </div>
  );
}
