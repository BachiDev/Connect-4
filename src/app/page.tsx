
'use client';

import GameBoard from './components/GameBoard';
import { useGame } from './hooks/useGame'; // Added comment to trigger re-evaluation

export default function Home() {
  const game = useGame();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600">
      <h1 className="text-4xl font-bold text-white mb-8">4 in a Row</h1>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => {
            game.setVsComputer(false);
            game.setStartingPlayer('1');
            game.resetGame();
          }}
          className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
            !game.vsComputer
              ? "bg-white text-indigo-600"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Player vs Player
        </button>
        <button
          onClick={() => {
            game.setVsComputer(true);
            game.setStartingPlayer('1');
            game.resetGame();
          }}
          className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
            game.vsComputer
              ? "bg-white text-indigo-600"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Player vs Computer
        </button>
      </div>
      {game.vsComputer && (
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => {
              game.setDifficulty('normal');
              game.resetGame();
            }}
            className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
              game.difficulty === 'normal'
                ? "bg-white text-indigo-600"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => {
              game.setDifficulty('strong');
              game.resetGame();
            }}
            className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
              game.difficulty === 'strong'
                ? "bg-white text-indigo-600"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            Strong
          </button>
          <div className="ml-4 border-l-2 border-gray-300 pl-4 flex space-x-4">
            <button
              onClick={() => game.setStartingPlayer('1')}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center ${
                game.chosenStartingPlayer === '1'
                  ? "bg-white text-indigo-600"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              First
              <div className="w-6 h-6 rounded-full border-2 border-white ml-2 bg-red-500"></div>
            </button>
            <button
              onClick={() => game.setStartingPlayer('2')}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center ${
                game.chosenStartingPlayer === '2'
                  ? "bg-white text-indigo-600"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              Second
              <div className="w-6 h-6 rounded-full border-2 border-white ml-2 bg-yellow-500"></div>
            </button>
          </div>
        </div>
      )}
      <div className="text-white text-2xl mb-4 h-8">
        {!game.winner && !game.draw && (
          <div className="flex items-center">
            {game.vsComputer ? (
              game.currentPlayer === game.chosenStartingPlayer ? (
                <div className="flex items-center">
                  Your Turn:
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${game.playerColors[game.currentPlayer]}`}
                  ></div>
                </div>
              ) : (
                <div className="flex items-center">
                  Computer's Turn:
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${game.playerColors[game.currentPlayer]}`}
                  ></div>
                </div>
              )
            ) : (
              <div className="flex items-center">
                Current Player:
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${game.playerColors[game.currentPlayer]}`}
                ></div>
              </div>
            )}
          </div>
        )}
        {game.winner && (
          <div className="flex items-center">
            {game.vsComputer ? (
              game.winner === game.chosenStartingPlayer ? (
                <div className="flex items-center">
                  You win!
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${game.playerColors[game.winner]}`}
                  ></div>
                </div>
              ) : (
                <div className="flex items-center">
                  Computer wins!
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white ml-2 ${game.playerColors[game.winner]}`}
                  ></div>
                </div>
              )
            ) : (
              <div className="flex items-center">
                Player
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white mx-2 ${game.playerColors[game.winner]}`}
                ></div>
                wins!
              </div>
            )}
          </div>
        )}
        {game.draw && `It's a draw!`}
      </div>
      <GameBoard game={game} winningPieces={game.winningPieces} disabled={game.vsComputer && game.playerChoicePending} />
      <button
        onClick={() => game.resetGame()}
        className="mt-8 px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold cursor-pointer"
      >
        New Game
      </button>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={game.undo}
          className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={!!game.winner || game.draw || game.historyIndex === 0}
        >
          Undo
        </button>
        <button
          onClick={game.redo}
          className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={!!game.winner || game.draw || game.historyIndex === game.history.length - 1}
        >
          Redo
        </button>
      </div>
    </main>
    );
}
