import React from "react";
import StatusBadge from "./StatusBadge";
export default function TournamentCard({ tournament, onApply }) {
    return (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 overflow-hidden hover:-translate-y-1 group">
            <div className="p-6 relative">
                <div className="absolute top-0 right-0 p-4">
                     <StatusBadge status={tournament.status} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors pr-20">{tournament.name}</h3>
                
                <div className="space-y-3 text-sm text-slate-300 mb-6">
                    <div className="flex items-center">
                        <span className="text-slate-500 w-20">League:</span>
                        <span className="font-semibold text-white">{tournament.league?.name}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-slate-500 w-20">Game:</span>
                        <span className="font-semibold text-indigo-400">{tournament.league?.game?.name}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-slate-500 w-20">Players:</span>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 mr-2 max-w-[100px] relative overflow-hidden">
                             <div 
                                className="bg-indigo-500 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(((tournament.players?.length || 0) / tournament.maxPlayers) * 100, 100)}%` }}
                             ></div>
                        </div>
                        <span className="text-xs">{tournament.players?.length}/{tournament.maxPlayers}</span>
                    </div>
                </div>

                {onApply && (
                    <button
                        onClick={onApply}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-indigo-900/20"
                    >
                        Apply Now
                    </button>
                )}
            </div>
        </div>
    );
}