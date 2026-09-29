import { describe, it, expect } from 'vitest';
import {
  createBoard,
  opposite,
  validMoves,
  dropIn,
  isFull,
  moveCount,
  turnFor,
  checkWinner,
  ROWS,
  COLS,
} from '../src/lib/connect4';
import type { Board, Player } from '../src/lib/connect4';

const setCells = (board: Board, cells: [number, number][], player: Player) => {
  for (const [r, c] of cells) board[r][c] = player;
};

describe('createBoard', () => {
  it('creates a 6x7 empty board', () => {
    const b = createBoard();
    expect(b).toHaveLength(ROWS);
    for (const row of b) {
      expect(row).toHaveLength(COLS);
      expect(row.every((cell) => cell === null)).toBe(true);
    }
  });

  it('returns independent instances (no shared singleton)', () => {
    const a = createBoard();
    const b = createBoard();
    a[5][0] = '1';
    expect(b[5][0]).toBeNull();
  });
});

describe('opposite', () => {
  it("swaps '1' and '2'", () => {
    expect(opposite('1')).toBe('2');
    expect(opposite('2')).toBe('1');
  });
});

describe('dropIn', () => {
  it('lands on the bottom row of an empty column', () => {
    const res = dropIn(createBoard(), 3, '1');
    expect(res).not.toBeNull();
    expect(res!.row).toBe(ROWS - 1);
    expect(res!.board[ROWS - 1][3]).toBe('1');
  });

  it('stacks discs on top of each other', () => {
    const board = createBoard();
    const first = dropIn(board, 0, '1')!;
    const second = dropIn(first.board, 0, '2')!;
    expect(second.row).toBe(ROWS - 2);
    expect(second.board[ROWS - 1][0]).toBe('1');
    expect(second.board[ROWS - 2][0]).toBe('2');
  });

  it('never mutates the input board', () => {
    const board = createBoard();
    const snapshot = board.map((row) => [...row]);
    dropIn(board, 2, '1');
    expect(board).toEqual(snapshot);
  });

  it('returns null for a full column', () => {
    let board = createBoard();
    for (let i = 0; i < ROWS; i++) {
      board = dropIn(board, 1, i % 2 === 0 ? '1' : '2')!.board;
    }
    expect(dropIn(board, 1, '1')).toBeNull();
  });

  it('returns null for out-of-range columns', () => {
    expect(dropIn(createBoard(), -1, '1')).toBeNull();
    expect(dropIn(createBoard(), COLS, '1')).toBeNull();
  });
});

describe('validMoves', () => {
  it('lists all columns center-first on an empty board', () => {
    expect(validMoves(createBoard())).toEqual([3, 2, 4, 1, 5, 0, 6]);
  });

  it('excludes full columns', () => {
    let board = createBoard();
    for (let i = 0; i < ROWS; i++) {
      board = dropIn(board, 3, '1')!.board;
    }
    const moves = validMoves(board);
    expect(moves).not.toContain(3);
    expect(moves).toHaveLength(COLS - 1);
  });
});

describe('moveCount / turnFor', () => {
  it('counts discs and derives the turn by parity', () => {
    const board = createBoard();
    expect(moveCount(board)).toBe(0);
    expect(turnFor(board)).toBe('1');
    const afterOne = dropIn(board, 0, '1')!.board;
    expect(moveCount(afterOne)).toBe(1);
    expect(turnFor(afterOne)).toBe('2');
    const afterTwo = dropIn(afterOne, 0, '2')!.board;
    expect(turnFor(afterTwo)).toBe('1');
  });
});

describe('isFull', () => {
  it('is false on empty and partial boards, true on full ones', () => {
    expect(isFull(createBoard())).toBe(false);
    const partial = dropIn(createBoard(), 0, '1')!.board;
    expect(isFull(partial)).toBe(false);
    let full = createBoard();
    for (let c = 0; c < COLS; c++)
      for (let i = 0; i < ROWS; i++) full = dropIn(full, c, '1')!.board;
    expect(isFull(full)).toBe(true);
  });
});

describe('checkWinner', () => {
  it('returns empty status on an empty board', () => {
    expect(checkWinner(createBoard())).toEqual({ winner: null, line: [], draw: false });
  });

  it('detects a horizontal win with coordinates', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [5, 1],
        [5, 2],
        [5, 3],
      ],
      '1'
    );
    expect(checkWinner(b)).toEqual({
      winner: '1',
      line: [
        [5, 0],
        [5, 1],
        [5, 2],
        [5, 3],
      ],
      draw: false,
    });
  });

  it('detects a vertical win with coordinates', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [2, 6],
        [3, 6],
        [4, 6],
        [5, 6],
      ],
      '2'
    );
    expect(checkWinner(b).winner).toBe('2');
    expect(checkWinner(b).line).toEqual([
      [2, 6],
      [3, 6],
      [4, 6],
      [5, 6],
    ]);
  });

  it('detects a diagonal down-right win', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [2, 0],
        [3, 1],
        [4, 2],
        [5, 3],
      ],
      '1'
    );
    expect(checkWinner(b).winner).toBe('1');
  });

  it('detects a diagonal up-right win', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [4, 1],
        [3, 2],
        [2, 3],
      ],
      '2'
    );
    expect(checkWinner(b).winner).toBe('2');
  });

  it('does not report three-in-a-row as a win', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [5, 1],
        [5, 2],
      ],
      '1'
    );
    expect(checkWinner(b).winner).toBeNull();
  });

  it('highlights the whole run on a horizontal overline (5)', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [5, 1],
        [5, 2],
        [5, 3],
        [5, 4],
      ],
      '1'
    );
    expect(checkWinner(b)).toEqual({
      winner: '1',
      line: [
        [5, 0],
        [5, 1],
        [5, 2],
        [5, 3],
        [5, 4],
      ],
      draw: false,
    });
  });

  it('highlights the whole run on a vertical overline (5)', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [5, 3],
      ],
      '2'
    );
    const res = checkWinner(b);
    expect(res.winner).toBe('2');
    expect(res.line).toHaveLength(5);
    expect(res.line).toContainEqual([1, 3]);
    expect(res.line).toContainEqual([5, 3]);
  });

  it('highlights the whole run on a diagonal overline (6)', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [4, 1],
        [3, 2],
        [2, 3],
        [1, 4],
        [0, 5],
      ],
      '1'
    );
    expect(checkWinner(b).winner).toBe('1');
    expect(checkWinner(b).line).toHaveLength(6);
  });

  it('detects a draw on a full board with no winner', () => {
    const b: Board = [
      ['1', '2', '1', '2', '1', '2', '1'],
      ['1', '2', '1', '2', '1', '2', '1'],
      ['2', '1', '2', '1', '2', '1', '2'],
      ['2', '1', '2', '1', '2', '1', '2'],
      ['1', '2', '1', '2', '1', '2', '1'],
      ['2', '1', '2', '1', '2', '1', '2'],
    ];
    expect(checkWinner(b)).toEqual({ winner: null, line: [], draw: true });
  });
});
