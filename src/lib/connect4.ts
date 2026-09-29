/**
 * Canonical Connect-4 rules: board model + win detection + move application.
 * Pure functions only — no React. Single source of truth for game state
 * (replaces the old duplicated `checkWin`/`checkWinner` in hooks/gameLogic).
 */

export type Player = '1' | '2';
export type Board = (Player | null)[][];
export type CellCoord = [number, number];

export const ROWS = 6;
export const COLS = 7;
/** Discs in a row needed to win. */
export const WIN_LENGTH = 4;

/** Fresh empty board. Always a factory — never share one mutable instance. */
export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Player | null>(COLS).fill(null));
}

export function opposite(player: Player): Player {
  return player === '1' ? '2' : '1';
}

/** Columns that still accept a disc, center-first (best move order for AI). */
export function validMoves(board: Board): number[] {
  const moves: number[] = [];
  // Center-out ordering: 3, 2, 4, 1, 5, 0, 6
  const center = Math.floor(COLS / 2);
  for (let offset = 0; offset < COLS; offset++) {
    const col =
      offset === 0
        ? center
        : offset % 2 === 1
          ? center - Math.ceil(offset / 2)
          : center + offset / 2;
    if (board[0][col] === null) moves.push(col);
  }
  return moves;
}

export interface DropResult {
  board: Board;
  row: number;
}

/**
 * Immutable drop: returns the new board + landing row, or null when the
 * column is full / out of range. Never mutates the input board.
 */
export function dropIn(board: Board, col: number, player: Player): DropResult | null {
  if (col < 0 || col >= COLS) return null;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      const next = board.map((r) => [...r]);
      next[row][col] = player;
      return { board: next, row };
    }
  }
  return null;
}

export function isFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

/** Number of discs on the board (== moves played). */
export function moveCount(board: Board): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell !== null) n++;
  return n;
}

/**
 * Whose turn it is from board parity. Player '1' always opens, so an even
 * count means '1' to move. Deriving (not storing) the turn keeps undo/redo
 * from ever desyncing.
 */
export function turnFor(board: Board): Player {
  return moveCount(board) % 2 === 0 ? '1' : '2';
}

export interface GameStatus {
  winner: Player | null;
  /** Coordinates of the winning four (empty when no winner). */
  line: CellCoord[];
  draw: boolean;
}

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [-1, 1], // diagonal up-right
];

/**
 * Single canonical win scan. Checks every cell as a potential line start in
 * reading order; direction order (H, V, DR, UR) matches the old checkWinner
 * for all single-win boards. (Unreachable multi-win boards may report a
 * different line than the legacy scan — real games end at the first win.)
 *
 * Overlines (5+) highlight the whole run, not just the first four: the
 * found window is extended in both directions while discs match.
 */
export function checkWinner(board: Board): GameStatus {
  const inBounds = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const player = board[row][col];
      if (player === null) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const line: CellCoord[] = [[row, col]];
        for (let step = 1; step < WIN_LENGTH; step++) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!inBounds(r, c) || board[r][c] !== player) break;
          line.push([r, c]);
        }
        if (line.length === WIN_LENGTH) {
          // Extend forward past four …
          let [fr, fc] = line[line.length - 1];
          while (inBounds(fr + dr, fc + dc) && board[fr + dr][fc + dc] === player) {
            fr += dr;
            fc += dc;
            line.push([fr, fc]);
          }
          // … and backward, so a 5+ run highlights every disc.
          let [br, bc] = line[0];
          while (inBounds(br - dr, bc - dc) && board[br - dr][bc - dc] === player) {
            br -= dr;
            bc -= dc;
            line.unshift([br, bc]);
          }
          return { winner: player, line, draw: false };
        }
      }
    }
  }
  return { winner: null, line: [], draw: isFull(board) };
}
