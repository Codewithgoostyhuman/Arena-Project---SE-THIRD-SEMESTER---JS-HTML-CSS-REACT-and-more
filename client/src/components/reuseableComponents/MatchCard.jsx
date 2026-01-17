import React from 'react';
import { Gamepad2 } from 'lucide-react';
export default function MatchCard({ match }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">LIVE</span>
                <Gamepad2 className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{match.game?.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{match.tournament?.name}</p>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{match.players?.[0]?.name}</span>
                <span className="text-gray-400">vs</span>
                <span className="text-sm font-medium">{match.players?.[1]?.name}</span>
            </div>
        </div>
    );
}
