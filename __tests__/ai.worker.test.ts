import { describe, it, expect } from 'vitest';
import { handleAIRequest } from '../src/lib/ai.worker';
import { createBoard, dropIn } from '../src/lib/connect4';
import type { Board, Player } from '../src/lib/connect4';

const setCells = (board: Board, cells: [number, number][], player: Player) => {
  for (const [r, c] of cells) board[r][c] = player;
};

describe('handleAIRequest (worker protocol)', () => {
  it('echoes the request id with the computed move', () => {
    const res = handleAIRequest({ id: 42, board: createBoard(), player: '1' });
    expect(res.id).toBe(42);
    expect(res.move).toBeGreaterThanOrEqual(0);
    expect(res.move).toBeLessThanOrEqual(6);
  });

  it('takes an immediate winning move', () => {
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
    expect(handleAIRequest({ id: 1, board: b, player: '2' }).move).toBe(3);
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
      '1'
    );
    expect(handleAIRequest({ id: 1, board: b, player: '2' }).move).toBe(3);
  });

  it('returns null on a full board', () => {
    let b = createBoard();
    for (let c = 0; c < 7; c++) for (let i = 0; i < 6; i++) b = dropIn(b, c, '1')!.board;
    expect(handleAIRequest({ id: 1, board: b, player: '1' }).move).toBeNull();
  });

  it('answers a mid-game position at depth 4 within budget', () => {
    // A realistic mid-game board: verifies depth-4 search stays fast
    // enough that offloading is a luxury, not a rescue (< 5s vitest timeout).
    const b = createBoard();
    setCells(
      b,
      [
        [5, 3],
        [5, 2],
        [4, 3],
        [5, 4],
        [3, 3],
      ],
      '1'
    );
    setCells(
      b,
      [
        [5, 0],
        [4, 0],
        [5, 6],
        [4, 6],
      ],
      '2'
    );
    const started = Date.now();
    const res = handleAIRequest({ id: 7, board: b, player: '1' });
    const elapsed = Date.now() - started;
    expect(res.move).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(5000);
  });
});
