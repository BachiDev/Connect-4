
import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import GameCell from './GameCell';
import GamePiece from './GamePiece';

type GameBoardProps = {
  game: ReturnType<typeof useGame>;
  winningPieces: [number, number][];
  disabled?: boolean;
};

const checkIsWinningPiece = (winningPieces: [number, number][] | undefined, row: number, col: number) => {
  const currentWinningPieces = winningPieces || [];
  return currentWinningPieces.some(coord => coord[0] === row && coord[1] === col);
};

const GameBoard = ({ game, winningPieces, disabled }: GameBoardProps) => {
  const { board, dropPiece } = game;
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-7 gap-[0.5vw] p-[0.5vw] rounded-lg">
      {board.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            onClick={() => (!disabled && !game.winner && !game.draw) && dropPiece(j)}
            onMouseEnter={() => (!disabled && !game.winner && !game.draw) && setHoveredCol(j)}
            onMouseLeave={() => (!disabled && !game.winner && !game.draw) && setHoveredCol(null)}
            className={(!disabled && !game.winner && !game.draw) ? 'cursor-pointer' : ''}
          >
            <GameCell>
              {cell && <GamePiece color={game.playerColors[cell]} isWinningPiece={checkIsWinningPiece(winningPieces, i, j)} />}
              {i === 0 && hoveredCol === j && !cell && !game.winner && !game.draw && !disabled && (
                <GamePiece color={game.playerColors[game.currentPlayer].replace('500', '300')} isPreview />
              )}
            </GameCell>
          </div>
        ))
      )}
    </div>
  );
};

export default GameBoard;
