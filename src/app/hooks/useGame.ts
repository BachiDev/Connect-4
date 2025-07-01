import { useState, useEffect } from 'react';

export type Player = '1' | '2';
export type Board = (Player | null)[][];

const initialBoard: Board = Array(6).fill(null).map(() => Array(7).fill(null));

export const useGame = () => {
  const [history, setHistory] = useState<Board[]>([initialBoard]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [board, setBoard] = useState<Board>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('1');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningPieces, setWinningPieces] = useState<[number, number][]>([]);
  const [draw, setDraw] = useState<boolean>(false);
  const [vsComputer, setVsComputer] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'normal' | 'strong'>('normal');
  const [chosenStartingPlayer, setChosenStartingPlayer] = useState<Player>('1');
  const [playerColors, setPlayerColors] = useState<Record<Player, string>>({
    '1': 'bg-red-500',
    '2': 'bg-yellow-500',
  });
  const [isComputerTurn, setIsComputerTurn] = useState<boolean>(false);

  // Helper function to check for a win for a given player on a given board
  const checkWin = (currentBoard: Board, player: Player): boolean => {
    // Check horizontal
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const slice = currentBoard[row].slice(col, col + 4);
        if (slice.every(cell => cell === player)) {
          return true;
        }
      }
    }

    // Check vertical
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        const slice = [currentBoard[row][col], currentBoard[row + 1][col], currentBoard[row + 2][col], currentBoard[row + 3][col]];
        if (slice.every(cell => cell === player)) {
          return true;
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const slice = [currentBoard[row][col], currentBoard[row + 1][col + 1], currentBoard[row + 2][col + 2], currentBoard[row + 3][col + 3]];
        if (slice.every(cell => cell === player)) {
          return true;
        }
      }
    }

    // Check diagonal (up-right)
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const slice = [currentBoard[row][col], currentBoard[row - 1][col + 1], currentBoard[row - 2][col + 2], currentBoard[row - 3][col + 3]];
        if (slice.every(cell => cell === player)) {
          return true;
        }
      }
    }
    return false;
  };

  // Function to evaluate the board for the AI
  const evaluateBoard = (board: Board, player: Player): number => {
    let score = 0;
    const opponent: Player = player === '1' ? '2' : '1';

    // Simple heuristic: count 2-in-a-row and 3-in-a-row for player and opponent
    // This is a very basic evaluation function and can be improved significantly
    const checkLine = (line: (Player | null)[], currentPlayer: Player) => {
      let currentScore = 0;
      let playerCount = 0;
      let opponentCount = 0;
      let emptyCount = 0;

      for (const cell of line) {
        if (cell === currentPlayer) {
          playerCount++;
        } else if (cell === opponent) {
          opponentCount++;
        } else {
          emptyCount++;
        }
      }

      if (playerCount === 3 && emptyCount === 1) currentScore += 10;
      if (playerCount === 2 && emptyCount === 2) currentScore += 2;
      if (opponentCount === 3 && emptyCount === 1) currentScore -= 10; // Block opponent
      return currentScore;
    };

    // Evaluate horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        score += checkLine(board[r].slice(c, c + 4), player);
      }
    }

    // Evaluate vertical
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 3; r++) {
        score += checkLine([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], player);
      }
    }

    // Evaluate diagonal (down-right)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        score += checkLine([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]], player);
      }
    }

    // Evaluate diagonal (up-right)
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        score += checkLine([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]], player);
      }
    }

    return score;
  };

  // Function to check for winner and winning pieces (used by useEffect and minimax)
  const checkWinner = (currentBoard: Board): { winner: Player | null; winningPieces: [number, number][]; draw: boolean } => {
    let currentWinner: Player | null = null;
    let currentWinningPieces: [number, number][] = [];
    let currentDraw: boolean = false;

    // Check horizontal
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const slice = currentBoard[row].slice(col, col + 4);
        if (slice.every(cell => cell && cell === slice[0])) {
          currentWinner = slice[0];
          currentWinningPieces = slice.map((_, index) => [row, col + index]);
          return { winner: currentWinner, winningPieces: currentWinningPieces, draw: currentDraw };
        }
      }
    }

    // Check vertical
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        const slice = [currentBoard[row][col], currentBoard[row + 1][col], currentBoard[row + 2][col], currentBoard[row + 3][col]];
        if (slice.every(cell => cell && cell === slice[0])) {
          currentWinner = slice[0];
          currentWinningPieces = slice.map((_, index) => [row + index, col]);
          return { winner: currentWinner, winningPieces: currentWinningPieces, draw: currentDraw };
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const slice = [currentBoard[row][col], currentBoard[row + 1][col + 1], currentBoard[row + 2][col + 2], currentBoard[row + 3][col + 3]];
        if (slice.every(cell => cell && cell === slice[0])) {
          currentWinner = slice[0];
          currentWinningPieces = slice.map((_, index) => [row + index, col + index]);
          return { winner: currentWinner, winningPieces: currentWinningPieces, draw: currentDraw };
        }
      }
    }

    // Check diagonal (up-right)
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const slice = [currentBoard[row][col], currentBoard[row - 1][col + 1], currentBoard[row - 2][col + 2], currentBoard[row - 3][col + 3]];
        if (slice.every(cell => cell && cell === slice[0])) {
          currentWinner = slice[0];
          currentWinningPieces = slice.map((_, index) => [row - index, col + index]);
          return { winner: currentWinner, winningPieces: currentWinningPieces, draw: currentDraw };
        }
      }
    }

    // Check for draw
    const isBoardFull = currentBoard.every(row => row.every(cell => cell !== null));
    if (isBoardFull && !currentWinner) {
      currentDraw = true;
    }
    return { winner: currentWinner, winningPieces: currentWinningPieces, draw: currentDraw };
  };

  // Minimax algorithm for strong AI
  const minimax = (board: Board, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean, player: Player): number => {
    const opponent: Player = player === '1' ? '2' : '1';
    const gameStatus = checkWinner(board);

    if (gameStatus.winner === player) return 100000000000000 - depth; // Prioritize faster wins
    if (gameStatus.winner === opponent) return -10000000000000 + depth; // Penalize slower losses
    if (gameStatus.draw) return 0;
    if (depth === 0) return evaluateBoard(board, player);

    if (isMaximizingPlayer) {
      let maxScore = -Infinity;
      for (let col = 0; col < 7; col++) {
        const newBoard = board.map(row => [...row]);
        let rowToDrop = -1;
        for (let row = 5; row >= 0; row--) {
          if (!newBoard[row][col]) {
            newBoard[row][col] = player;
            rowToDrop = row;
            break;
          }
        }

        if (rowToDrop !== -1) {
          const score = minimax(newBoard, depth - 1, alpha, beta, false, player);
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let col = 0; col < 7; col++) {
        const newBoard = board.map(row => [...row]);
        let rowToDrop = -1;
        for (let row = 5; row >= 0; row--) {
          if (!newBoard[row][col]) {
            newBoard[row][col] = opponent;
            rowToDrop = row;
            break;
          }
        }
        if (rowToDrop !== -1) {
          const score = minimax(newBoard, depth - 1, alpha, beta, true, player);
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      return minScore;
    }
  };

  // Function to find the best move for the AI
  const findBestMove = (currentBoard: Board, player: Player, difficulty: 'normal' | 'strong'): number | null => {
    console.log('findBestMove called with:', { currentBoard, player, difficulty });
    if (difficulty === 'normal') {
      // Existing normal AI logic (prioritize winning, blocking, then random)
      // Check for winning move
      for (let col = 0; col < 7; col++) {
        const newBoard = currentBoard.map(row => [...row]);
        for (let row = 5; row >= 0; row--) {
          if (!newBoard[row][col]) {
            newBoard[row][col] = player;
            if (checkWin(newBoard, player)) {
              return col;
            }
            break;
          }
        }
      }

      // Check for blocking move
      const opponent: Player = player === '1' ? '2' : '1';
      for (let col = 0; col < 7; col++) {
        const newBoard = currentBoard.map(row => [...row]);
        for (let row = 5; row >= 0; row--) {
          if (!newBoard[row][col]) {
            newBoard[row][col] = opponent;
            if (checkWin(newBoard, opponent)) {
              return col;
            }
            break;
          }
        }
      }

      // Random valid move
      const validCols: number[] = [];
      for (let col = 0; col < 7; col++) {
        if (!currentBoard[0][col]) {
          validCols.push(col);
        }
      }
      if (validCols.length > 0) {
        return validCols[Math.floor(Math.random() * validCols.length)];
      }
      return null;
    } else { // Strong difficulty
      const MAX_DEPTH = 3; // Adjust this for difficulty
      let bestScore = -Infinity;
      let bestMove: number | null = null;

      for (let col = 0; col < 7; col++) {
        const newBoard = currentBoard.map(row => [...row]);
        let rowToDrop = -1;
        for (let row = 5; row >= 0; row--) {
          if (!newBoard[row][col]) {
            newBoard[row][col] = player;
            rowToDrop = row;
            break;
          }
        }

        if (rowToDrop !== -1) {
          const score = minimax(newBoard, MAX_DEPTH, -Infinity, Infinity, false, player);
          if (score > bestScore) {
            bestScore = score;
            bestMove = col;
          }
        }
      }
      return bestMove;
    }
  };

  const dropPiece = (col: number) => {
    console.log('dropPiece called with col:', col);
    if (winner || draw) return;

    const newBoard = board.map(row => [...row]);
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = currentPlayer;
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newBoard]);
        setHistoryIndex(newHistory.length);
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === '1' ? '2' : '1');
        break;
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setWinner(null);
    setWinningPieces([]);
    setDraw(false);
    setHistory([initialBoard]);
    setHistoryIndex(0);
  };

  const setStartingPlayer = (player: Player) => {
    console.log('setStartingPlayer called with:', player);
    setChosenStartingPlayer(player);
    if (player === '1') { // Human wants to be Player 1 (red)
      setPlayerColors({
        '1': 'bg-red-500',
        '2': 'bg-yellow-500',
      });
      setCurrentPlayer('1'); // Player 1 (human) goes first
    } else { // Human wants to be Player 2 (yellow)
      setPlayerColors({
        '1': 'bg-red-500',    // Computer is Player 1, so computer is red
        '2': 'bg-yellow-500', // Human is Player 2, so human is yellow
      });
      setCurrentPlayer('1'); // Computer (Player 1) goes first
    }
    resetGame();
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBoard(history[historyIndex - 1]);
      setCurrentPlayer(prev => (prev === '1' ? '2' : '1'));
      setWinner(null);
      setDraw(false);
      setWinningPieces([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBoard(history[historyIndex + 1]);
      setCurrentPlayer(prev => (prev === '1' ? '2' : '1'));
      setWinner(null);
      setDraw(false);
      setWinningPieces([]);
    }
  };

  useEffect(() => {
    const gameStatus = checkWinner(board);
    setWinner(gameStatus.winner);
    setWinningPieces(gameStatus.winningPieces);
    setDraw(gameStatus.draw);

    console.log('useEffect running:', { vsComputer, currentPlayer, chosenStartingPlayer, winner, draw });

    if (vsComputer && !gameStatus.winner && !gameStatus.draw) {
      const humanPlayerId = chosenStartingPlayer;
      const computerPlayerId = humanPlayerId === '1' ? '2' : '1';

      if (currentPlayer === computerPlayerId) {
        console.log('Computers turn detected:', { currentPlayer, computerPlayerId });
        const computerMove = findBestMove(board, computerPlayerId, difficulty);
        if (computerMove !== null) {
          console.log('Computer move found:', computerMove);
          setTimeout(() => dropPiece(computerMove), 500);
        }
      }
    }
  }, [board, winner, draw, currentPlayer, vsComputer, difficulty, chosenStartingPlayer]);

  return { board, currentPlayer, winner, draw, winningPieces, dropPiece, resetGame, undo, redo, history, historyIndex, vsComputer, setVsComputer, difficulty, setDifficulty, setStartingPlayer, chosenStartingPlayer, playerColors };
};