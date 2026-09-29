/**
 * Web Worker entry for the strong AI (Phase 2).
 *
 * The minimax search at depth 4 is too heavy for the main thread on mobile,
 * so it runs here. Protocol is request/response with ids so the UI can
 * ignore stale replies after undo/reset/mode changes.
 *
 * `handleAIRequest` is a pure export so the protocol is unit-testable in
 * Node (importing this module must NOT touch `self` — see the guard below).
 */
import { findBestMove } from './ai';
import type { Board, Player } from './connect4';

export interface AIWorkerRequest {
  id: number;
  board: Board;
  player: Player;
}

export interface AIWorkerResponse {
  id: number;
  move: number | null;
}

export function handleAIRequest(request: AIWorkerRequest): AIWorkerResponse {
  return { id: request.id, move: findBestMove(request.board, request.player, 'strong') };
}

// Installed only inside a real worker; importing this module in Node
// (tests) or the main thread leaves it a pure function module.
if (typeof self !== 'undefined' && 'postMessage' in self) {
  self.onmessage = (event: MessageEvent<AIWorkerRequest>) => {
    self.postMessage(handleAIRequest(event.data));
  };
}
