import React from "react";
import StatusBadge from "./StatusBadge";
export default function LeagueCard({ league, onApply }) {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{league.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{league.description}</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Game: {league.game?.name}</p>
                    <p>Players: {league.players?.length}/{league.maxPlayers}</p>
                </div>
                {onApply && (
                    <button
                        onClick={onApply}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                    >
                        Apply
                    </button>
                )}
            </div>
        </div>
    );
}