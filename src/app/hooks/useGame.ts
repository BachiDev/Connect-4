import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Player,
  Board,
  createBoard,
  checkWinner,
  dropIn,
  turnFor,
  moveCount,
} from '@/lib/connect4';
import { findBestMove } from '@/lib/ai';
import type { AIWorkerRequest, AIWorkerResponse } from '@/lib/ai.worker';
import { undoTarget, redoTarget, canUndo, canRedo } from '@/lib/history';
import {
  loadStats,
  saveStats,
  clearStats,
  recordResult,
  emptyStats,
  type Stats,
} from '@/lib/stats';
import { useGameSettings } from './useGameSettings';

interface HistoryState {
  boards: Board[];
  index: number;
}

interface PendingRequest {
  token: number;
  commit: (move: number | null) => void;
  /** Sync fallback when the worker is missing or fails to load. */
  fallback: () => void;
}

/**
 * Game orchestrator (Phase 2).
 *
 * - History is ONE state object (boards + index); every update is a pure
 *   functional setState, so rapid clicks can never lose a move or desync.
 * - Turn and win/draw status are derived from the current board.
 * - Strong AI runs in a Web Worker; normal AI stays sync with a short pacing
 *   delay. Pending requests carry tokens — any board/mode change (or unmount)
 *   supersedes them, so stale replies can never commit.
 * - `isThinking` is true while a computer move is being computed.
 */
export const useGame = () => {
  const {
    vsComputer,
    setVsComputer,
    difficulty,
    setDifficulty,
    chosenStartingPlayer,
    computerPlayer,
    playerColors,
    setStartingPlayer,
  } = useGameSettings();

  const [history, setHistory] = useState<HistoryState>(() => ({
    boards: [createBoard()],
    index: 0,
  }));
  const [isThinking, setIsThinking] = useState<boolean>(false);
  // Stats start empty so the first client render matches the server
  // prerender exactly; stored stats load in an effect after hydration.
  // (Reading localStorage in the useState initializer would hydrate with
  // different HTML whenever stats were recorded in a past session.)
  const [stats, setStats] = useState<Stats>(() => emptyStats());
  useEffect(() => {
    setStats(loadStats());
  }, []);
  // Terminal boards already counted (survives undo/redo/review cycles).
  const recordedRef = useRef<Set<string>>(new Set());

  const board = history.boards[history.index];
  const currentPlayer: Player = useMemo(() => turnFor(board), [board]);
  const status = useMemo(() => checkWinner(board), [board]);
  const { winner, draw } = status;
  const winningPieces = status.line;

  const pushBoard = useCallback((next: Board) => {
    setHistory((h) => ({
      boards: [...h.boards.slice(0, h.index + 1), next],
      index: h.index + 1,
    }));
  }, []);

  const dropPiece = useCallback(
    (col: number) => {
      if (winner || draw) return;
      if (vsComputer && currentPlayer !== chosenStartingPlayer) return;
      const result = dropIn(board, col, currentPlayer);
      if (!result) return;
      pushBoard(result.board);
    },
    [board, winner, draw, vsComputer, currentPlayer, chosenStartingPlayer, pushBoard]
  );

  const resetGame = useCallback(() => {
    setHistory({ boards: [createBoard()], index: 0 });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => ({ ...h, index: undoTarget(h.index, h.boards.length, vsComputer) }));
  }, [vsComputer]);

  const redo = useCallback(() => {
    setHistory((h) => ({ ...h, index: redoTarget(h.index, h.boards.length, vsComputer) }));
  }, [vsComputer]);

  // ---- session stats (browser-local, recorded once per terminal board) ----
  useEffect(() => {
    if (winner === null && !draw) return;
    const key = JSON.stringify(board);
    if (recordedRef.current.has(key)) return;
    recordedRef.current.add(key);
    const next = recordResult(stats, {
      mode: vsComputer ? 'computer' : 'pvp',
      difficulty,
      winner,
      human: chosenStartingPlayer,
      moves: moveCount(board),
    });
    saveStats(next);
    setStats(next);
  }, [board, winner, draw, vsComputer, difficulty, chosenStartingPlayer, stats]);

  const resetStats = useCallback(() => {
    recordedRef.current.clear();
    setStats(clearStats());
  }, []);

  // ---- computer move ----
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<PendingRequest | null>(null);
  const tokenRef = useRef(0);

  // Terminate the worker on unmount; stale replies are ignored via tokens.
  useEffect(() => {
    return () => {
      tokenRef.current += 1;
      workerRef.current?.terminate();
      workerRef.current = null;
      pendingRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!vsComputer || winner || draw || currentPlayer !== computerPlayer) {
      setIsThinking(false);
      pendingRef.current = null;
      return;
    }
    const token = (tokenRef.current += 1);
    setIsThinking(true);

    const commit = (move: number | null) => {
      if (tokenRef.current !== token) return; // superseded by undo/reset/etc.
      pendingRef.current = null;
      if (move === null) {
        setIsThinking(false);
        return;
      }
      const result = dropIn(board, move, computerPlayer);
      if (!result) {
        setIsThinking(false);
        return;
      }
      pushBoard(result.board);
      setIsThinking(false);
    };

    if (difficulty === 'strong') {
      let worker = workerRef.current;
      if (!worker && typeof window !== 'undefined') {
        try {
          worker = new Worker(new URL('../../lib/ai.worker.ts', import.meta.url));
          worker.onmessage = (event: MessageEvent<AIWorkerResponse>) => {
            const pending = pendingRef.current;
            if (!pending || event.data.id !== pending.token) return;
            pendingRef.current = null;
            pending.commit(event.data.move);
          };
          worker.onerror = () => {
            // Worker failed to load — fall back to sync compute.
            const pending = pendingRef.current;
            if (!pending) return;
            pendingRef.current = null;
            pending.fallback();
          };
          workerRef.current = worker;
        } catch {
          worker = null;
        }
      }
      if (worker) {
        const fallback = () => commit(findBestMove(board, computerPlayer, difficulty));
        pendingRef.current = { token, commit, fallback };
        const request: AIWorkerRequest = { id: token, board, player: computerPlayer };
        worker.postMessage(request);
        return () => {
          tokenRef.current += 1;
        };
      }
      // Worker unavailable (SSR / old browser) — sync fallback below.
    }

    // Normal difficulty (pacing delay for UX) or worker-less fallback.
    const timer = setTimeout(
      () => {
        commit(findBestMove(board, computerPlayer, difficulty));
      },
      difficulty === 'strong' ? 0 : 350
    );
    return () => {
      tokenRef.current += 1;
      clearTimeout(timer);
    };
  }, [board, vsComputer, winner, draw, currentPlayer, computerPlayer, difficulty, pushBoard]);

  return {
    board,
    currentPlayer,
    winner,
    draw,
    winningPieces,
    dropPiece,
    resetGame,
    undo,
    redo,
    history: history.boards,
    historyIndex: history.index,
    canUndo: canUndo(history.index),
    canRedo: canRedo(history.index, history.boards.length),
    /** True while a computer move is being computed (worker or fallback). */
    isThinking,
    /** Browser-local aggregates (stats strip). */
    stats,
    resetStats,
    vsComputer,
    setVsComputer,
    difficulty,
    setDifficulty,
    setStartingPlayer,
    chosenStartingPlayer,
    playerColors,
  };
};
