import { useState } from "react";

export default function NumberGuessDuelUI({ match, player }) {
  const [, refresh] = useState(0);
  const game = match.game;
  const [guess, setGuess] = useState("");

  const submitGuess = () => {
    if (!guess) return;
    match.makeMove({
      playerId: player.Id,
      guess: Number(guess),
    });
    setGuess("");
    refresh((n) => n + 1);
  };

  const isFinished = match.status === "finished";

  return (
    <div className="flex flex-col items-center justify-center min-h-75 p-4 sm:p-8 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md mx-auto transition-all">
      <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Number Guess Duel
      </h3>

      {!isFinished ? (
        <div className="w-full space-y-4">
          <div className="relative">
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Pick 1-10"
              className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-center text-xl font-bold transition-all placeholder:text-slate-500"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
          </div>

          <button
            onClick={submitGuess}
            disabled={!guess}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
          >
            Submit Guess
          </button>
          
          <p className="text-slate-400 text-sm text-center">
            Playing as <span className="text-blue-400 font-medium">{player.name}</span>
          </p>
        </div>
      ) : (
        <div className="w-full text-center animate-bounce-in">
          <div className="p-6 bg-slate-800 rounded-xl border-2 border-yellow-500/50">
            <h4 className="text-lg text-slate-400 uppercase tracking-widest mb-2">Result</h4>
            <div className="text-3xl font-black">
              {game.draw ? (
                <span className="text-gray-300">It's a Draw!</span>
              ) : (
                <span className="text-yellow-400">
                  🏆 Winner: {game.winner.name}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 text-sm text-blue-400 hover:underline"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
