/** Copy deck + links. Text review shouldn't require JSX edits. */
import type { Difficulty } from '@/lib/ai';

export const LINKS = {
  work: 'https://bachi.dev/work',
  source: 'https://github.com/BachiDev/Connect-4',
} as const;

export const HERO = {
  kicker: 'Portfolio demo · No backend · No tracking',
  title: 'Connect-4',
  lede: 'Local two-player or versus a minimax AI — with undo/redo.',
} as const;

export const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  normal: 'Takes wins, blocks threats, then improvises.',
  strong: 'Minimax search — thinks four moves ahead, computed off the main thread.',
};

export const HOW_TO_PLAY: ReadonlyArray<string> = [
  'Pick a column to drop your disc — it falls to the lowest free slot.',
  'Connect four of your discs horizontally, vertically, or diagonally to win.',
  'Against the computer you can play First (red, you open) or Second (yellow).',
  'Strong mode is genuinely strong, not perfect: full Connect-4 is solved, but this search is depth-limited.',
];

export const CONFIRM_NEW_GAME = {
  title: 'Start a new game?',
  body: 'Changing this setting discards the current game in progress.',
  confirm: 'Start new game',
  cancel: 'Keep playing',
} as const;
