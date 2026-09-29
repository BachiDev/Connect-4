import { useState } from 'react';
import { Player, opposite } from '@/lib/connect4';
import { Difficulty } from '@/lib/ai';

/**
 * Mode + difficulty + seat selection.
 *
 * Colors belong to seats, not to who is human: seat '1' is always red,
 * seat '2' is always yellow. "First" means the human opens as '1' (red);
 * "Second" means the computer opens as '1' and the human plays '2' (yellow).
 * (The legacy version had two identical branches here — the mapping is now
 * derived instead of copy-pasted.)
 */
const PLAYER_COLORS: Record<Player, string> = {
  '1': 'bg-red-500',
  '2': 'bg-yellow-500',
};

export const useGameSettings = () => {
  const [vsComputer, setVsComputer] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [chosenStartingPlayer, setChosenStartingPlayer] = useState<Player>('1');

  const setStartingPlayer = (player: Player) => {
    setChosenStartingPlayer(player);
  };

  return {
    vsComputer,
    setVsComputer,
    difficulty,
    setDifficulty,
    /** Human seat: '1' (First, red, opens) or '2' (Second, yellow). */
    chosenStartingPlayer,
    /** Computer seat — always the other one. */
    computerPlayer: opposite(chosenStartingPlayer),
    playerColors: PLAYER_COLORS,
    setStartingPlayer,
  };
};
