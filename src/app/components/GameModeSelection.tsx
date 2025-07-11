import React from 'react';
import { Player } from '../hooks/types';

interface GameModeSelectionProps {
  vsComputer: boolean;
  setVsComputer: (vsComputer: boolean) => void;
  setStartingPlayer: (player: Player) => void;
  resetGame: () => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({
  vsComputer,
  setVsComputer,
  setStartingPlayer,
  resetGame,
}) => {
  return (
    <div className="flex flex-wrap justify-around gap-4">
      <button
        onClick={() => {
          setVsComputer(false);
          setStartingPlayer('1');
          resetGame();
        }}
        className={`px-4 py-2 rounded-lg font-bold cursor-pointer flex-grow ${
          !vsComputer
            ? "bg-white text-indigo-600"
            : "bg-gray-300 text-gray-700"
        }`}
      >
        Player vs Player
      </button>
      <button
        onClick={() => {
          setVsComputer(true);
          setStartingPlayer('1');
          resetGame();
        }}
        className={`px-4 py-2 rounded-lg font-bold cursor-pointer flex-grow ${
          vsComputer
            ? "bg-white text-indigo-600"
            : "bg-gray-300 text-gray-700"
        }`}
      >
        Player vs Computer
      </button>
    </div>
  );
};

export default GameModeSelection;
