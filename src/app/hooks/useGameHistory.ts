import { useState, useCallback } from 'react';
import { Board, Player } from './types';

export const useGameHistory = (initialBoard: Board, vsComputer: boolean, currentPlayer: Player) => {
  const [history, setHistory] = useState<Board[]>([initialBoard]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      let newHistoryIndex = historyIndex - 1;
      let newCurrentPlayer = (currentPlayer === '1' ? '2' : '1') as Player;

      if (vsComputer && historyIndex > 1) {
        newHistoryIndex = historyIndex - 2;
        newCurrentPlayer = currentPlayer; // Player's turn again after undoing computer's and player's move
      }

      setHistoryIndex(newHistoryIndex);
      return { newBoard: history[newHistoryIndex], newCurrentPlayer };
    }
    return null;
  }, [history, historyIndex, vsComputer, currentPlayer]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      let newHistoryIndex = historyIndex + 1;
      let newCurrentPlayer = (currentPlayer === '1' ? '2' : '1') as Player;

      if (vsComputer && historyIndex < history.length - 2) {
        newHistoryIndex = historyIndex + 2;
        newCurrentPlayer = currentPlayer; // Player's turn again after redoing player's and computer's move
      }

      setHistoryIndex(newHistoryIndex);
      return { newBoard: history[newHistoryIndex], newCurrentPlayer };
    }
    return null;
  }, [history, historyIndex, vsComputer, currentPlayer]);

  const addHistory = useCallback((newBoard: Board) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newBoard]);
    setHistoryIndex(newHistory.length);
  }, [history, historyIndex]);

  const resetHistory = useCallback(() => {
    setHistory([initialBoard]);
    setHistoryIndex(0);
  }, [initialBoard]);

  return { history, historyIndex, undo, redo, addHistory, resetHistory };
};
