import React from 'react';

interface NewGameButtonProps {
  resetGame: () => void;
}

const NewGameButton: React.FC<NewGameButtonProps> = ({ resetGame }) => {
  return (
    <button
      onClick={resetGame}
      className="mt-8 px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold cursor-pointer"
    >
      New Game
    </button>
  );
};

export default NewGameButton;
