import { describe, it, expect } from 'vitest';
import { emptyStats, recordResult, loadStats } from '../src/lib/stats';

describe('recordResult', () => {
  it('counts PvP wins per color and draws', () => {
    let stats = emptyStats();
    stats = recordResult(stats, {
      mode: 'pvp',
      difficulty: 'normal',
      winner: '1',
      human: '1',
      moves: 7,
    });
    stats = recordResult(stats, {
      mode: 'pvp',
      difficulty: 'normal',
      winner: '2',
      human: '1',
      moves: 12,
    });
    stats = recordResult(stats, {
      mode: 'pvp',
      difficulty: 'normal',
      winner: null,
      human: '1',
      moves: 42,
    });
    expect(stats.pvp).toEqual({ red: 1, yellow: 1, draws: 1 });
  });

  it('attributes computer-mode results to the human seat', () => {
    let stats = emptyStats();
    // Human plays second (yellow) and wins.
    stats = recordResult(stats, {
      mode: 'computer',
      difficulty: 'strong',
      winner: '2',
      human: '2',
      moves: 20,
    });
    // Human plays first (red) and loses.
    stats = recordResult(stats, {
      mode: 'computer',
      difficulty: 'strong',
      winner: '2',
      human: '1',
      moves: 18,
    });
    stats = recordResult(stats, {
      mode: 'computer',
      difficulty: 'normal',
      winner: null,
      human: '1',
      moves: 42,
    });
    expect(stats.computer.strong).toEqual({ human: 1, computer: 1, draws: 0 });
    expect(stats.computer.normal).toEqual({ human: 0, computer: 0, draws: 1 });
  });

  it('tracks the fewest moves of any recorded win', () => {
    let stats = emptyStats();
    expect(stats.bestWinMoves).toBeNull();
    stats = recordResult(stats, {
      mode: 'pvp',
      difficulty: 'normal',
      winner: '1',
      human: '1',
      moves: 15,
    });
    stats = recordResult(stats, {
      mode: 'computer',
      difficulty: 'strong',
      winner: '1',
      human: '1',
      moves: 9,
    });
    stats = recordResult(stats, {
      mode: 'computer',
      difficulty: 'strong',
      winner: null,
      human: '1',
      moves: 42,
    });
    expect(stats.bestWinMoves).toBe(9);
  });

  it('never mutates the input stats', () => {
    const before = emptyStats();
    const snapshot = JSON.parse(JSON.stringify(before));
    recordResult(before, { mode: 'pvp', difficulty: 'normal', winner: '1', human: '1', moves: 7 });
    expect(before).toEqual(snapshot);
  });
});

describe('loadStats', () => {
  it('returns empty stats outside a browser (vitest node env)', () => {
    expect(loadStats()).toEqual(emptyStats());
  });
});
