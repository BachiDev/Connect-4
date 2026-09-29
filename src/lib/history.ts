/**
 * Pure undo/redo index math for the boards-array history model.
 *
 * Vs computer, one undo/redo step covers a full round (human + computer move)
 * so it is always the human's turn again afterwards. Turn itself is derived
 * from board parity (see turnFor), so these helpers only move the index —
 * they can never desync whose turn it is.
 */

/** Clamp helper for history bounds. */
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * History index after an undo from `index`.
 * @param length total number of stored boards (>= 1)
 */
export function undoTarget(index: number, length: number, vsComputer: boolean): number {
  const step = vsComputer && index > 1 ? 2 : 1;
  return clamp(index - step, 0, length - 1);
}

/**
 * History index after a redo from `index`.
 * @param length total number of stored boards (>= 1)
 */
export function redoTarget(index: number, length: number, vsComputer: boolean): number {
  const step = vsComputer && index < length - 2 ? 2 : 1;
  return clamp(index + step, 0, length - 1);
}

export function canUndo(index: number): boolean {
  return index > 0;
}

export function canRedo(index: number, length: number): boolean {
  return index < length - 1;
}
