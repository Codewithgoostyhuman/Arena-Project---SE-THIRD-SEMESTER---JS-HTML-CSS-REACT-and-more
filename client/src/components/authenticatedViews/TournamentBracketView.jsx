import { useState, useEffect } from 'react';
import { Trophy, Users, Check, ArrowLeft } from '@phosphor-icons/react';
import {apiService} from '../../APIs/apiService';
import LoadingScreen from '../reuseableComponents/LoadingScreen';
import {useTournamentSocket} from '../../../hooks/UseSocket';

const TournamentBracketView = ({ tournamentId, setCurrentView, setSelectedMatchId }) => {
  const [bracket, setBracket] = useState({});
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize socket hook
  const { tournamentState, matchCompleted, isConnected } = useTournamentSocket(tournamentId);

  // Initial fetch
  useEffect(() => {
    if (tournamentId) {
      fetchBracket();
    }
  }, [tournamentId]);

  // Handle socket updates
  useEffect(() => {
    if (tournamentState) {
        // If the socket provides the full tournament object, we might need to re-fetch the bracket
        // or if the socket logic sends specific bracket updates.
        // For now, let's re-fetch the bracket when we get a major update or if match completes
        fetchBracket();
    }
  }, [tournamentState]);

  useEffect(() => {
      if (matchCompleted) {
          console.log('Match completed event received, refetching bracket');
          fetchBracket();
      }
  }, [matchCompleted]);

  const fetchBracket = async () => {
    try {
      const response = await apiService.get(`/tournaments/${tournamentId}/bracket`);
      setBracket(response.data.bracket);
      setTournament(response.data.tournament);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bracket:', error);
      setLoading(false);
    }
  };

  const getRoundName = (roundNumber, totalRounds) => {
    if (roundNumber === totalRounds) return 'Finals';
    if (roundNumber === totalRounds - 1) return 'Semi-Finals';
    if (roundNumber === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${roundNumber}`;
  };

  const handleMatchClick = (matchId) => {
    setSelectedMatchId(matchId);
    setCurrentView('match');
  };

  const handleBack = () => {
      setCurrentView('tournaments');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const rounds = Object.keys(bracket).sort((a, b) => parseInt(a) - parseInt(b));
  const totalRounds = rounds.length;

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}
        />
        <div className="fixed top-0 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <button 
            onClick={handleBack} 
            className="flex items-center text-slate-400 hover:text-white transition-colors mb-6 group"
        >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Tournaments
        </button>

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-indigo-500/30">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                Tournament Bracket
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase mb-2">
                {tournament?.name}
            </h1>
            <p className="text-slate-400 text-lg flex items-center">
                <span className="text-indigo-400 font-bold mr-2 uppercase">{tournament?.style}</span> 
                Tournament
            </p>
          </div>
          
           <div className="flex flex-col items-end gap-4">
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
                    tournament?.status === 'finished' ? 'bg-green-500/10 border-green-500 text-green-400' :
                    tournament?.status === 'ongoing' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 animate-pulse' :
                    'bg-slate-700/50 border-slate-600 text-slate-300'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        tournament?.status === 'finished' ? 'bg-green-500' :
                        tournament?.status === 'ongoing' ? 'bg-indigo-500' :
                        'bg-slate-400'
                    }`}></div>
                    <span className="font-bold uppercase text-sm tracking-wider">{tournament?.status?.toUpperCase()}</span>
                </div>

                {!isConnected && (
                    <div className="flex items-center text-orange-400 text-xs font-bold uppercase tracking-wider bg-orange-500/10 px-3 py-1 rounded">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                        Connecting Socket...
                    </div>
                )}
           </div>
        </div>

        {/* Bracket Scroll Container */}
        <div className="overflow-x-auto pb-12 scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
          <div className="flex gap-12 min-w-max px-4">
            {rounds.map((roundNum) => (
              <div key={roundNum} className="flex flex-col gap-8 min-w-[320px]">
                
                {/* Round Header */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-700 shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">
                    {getRoundName(parseInt(roundNum), totalRounds)}
                  </h3>
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">
                    {bracket[roundNum].length} Match{bracket[roundNum].length !== 1 && 'es'}
                  </p>
                </div>

                {/* Matches in Round */}
                <div className="flex flex-col gap-8 justify-center flex-grow py-8">
                    {bracket[roundNum].map((match, index) => (
                    <div
                        key={match._id}
                        onClick={() => handleMatchClick(match._id)}
                        className={`
                        relative bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 cursor-pointer 
                        border border-slate-700/50 hover:border-indigo-500/50 
                        transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]
                        group
                        ${match.status === 'live' ? 'ring-2 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}
                        `}
                    >
                        {/* Decorative Connectors (Visual only) */}
                        <div className="absolute -right-6 top-1/2 w-6 h-0.5 bg-slate-700/50 group-hover:bg-indigo-500/30 transition-colors hidden lg:block"></div>
                        
                        {match.status === 'live' && (
                            <div className="absolute -top-1 -right-1">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-mono text-slate-500 uppercase">Match {match.matchNumber}</span>
                            {match.isFinals && (
                                <span className="flex items-center text-yellow-400 text-xs font-bold uppercase tracking-wider">
                                    <Trophy className="w-3 h-3 mr-1" weight="fill" />
                                    Finals
                                </span>
                            )}
                        </div>

                        {/* Players */}
                        <div className="space-y-3">
                        {match.players.length > 0 ? (
                            match.players.map((player, idx) => (
                            <div
                                key={player._id}
                                className={`
                                flex justify-between items-center p-3 rounded-xl border
                                ${match.winner?._id === player._id ? 
                                    'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 
                                    'bg-slate-900/50 border-slate-700 text-slate-300 group-hover:border-slate-600'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        match.winner?._id === player._id ? 'bg-indigo-500' : 'bg-slate-700'
                                    }`}>
                                        {player.name.charAt(0)}
                                    </div>
                                    <span className="font-bold truncate max-w-[120px]">{player.name}</span>
                                </div>
                                {match.winner?._id === player._id && (
                                    <Check className="w-4 h-4 text-indigo-400" weight="bold" />
                                )}
                            </div>
                            ))
                        ) : (
                            <div className="h-20 flex items-center justify-center border border-dashed border-slate-700 rounded-xl">
                                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest text-center px-4">
                                    Waiting for<br/>Opponents
                                </p>
                            </div>
                        )}
                        </div>

                        {/* Match Status Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                            <span className={`
                                text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded
                                ${match.status === 'live' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                match.status === 'finished' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                'bg-slate-700/50 text-slate-400 border border-slate-600/30'}
                            `}>
                                {match.status}
                            </span>

                            {match.bestOf > 1 && (
                                <span className="text-xs text-slate-500 font-mono">
                                    Bo{match.bestOf}
                                </span>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Users className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Players</p>
                     <p className="text-2xl font-black text-white">{tournament?.players?.length || 0}</p>
                </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Trophy className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Matches</p>
                     <p className="text-2xl font-black text-white">{Object.values(bracket).reduce((sum, round) => sum + round.length, 0)}</p>
                </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Check className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Completion</p>
                     <p className="text-2xl font-black text-white">
                         {tournament?.status === 'finished' ? '100%' : 'In Progress'}
                     </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TournamentBracketView;