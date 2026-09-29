import { describe, it, expect } from 'vitest';
import { undoTarget, redoTarget, canUndo, canRedo } from '../src/lib/history';

/**
 * Locks the full-round undo/redo semantics vs computer:
 * one step covers human + computer move so it is always the human's
 * turn again afterwards. (Turn itself is parity-derived — these helpers
 * only move the history index and can never desync it.)
 */
describe('undoTarget', () => {
  it('steps back one in player-vs-player mode', () => {
    expect(undoTarget(3, 5, false)).toBe(2);
    expect(undoTarget(1, 5, false)).toBe(0);
  });

  it('steps back a full round vs computer', () => {
    expect(undoTarget(4, 5, true)).toBe(2);
    expect(undoTarget(3, 5, true)).toBe(1);
  });

  it('never steps back a full round from the opening moves', () => {
    // Index 1 vs computer: only one move to take back.
    expect(undoTarget(1, 5, true)).toBe(0);
  });

  it('clamps at the start of history', () => {
    expect(undoTarget(0, 1, false)).toBe(0);
    expect(undoTarget(0, 3, true)).toBe(0);
  });
});

describe('redoTarget', () => {
  it('steps forward one in player-vs-player mode', () => {
    expect(redoTarget(1, 5, false)).toBe(2);
    expect(redoTarget(3, 5, false)).toBe(4);
  });

  it('steps forward a full round vs computer', () => {
    expect(redoTarget(0, 5, true)).toBe(2);
    expect(redoTarget(1, 5, true)).toBe(3);
  });

  it('takes a single step at the tail vs computer', () => {
    expect(redoTarget(3, 5, true)).toBe(4);
  });

  it('clamps at the end of history', () => {
    expect(redoTarget(4, 5, false)).toBe(4);
    expect(redoTarget(4, 5, true)).toBe(4);
  });
});

describe('canUndo / canRedo', () => {
  it('reflects history bounds', () => {
    expect(canUndo(0)).toBe(false);
    expect(canUndo(2)).toBe(true);
    expect(canRedo(4, 5)).toBe(false);
    expect(canRedo(2, 5)).toBe(true);
  });
});
