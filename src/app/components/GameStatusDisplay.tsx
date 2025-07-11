import React from 'react';
import { Player } from '../hooks/useGame';

interface GameStatusDisplayProps {
  winner: Player | null;
  draw: boolean;
  vsComputer: boolean;
  currentPlayer: Player;
  chosenStartingPlayer: Player;
  playerColors: Record<Player, string>;
}

const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
  winner,
  draw,
  vsComputer,
  currentPlayer,
  chosenStartingPlayer,
  playerColors,
}) => {
  return (
    <div className="text-white text-2xl mb-4 h-8">
      {!winner && !draw && (
        <div className="flex items-center">
          {vsComputer ? (
            currentPlayer === chosenStartingPlayer ? (
              <div className="flex items-center">
                Your Turn:
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${playerColors[currentPlayer]}`}
                ></div>
              </div>
            ) : (
              <div className="flex items-center">
                Computer&apos;s Turn:
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${playerColors[currentPlayer]}`}
                ></div>
              </div>
            )
          ) : (
            <div className="flex items-center">
              Current Player:
              <div
                className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${playerColors[currentPlayer]}`}
              ></div>
            </div>
          )}
        </div>
      )}
      {winner && (
        <div className="flex items-center">
          {vsComputer ? (
            winner === chosenStartingPlayer ? (
              <div className="flex items-center">
                You win!
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${playerColors[winner]}`}
                ></div>
              </div>
            ) : (
              <div className="flex items-center">
                Computer wins!
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${playerColors[winner]}`}
                ></div>
              </div>
            )
          ) : (
            <div className="flex items-center">
              Player
              <div
                className={`w-6 h-6 rounded-full border-2 border-white mx-2 ${playerColors[winner]}`}
              ></div>
              wins!
            </div>
          )}
        </div>
      )}
      {draw && `It's a draw!`}
    </div>
  );
};

export default GameStatusDisplay;
