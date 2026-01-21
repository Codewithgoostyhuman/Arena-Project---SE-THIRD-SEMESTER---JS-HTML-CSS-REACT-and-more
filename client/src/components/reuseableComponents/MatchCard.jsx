import React from 'react';
import { Sword, Eye } from "@phosphor-icons/react";

const MatchCard = ({ match, setCurrentView, setSelectedMatchId }) => {
  const handleViewMatch = () => {
    if (!setSelectedMatchId || !setCurrentView) return;
    setSelectedMatchId(match._id);
    setCurrentView('match');
  };

  const handleClick = (e) => {
    e.stopPropagation();
    handleViewMatch();
  };

  return (
    <div 
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 group relative overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors"></div>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Sword className="w-4 h-4 mr-2 text-indigo-400" weight="duotone" />
          {match.game?.name || 'Match'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center ${
          match.status === 'live' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
          match.status === 'finished' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
        }`}>
          {match.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>}
          {match.status?.toUpperCase() || 'PENDING'}
        </span>
      </div>

      <div className="space-y-4 mb-4 relative z-10">
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <span className="text-sm font-medium text-slate-300">{match.players?.[0]?.name || 'Player 1'}</span>
          {match.score && <span className="font-bold text-indigo-400 font-mono text-lg">{match.score.player1}</span>}
        </div>
        
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <span className="text-sm font-medium text-slate-300">{match.players?.[1]?.name || 'Player 2'}</span>
          {match.score && <span className="font-bold text-purple-400 font-mono text-lg">{match.score.player2}</span>}
        </div>
      </div>

      {match.tournament && (
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            {match.tournament.name} • R{match.round}
          </p>
        </div>
      )}

      <button
        onClick={handleClick}
        className="w-full mt-4 bg-slate-700/50 hover:bg-indigo-600 text-slate-300 hover:text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-300 border border-slate-600 hover:border-indigo-500 group-hover:shadow-lg flex items-center justify-center"
      >
        <Eye className="w-4 h-4 mr-2" weight="duotone" />
        Watch Match
      </button>
    </div>
  );
};

export default MatchCard;