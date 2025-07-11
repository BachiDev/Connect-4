import React from 'react';
import { Player } from '../hooks/types';

interface ComputerOptionsProps {
  difficulty: 'normal' | 'strong';
  setDifficulty: (difficulty: 'normal' | 'strong') => void;
  chosenStartingPlayer: Player;
  setStartingPlayer: (player: Player) => void;
  resetGame: () => void;
}

const ComputerOptions: React.FC<ComputerOptionsProps> = ({
  difficulty,
  setDifficulty,
  chosenStartingPlayer,
  setStartingPlayer,
  resetGame,
}) => {
  return (
    <>
      <div className="mb-4 flex flex-wrap justify-around gap-4">
        <button
          onClick={() => {
            setDifficulty('normal');
            resetGame();
          }}
          className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
            difficulty === 'normal'
              ? "bg-white text-indigo-600"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => {
            setDifficulty('strong');
            resetGame();
          }}
          className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
            difficulty === 'strong'
              ? "bg-white text-indigo-600"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Strong
        </button>
      </div>
      <div className="mb-4 flex flex-wrap justify-around gap-4">
        <button
              onClick={() => {
                setStartingPlayer('1');
                resetGame();
              }}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center ${
                chosenStartingPlayer === '1'
                  ? "bg-white text-indigo-600"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              First
              <div className="w-6 h-6 rounded-full border-2 border-white ml-2 bg-red-500"></div>
            </button>
            <button
              onClick={() => {
                setStartingPlayer('2');
                resetGame();
              }}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center ${
                chosenStartingPlayer === '2'
                  ? "bg-white text-indigo-600"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              Second
              <div className="w-6 h-6 rounded-full border-2 border-white ml-2 bg-yellow-500"></div>
            </button>
      </div>
    </>
  );
};

export default ComputerOptions;
