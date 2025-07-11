import { useState, useCallback } from 'react';
import { Player } from './types';

export const useGameSettings = () => {
  const [vsComputer, setVsComputer] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'normal' | 'strong'>('normal');
  const [chosenStartingPlayer, setChosenStartingPlayer] = useState<Player>('1');
  const [playerColors, setPlayerColors] = useState<Record<Player, string>>({
    '1': 'bg-red-500',
    '2': 'bg-yellow-500',
  });

  const setStartingPlayer = useCallback((player: Player) => {
    setChosenStartingPlayer(player as Player);
    if (player === '1') { // Human wants to be Player 1 (red)
      setPlayerColors({
        '1': 'bg-red-500',
        '2': 'bg-yellow-500',
      });
    } else { // Human wants to be Player 2 (yellow)
      setPlayerColors({
        '1': 'bg-red-500',    // Computer is Player 1, so computer is red
        '2': 'bg-yellow-500', // Human is Player 2, so human is yellow
      });
    }
  }, []);

  return { vsComputer, setVsComputer, difficulty, setDifficulty, chosenStartingPlayer, setChosenStartingPlayer, playerColors, setPlayerColors, setStartingPlayer };
};
