'use client';

import GameBoard from './components/GameBoard';
import GameModeSelection from './components/GameModeSelection';
import ComputerOptions from './components/ComputerOptions';
import GameStatusDisplay from './components/GameStatusDisplay';
import NewGameButton from './components/NewGameButton';
import UndoRedoButtons from './components/UndoRedoButtons';
import { useGame } from './hooks/useGame';

export default function Home() {
  const game = useGame();

  return (
    <main className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600 py-8 px-4 overflow-y-auto">
      <h1 className="text-4xl font-bold text-white mb-8 ">Connect 4</h1>
      <GameModeSelection
        vsComputer={game.vsComputer}
        setVsComputer={game.setVsComputer}
        setStartingPlayer={game.setStartingPlayer}
        resetGame={game.resetGame}
      />
      <div className="w-full max-w-md mx-auto h-px bg-white my-4"></div>
      {game.vsComputer && (
        <>
          <ComputerOptions
            difficulty={game.difficulty}
            setDifficulty={game.setDifficulty}
            chosenStartingPlayer={game.chosenStartingPlayer}
            setStartingPlayer={game.setStartingPlayer}
            resetGame={game.resetGame}
          />
          <div className="w-full max-w-md mx-auto h-px bg-white my-4"></div>
        </>
      )}
      <GameStatusDisplay
        winner={game.winner}
        draw={game.draw}
        vsComputer={game.vsComputer}
        currentPlayer={game.currentPlayer}
        chosenStartingPlayer={game.chosenStartingPlayer}
        playerColors={game.playerColors}
      />
      <GameBoard game={game} winningPieces={game.winningPieces} />
      <NewGameButton resetGame={game.resetGame} />
      <UndoRedoButtons
        undo={game.undo}
        redo={game.redo}
        winner={game.winner}
        draw={game.draw}
        historyIndex={game.historyIndex}
        historyLength={game.history.length}
      />
    </main>
    );
}
