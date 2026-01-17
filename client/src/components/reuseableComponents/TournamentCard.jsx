import React from "react";
import StatusBadge from "./StatusBadge";
export default function TournamentCard({ tournament, onApply }) {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{tournament.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>League: {tournament.league?.name}</p>
                    <p>Game: {tournament.league?.game?.name}</p>
                    <p>Players: {tournament.players?.length}/{tournament.maxPlayers}</p>
                    <p>Status: <StatusBadge status={tournament.status} /></p>
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