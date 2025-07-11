import { useState, useEffect, useCallback } from 'react';
import { Player, Board } from './types';
import { checkWinner, findBestMove } from './gameLogic';
import { useGameHistory } from './useGameHistory';
import { useGameSettings } from './useGameSettings';

const initialBoard: Board = Array(6).fill(null).map(() => Array(7).fill(null));

export const useGame = () => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('1');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningPieces, setWinningPieces] = useState<[number, number][]>([]);
  const [draw, setDraw] = useState<boolean>(false);

  const { vsComputer, setVsComputer, difficulty, setDifficulty, chosenStartingPlayer, playerColors, setStartingPlayer } = useGameSettings();
  const { history, historyIndex, undo: historyUndo, redo: historyRedo, addHistory, resetHistory } = useGameHistory(initialBoard, vsComputer, currentPlayer);

  const dropPiece = useCallback((col: number) => {
    if (winner || draw) return;

    const newBoard = board.map(row => [...row]);
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = currentPlayer;
        addHistory(newBoard);
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === '1' ? '2' as Player : '1' as Player);
        break;
      }
    }
  }, [board, winner, draw, currentPlayer, addHistory]);

  const resetGame = useCallback(() => {
    setBoard(initialBoard);
    setWinner(null);
    setWinningPieces([]);
    setDraw(false);
    resetHistory();
    setCurrentPlayer('1' as Player); // Always reset to Player 1 at the start of a new game
  }, [resetHistory]);

  const undo = useCallback(() => {
    const result = historyUndo();
    if (result) {
      setBoard(result.newBoard);
      setCurrentPlayer(result.newCurrentPlayer);
      setWinner(null);
      setDraw(false);
      setWinningPieces([]);
    }
  }, [historyUndo]);

  const redo = useCallback(() => {
    const result = historyRedo();
    if (result) {
      setBoard(result.newBoard);
      setCurrentPlayer(result.newCurrentPlayer);
      setWinner(null);
      setDraw(false);
      setWinningPieces([]);
    }
  }, [historyRedo]);

  useEffect(() => {
    const gameStatus = checkWinner(board);
    setWinner(gameStatus.winner);
    setWinningPieces(gameStatus.winningPieces);
    setDraw(gameStatus.draw);
    
    if (vsComputer && !gameStatus.winner && !gameStatus.draw) {
      const humanPlayerId = chosenStartingPlayer;
      const computerPlayerId = humanPlayerId === '1' ? '2' : '1';

      if (currentPlayer === computerPlayerId) {
        const computerMove = findBestMove(board, computerPlayerId, difficulty);
        if (computerMove !== null) {
          setTimeout(() => dropPiece(computerMove), 500);
        }
      }
    }
  }, [board, winner, draw, currentPlayer, vsComputer, difficulty, chosenStartingPlayer, dropPiece]);

  return { board, currentPlayer, winner, draw, winningPieces, dropPiece, resetGame, undo, redo, history, historyIndex, vsComputer, setVsComputer, difficulty, setDifficulty, setStartingPlayer, chosenStartingPlayer, playerColors };
};
