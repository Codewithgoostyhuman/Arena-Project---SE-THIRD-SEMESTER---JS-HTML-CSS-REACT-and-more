import { useState, useEffect } from "react";

export default function NumberGuessDuelUI({ competition, currentPlayer }) {
  const [, refresh] = useState(0);
  const [guess, setGuess] = useState("");
  const [secretNumber, setSecretNumber] = useState("");
  const [showSecretInput, setShowSecretInput] = useState(true);

  // Determine competition type and extract relevant data
  const competitionType = competition?.constructor?.name || 'Match';
  const isMatch = competitionType === 'Match';
  const isTournament = competitionType === 'Tournament';
  const isLeague = competitionType === 'League';

  // Extract match, game, and player data based on competition type
  let match, game, players, playerData;
  
  if (isMatch) {
    match = competition;
    game = match?.game;
    players = match?.players || [];
    playerData = currentPlayer || players[0] || { name: "Player 1", Id: "p1" };
  } else if (isTournament) {
    // For tournament, get current active match
    match = competition?.matches?.find(m => m.status === 'running') || competition?.matches?.[0];
    game = match?.game;
    players = match?.players || competition?.players || [];
    playerData = currentPlayer || players[0] || { name: "Player 1", Id: "p1" };
  } else if (isLeague) {
    // For league, get current tournament's active match
    const currentTournament = competition?.tournaments?.find(t => t.status === 'ongoing');
    match = currentTournament?.matches?.find(m => m.status === 'running') || currentTournament?.matches?.[0];
    game = match?.game;
    players = match?.players || [];
    playerData = currentPlayer || players[0] || { name: "Player 1", Id: "p1" };
  }

  // Mock data for preview
  if (!game) {
    game = { 
      status: "running",
      draw: false, 
      winner: null,
      secretNumbers: {},
      rounds: 0,
      maxRounds: 6,
      turn: 0
    };
    players = [
      { name: "Player 1", Id: "p1" },
      { name: "Player 2", Id: "p2" }
    ];
    playerData = { name: "Player 1", Id: "p1" };
  }

  const isFinished = match?.status === "finished" || game?.status === "finished";
  const isMyTurn = game?.turn === players.findIndex(p => p.Id === playerData.Id);
  const hasSetSecret = game?.secretNumbers?.[playerData.Id] !== undefined;

  useEffect(() => {
    if (game?.status === "idle" && match?.start) {
      match.start();
      setShowSecretInput(true);
    }
  }, []);

  const submitSecret = () => {
    if (!secretNumber || secretNumber < 1 || secretNumber > 10) {
      alert("Please enter a number between 1 and 10");
      return;
    }
    
    if (game?.setSecretNumber) {
      game.setSecretNumber(playerData.Id, Number(secretNumber));
      setShowSecretInput(false);
      setSecretNumber("");
      refresh(n => n + 1);
    }
  };

  const submitGuess = () => {
    if (!guess || guess < 1 || guess > 10) {
      alert("Please enter a number between 1 and 10");
      return;
    }
    
    if (!hasSetSecret) {
      alert("Please set your secret number first!");
      return;
    }

    if (match?.makeMove) {
      match.makeMove({
        playerId: playerData.Id,
        guess: Number(guess),
      });
    }
    setGuess("");
    refresh(n => n + 1);
  };

  const getRoundProgress = () => {
    const rounds = game?.rounds || 0;
    const maxRounds = game?.maxRounds || 6;
    return `${rounds}/${maxRounds}`;
  };

  const getCompetitionHeader = () => {
    if (isLeague) {
      return {
        title: competition?.name || "League",
        subtitle: `Tournament • ${players.length} Players`
      };
    } else if (isTournament) {
      return {
        title: competition?.name || "Tournament",
        subtitle: `${competition?.status || 'Active'} • ${players.length} Players`
      };
    } else {
      return {
        title: "Number Duel",
        subtitle: "Head to Head"
      };
    }
  };

  const header = getCompetitionHeader();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      {/* Dynamic Red Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative w-full max-w-2xl bg-zinc-950/80 backdrop-blur-2xl border border-red-900/30 p-10 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.15)] overflow-hidden group">
        {/* Top Accent Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-red-500/40 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-red-500/40 rounded-br-3xl" />

        {/* Title Section */}
        <div className="relative mb-8 text-center">
          <div className="inline-block relative">
            <h3 className="text-4xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              {header.title}
            </h3>
            <div className="absolute -inset-1 bg-red-500/20 blur-xl -z-10" />
          </div>
          <p className="text-zinc-500 text-xs mt-3 font-semibold tracking-[0.25em] uppercase">
            {header.subtitle}
          </p>
          <div className="mt-4 h-px w-40 mx-auto bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        </div>

        {!isFinished ? (
          <div className="relative w-full space-y-6">
            {/* Competition Info Bar */}
            {(isTournament || isLeague) && (
              <div className="px-4 py-3 bg-black/40 border border-zinc-800/50 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 uppercase tracking-[0.15em] font-semibold">
                    {isLeague ? 'League Match' : 'Tournament Round'}
                  </span>
                  <span className="text-red-500 font-bold">
                    Round {getRoundProgress()}
                  </span>
                </div>
              </div>
            )}

            {/* Players Display */}
            <div className="grid grid-cols-2 gap-4">
              {players.map((p, idx) => (
                <div 
                  key={p.Id}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    p.Id === playerData.Id 
                      ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'bg-black/40 border-zinc-800/50'
                  }`}
                >
                  <div className="text-xs text-zinc-600 uppercase tracking-[0.15em] font-semibold mb-1">
                    {p.Id === playerData.Id ? 'You' : `Opponent`}
                  </div>
                  <div className={`font-bold tracking-wider ${
                    p.Id === playerData.Id ? 'text-red-500' : 'text-zinc-400'
                  }`}>
                    {p.name}
                  </div>
                  {p.Id === playerData.Id && (
                    <div className="flex gap-1 mt-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-red-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 h-1 bg-red-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Secret Number Input */}
            {showSecretInput && !hasSetSecret && (
              <div className="space-y-4 p-6 bg-zinc-900/40 border border-red-900/30 rounded-2xl">
                <div className="text-center space-y-2">
                  <div className="text-sm font-bold text-red-500 uppercase tracking-[0.2em]">
                    Set Secret Number
                  </div>
                  <div className="text-xs text-zinc-600">
                    Choose a number between 1-10 for your opponent to guess
                  </div>
                </div>
                
                <div className="relative group/input">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="SECRET NUMBER [1-10]"
                    className="relative w-full px-6 py-5 bg-black/60 border border-zinc-800/80 text-white text-center text-2xl font-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/60 transition-all placeholder:text-zinc-700 placeholder:text-sm placeholder:tracking-[0.2em] tracking-wider hover:border-zinc-700"
                    value={secretNumber}
                    onChange={(e) => setSecretNumber(e.target.value)}
                  />
                </div>

                <button
                  onClick={submitSecret}
                  disabled={!secretNumber}
                  className="relative w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-95 disabled:scale-100 disabled:shadow-none uppercase tracking-[0.25em] text-sm overflow-hidden group/btn"
                >
                  <span className="relative z-10">Lock Secret</span>
                </button>
              </div>
            )}

            {/* Guess Input */}
            {hasSetSecret && (
              <>
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="GUESS OPPONENT'S NUMBER [1-10]"
                    className="relative w-full px-6 py-5 bg-black/60 border border-zinc-800/80 text-white text-center text-2xl font-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/60 transition-all placeholder:text-zinc-700 placeholder:text-sm placeholder:tracking-[0.2em] tracking-wider hover:border-zinc-700"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    disabled={!isMyTurn}
                  />
                  {guess && (
                    <div className="absolute top-1/2 right-5 -translate-y-1/2 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-red-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 bg-red-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                </div>

                <button
                  onClick={submitGuess}
                  disabled={!guess || !isMyTurn}
                  className="relative w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-black py-5 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-95 disabled:scale-100 disabled:shadow-none uppercase tracking-[0.25em] text-sm overflow-hidden group/btn"
                >
                  <span className="relative z-10">
                    {!guess ? 'Awaiting Input' : !isMyTurn ? 'Opponent\'s Turn' : 'Fire Guess'}
                  </span>
                  {guess && isMyTurn && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  )}
                </button>
              </>
            )}

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 uppercase tracking-[0.2em] font-semibold">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span>
                {!hasSetSecret ? 'Setting Secrets' : isMyTurn ? 'Your Turn' : 'Opponent\'s Turn'} • Round {getRoundProgress()}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full text-center space-y-6">
            {/* Result Display */}
            <div className="relative p-8 bg-black/60 border-2 border-red-500/40 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-orange-950/30" />
              
              <div className="relative space-y-4">
                <div className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-bold">
                  Battle Complete
                </div>
                
                <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                
                <div className="text-4xl font-black uppercase italic">
                  {game?.draw ? (
                    <div className="space-y-2">
                      <div className="text-zinc-400 drop-shadow-[0_0_15px_rgba(161,161,170,0.5)]">
                        Draw
                      </div>
                      <div className="text-xs text-zinc-600 tracking-[0.2em] font-semibold">
                        No Victor
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-2xl">🏆</div>
                      <div className="text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]">
                        {game?.winner?.name || "Winner"}
                      </div>
                      <div className="text-xs text-red-500/60 tracking-[0.25em] font-semibold">
                        Victory Confirmed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Final Standings */}
            <div className="space-y-2">
              <div className="text-xs text-zinc-600 uppercase tracking-[0.2em] font-semibold mb-3">
                Final Standings
              </div>
              <div className="grid gap-2">
                {players.map((p, idx) => (
                  <div 
                    key={p.Id}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                      !game?.draw && game?.winner?.Id === p.Id
                        ? 'bg-red-900/20 border border-red-500/40'
                        : 'bg-black/40 border border-zinc-800/50'
                    }`}
                  >
                    <span className="text-sm font-semibold text-zinc-400">
                      {idx + 1}. {p.name}
                    </span>
                    {!game?.draw && game?.winner?.Id === p.Id && (
                      <span className="text-xs text-red-500 font-bold uppercase tracking-wider">
                        Winner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Action Button */}
            <button 
              onClick={() => {
                if (isTournament && competition?.matches) {
                  const nextMatch = competition.matches.find(m => m.status === 'idle');
                  if (nextMatch) {
                    nextMatch.start();
                    refresh(n => n + 1);
                  }
                } else {
                  window.location.reload();
                }
              }}
              className="text-sm text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-[0.25em] font-semibold relative inline-block group/link"
            >
              {isTournament ? 'Next Match' : 'Rematch'}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-red-500 group-hover/link:w-full transition-all duration-300" />
            </button>
          </div>
        )}

        {/* Bottom Corner Indicators */}
        <div className="absolute bottom-4 left-4 flex gap-1">
          <div className="w-1 h-1 bg-red-500/60 rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-red-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 bg-red-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}