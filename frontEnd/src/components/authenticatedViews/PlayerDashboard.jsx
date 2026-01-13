import React, { useState, useEffect } from 'react';
import { Trophy, Gamepad2, Calendar } from 'lucide-react';
import { apiService } from '../../APIs/apiService';
import StatsCard from '../reuseableComponents/StatsCard';
export default function PlayerDashboard() {
    const [stats, setStats] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        loadPlayerData();
    }, []);

    const loadPlayerData = async () => {
        try {
            const [statsData, tournamentsData, matchesData] = await Promise.all([
                apiService.players.getStats(),
                apiService.players.getMyTournaments(),
                apiService.players.getMyMatches(),
            ]);
            setStats(statsData);
            setTournaments(tournamentsData);
            setMatches(matchesData);
        } catch (error) {
            console.error('Failed to load player data:', error);
        }
    };

    return (
        <>
            <StatsCard
                title="Win Rate"
                value={stats?.winRate || '0%'}
                icon={<Trophy className="h-8 w-8 text-green-600" />}
            />
            <StatsCard
                title="Total Matches"
                value={stats?.wins + stats?.losses + stats?.draws || 0}
                icon={<Gamepad2 className="h-8 w-8 text-blue-600" />}
            />
            <StatsCard
                title="Active Tournaments"
                value={tournaments.length}
                icon={<Calendar className="h-8 w-8 text-purple-600" />}
            />

            <div className="md:col-span-2 lg:col-span-3">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
                    {matches.length === 0 ? (
                        <p className="text-gray-600">No upcoming matches</p>
                    ) : (
                        <div className="space-y-4">
                            {matches.slice(0, 3).map(match => (
                                <div key={match._id} className="border-l-4 border-indigo-500 pl-4 py-2">
                                    <p className="font-semibold">{match.tournament?.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {match.game?.name} • {new Date(match.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}