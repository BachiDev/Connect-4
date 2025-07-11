import React from 'react';

interface UndoRedoButtonsProps {
  undo: () => void;
  redo: () => void;
  winner: string | null;
  draw: boolean;
  historyIndex: number;
  historyLength: number;
}

const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  undo,
  redo,
  winner,
  draw,
  historyIndex,
  historyLength,
}) => {
  return (
    <div className="mt-4 flex space-x-4">
      <button
        onClick={undo}
        className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={!!winner || draw || historyIndex === 0}
      >
        Undo
      </button>
      <button
        onClick={redo}
        className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={!!winner || draw || historyIndex === historyLength - 1}
      >
        Redo
      </button>
    </div>
  );
};

export default UndoRedoButtons;
