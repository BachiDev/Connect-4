/**
 * Browser-local session stats (localStorage only — no cookies, no tracking).
 * Aggregates only; a per-board ref-set in useGame prevents double counting
 * across undo/redo/review cycles.
 */
import type { Player } from './connect4';
import type { Difficulty } from './ai';

export const STATS_KEY = 'connect4:stats:v1';

export interface ComputerModeStats {
  human: number;
  computer: number;
  draws: number;
}

export interface PvPStats {
  red: number;
  yellow: number;
  draws: number;
}

export interface Stats {
  computer: Record<Difficulty, ComputerModeStats>;
  pvp: PvPStats;
  /** Fewest moves in any recorded win (human-side or PvP). Null when none. */
  bestWinMoves: number | null;
}

export function emptyStats(): Stats {
  return {
    computer: {
      normal: { human: 0, computer: 0, draws: 0 },
      strong: { human: 0, computer: 0, draws: 0 },
    },
    pvp: { red: 0, yellow: 0, draws: 0 },
    bestWinMoves: null,
  };
}

export interface GameRecord {
  mode: 'pvp' | 'computer';
  difficulty: Difficulty;
  winner: Player | null;
  /** Human seat ('1' = red/first, '2' = yellow/second). */
  human: Player;
  moves: number;
}

export function recordResult(prev: Stats, record: GameRecord): Stats {
  const next: Stats = {
    computer: {
      normal: { ...prev.computer.normal },
      strong: { ...prev.computer.strong },
    },
    pvp: { ...prev.pvp },
    bestWinMoves: prev.bestWinMoves,
  };

  if (record.winner !== null) {
    next.bestWinMoves =
      prev.bestWinMoves === null ? record.moves : Math.min(prev.bestWinMoves, record.moves);
  }

  if (record.mode === 'pvp') {
    if (record.winner === '1') next.pvp.red += 1;
    else if (record.winner === '2') next.pvp.yellow += 1;
    else next.pvp.draws += 1;
    return next;
  }

  const bucket = next.computer[record.difficulty];
  if (record.winner === null) bucket.draws += 1;
  else if (record.winner === record.human) bucket.human += 1;
  else bucket.computer += 1;
  return next;
}

function isValidStats(value: unknown): value is Stats {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.bestWinMoves !== 'number' && v.bestWinMoves !== null) return false;
  const bucketOk = (b: unknown) =>
    typeof b === 'object' &&
    b !== null &&
    ['human', 'computer', 'draws'].every(
      (k) => typeof (b as Record<string, unknown>)[k] === 'number'
    );
  const pvp = v.pvp as Record<string, unknown> | undefined;
  const computer = v.computer as Record<string, unknown> | undefined;
  return (
    !!pvp &&
    ['red', 'yellow', 'draws'].every((k) => typeof pvp[k] === 'number') &&
    !!computer &&
    bucketOk(computer.normal) &&
    bucketOk(computer.strong)
  );
}

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadStats(): Stats {
  const store = storage();
  if (!store) return emptyStats();
  try {
    const raw = store.getItem(STATS_KEY);
    if (!raw) return emptyStats();
    const parsed: unknown = JSON.parse(raw);
    return isValidStats(parsed) ? parsed : emptyStats();
  } catch {
    return emptyStats();
  }
}

export function saveStats(stats: Stats): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Storage full or blocked (private mode) — stats simply stay in memory.
  }
}

export function clearStats(): Stats {
  const fresh = emptyStats();
  const store = storage();
  if (!store) return fresh;
  try {
    store.removeItem(STATS_KEY);
  } catch {
    // Ignore — see saveStats.
  }
  return fresh;
}
