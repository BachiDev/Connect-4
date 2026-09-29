/**
 * Connect-4 AI. Pure functions only (no React) so the strong search can move
 * into a Web Worker in Phase 2 without changes.
 *
 * - normal: take immediate win, block immediate loss, else random valid move.
 * - strong: alpha-beta minimax at STRONG_DEPTH with center-first move order.
 */
import { Board, Player, checkWinner, opposite, validMoves } from './connect4';

export type Difficulty = 'normal' | 'strong';

/**
 * Search depth for strong mode. Depth 4 runs inside the Web Worker
 * (see ai.worker.ts) so it never blocks the main thread, even on mobile.
 */
export const STRONG_DEPTH = 4;

/**
 * Board heuristic from the legacy gameLogic (kept behavior-identical):
 * counts open twos/threes for `player`, penalizes open opponent threes.
 */
export function evaluateBoard(board: Board, player: Player): number {
  const opponent = opposite(player);
  let score = 0;

  const scoreWindow = (window: (Player | null)[]) => {
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;
    for (const cell of window) {
      if (cell === player) playerCount++;
      else if (cell === opponent) opponentCount++;
      else emptyCount++;
    }
    if (playerCount === 3 && emptyCount === 1) score += 10;
    if (playerCount === 2 && emptyCount === 2) score += 2;
    if (opponentCount === 3 && emptyCount === 1) score -= 10;
  };

  // Horizontal windows
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c <= board[r].length - 4; c++) {
      scoreWindow(board[r].slice(c, c + 4));
    }
  }

  // Vertical windows
  for (let c = 0; c < board[0].length; c++) {
    for (let r = 0; r <= board.length - 4; r++) {
      scoreWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
    }
  }

  // Diagonal down-right windows
  for (let r = 0; r <= board.length - 4; r++) {
    for (let c = 0; c <= board[0].length - 4; c++) {
      scoreWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
    }
  }

  // Diagonal up-right windows
  for (let r = 3; r < board.length; r++) {
    for (let c = 0; c <= board[0].length - 4; c++) {
      scoreWindow([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]]);
    }
  }

  return score;
}

export function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  player: Player
): number {
  const opponent = opposite(player);
  const status = checkWinner(board);

  if (status.winner === player) return 1_000_000_000 - depth;
  if (status.winner === opponent) return -1_000_000_000 + depth;
  if (status.draw) return 0;
  if (depth === 0) return evaluateBoard(board, player);

  if (isMaximizingPlayer) {
    let maxScore = -Infinity;
    for (const col of validMoves(board)) {
      const next = board.map((row) => [...row]);
      for (let row = next.length - 1; row >= 0; row--) {
        if (next[row][col] === null) {
          next[row][col] = player;
          break;
        }
      }
      const score = minimax(next, depth - 1, alpha, beta, false, player);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  }

  let minScore = Infinity;
  for (const col of validMoves(board)) {
    const next = board.map((row) => [...row]);
    for (let row = next.length - 1; row >= 0; row--) {
      if (next[row][col] === null) {
        next[row][col] = opponent;
        break;
      }
    }
    const score = minimax(next, depth - 1, alpha, beta, true, player);
    minScore = Math.min(minScore, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }
  return minScore;
}

function findNormalMove(board: Board, player: Player): number | null {
  const opponent = opposite(player);

  // Take an immediate win.
  for (const col of validMoves(board)) {
    const next = board.map((row) => [...row]);
    for (let row = next.length - 1; row >= 0; row--) {
      if (next[row][col] === null) {
        next[row][col] = player;
        if (checkWinner(next).winner === player) return col;
        break;
      }
    }
  }

  // Block an immediate loss.
  for (const col of validMoves(board)) {
    const next = board.map((row) => [...row]);
    for (let row = next.length - 1; row >= 0; row--) {
      if (next[row][col] === null) {
        next[row][col] = opponent;
        if (checkWinner(next).winner === opponent) return col;
        break;
      }
    }
  }

  const moves = validMoves(board);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function findStrongMove(board: Board, player: Player): number | null {
  let bestScore = -Infinity;
  let bestMove: number | null = null;

  // validMoves is center-first, so ties prefer the center column.
  for (const col of validMoves(board)) {
    const next = board.map((row) => [...row]);
    let placed = false;
    for (let row = next.length - 1; row >= 0; row--) {
      if (next[row][col] === null) {
        next[row][col] = player;
        placed = true;
        break;
      }
    }
    if (!placed) continue;
    const score = minimax(next, STRONG_DEPTH, -Infinity, Infinity, false, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = col;
    }
  }
  return bestMove;
}

export function findBestMove(board: Board, player: Player, difficulty: Difficulty): number | null {
  return difficulty === 'normal' ? findNormalMove(board, player) : findStrongMove(board, player);
}
