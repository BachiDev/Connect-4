import { describe, it, expect } from 'vitest';
import { evaluateBoard, findBestMove, minimax, STRONG_DEPTH } from '../src/lib/ai';
import { createBoard, dropIn } from '../src/lib/connect4';
import type { Board, Player } from '../src/lib/connect4';

const setCells = (board: Board, cells: [number, number][], player: Player) => {
  for (const [r, c] of cells) board[r][c] = player;
};

describe('evaluateBoard', () => {
  it('scores an empty board as neutral', () => {
    expect(evaluateBoard(createBoard(), '1')).toBe(0);
  });

  it('scores open threes higher than open twos', () => {
    const three = createBoard();
    setCells(
      three,
      [
        [5, 0],
        [5, 1],
        [5, 2],
      ],
      '1'
    );
    const two = createBoard();
    setCells(
      two,
      [
        [5, 0],
        [5, 1],
      ],
      '1'
    );
    expect(evaluateBoard(three, '1')).toBeGreaterThan(evaluateBoard(two, '1'));
  });

  it('penalizes opponent open threes', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 3],
        [5, 4],
        [5, 5],
      ],
      '2'
    );
    expect(evaluateBoard(b, '1')).toBeLessThan(0);
  });
});

describe('minimax', () => {
  it('returns a large positive score for an already-won board', () => {
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
    expect(minimax(b, STRONG_DEPTH, -Infinity, Infinity, true, '1')).toBeGreaterThan(0);
  });

  it('returns a large negative score for an already-lost board', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [5, 1],
        [5, 2],
        [5, 3],
      ],
      '2'
    );
    expect(minimax(b, STRONG_DEPTH, -Infinity, Infinity, true, '1')).toBeLessThan(0);
  });
});

describe('findBestMove (normal)', () => {
  it('takes an immediate winning move', () => {
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
    expect(findBestMove(b, '1', 'normal')).toBe(3);
  });

  it('blocks an immediate opponent win', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [5, 1],
        [5, 2],
      ],
      '2'
    );
    expect(findBestMove(b, '1', 'normal')).toBe(3);
  });

  it('returns a valid column on an empty board', () => {
    const move = findBestMove(createBoard(), '1', 'normal');
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(6);
  });

  it('returns null on a full board', () => {
    let b = createBoard();
    for (let c = 0; c < 7; c++) for (let i = 0; i < 6; i++) b = dropIn(b, c, '1')!.board;
    expect(findBestMove(b, '1', 'normal')).toBeNull();
  });
});

describe('findBestMove (strong)', () => {
  it('takes an immediate winning move', () => {
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
    expect(findBestMove(b, '1', 'strong')).toBe(3);
  });

  it('blocks an immediate opponent win', () => {
    const b = createBoard();
    setCells(
      b,
      [
        [5, 0],
        [5, 1],
        [5, 2],
      ],
      '2'
    );
    expect(findBestMove(b, '1', 'strong')).toBe(3);
  });

  it('prefers the center column on an empty board', () => {
    // All openings score equally, so center-first move order wins the tie.
    expect(findBestMove(createBoard(), '1', 'strong')).toBe(3);
  });

  it('returns null on a full board', () => {
    let b = createBoard();
    for (let c = 0; c < 7; c++) for (let i = 0; i < 6; i++) b = dropIn(b, c, '1')!.board;
    expect(findBestMove(b, '1', 'strong')).toBeNull();
  });
});
