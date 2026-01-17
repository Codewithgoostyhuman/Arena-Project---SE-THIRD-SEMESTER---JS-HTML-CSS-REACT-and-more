import React, { useState, useEffect } from 'react';
import { Trophy, Gamepad2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { apiService } from '../../APIs/apiService';

export default function PlayerDashboard() {
    const [stats, setStats] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPlayerData();
    }, []);

    const loadPlayerData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [statsData, tournamentsData, matchesData] = await Promise.all([
                apiService.players.getStats(),
                apiService.players.getMyTournaments(),
                apiService.players.getUpcomingMatches(),
            ]);
            
            console.log('Stats loaded:', statsData);
            console.log('Tournaments loaded:', tournamentsData);
            console.log('Matches loaded:', matchesData);
            
            setStats(statsData);
            setTournaments(tournamentsData);
            setMatches(matchesData);
        } catch (error) {
            console.error('Failed to load player data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error loading dashboard: {error}</span>
                </div>
                <button 
                    onClick={loadPlayerData}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Win Rate"
                    value={stats?.winRate || '0%'}
                    icon={<Trophy className="h-8 w-8 text-green-600" />}
                    color="green"
                />
                <StatsCard
                    title="Total Matches"
                    value={stats?.totalGames || 0}
                    subtitle={`${stats?.wins || 0}W - ${stats?.losses || 0}L - ${stats?.draws || 0}D`}
                    icon={<Gamepad2 className="h-8 w-8 text-blue-600" />}
                    color="blue"
                />
                <StatsCard
                    title="Active Tournaments"
                    value={tournaments.length}
                    icon={<Calendar className="h-8 w-8 text-purple-600" />}
                    color="purple"
                />
                <StatsCard
                    title="Total Points"
                    value={stats?.points || 0}
                    icon={<TrendingUp className="h-8 w-8 text-orange-600" />}
                    color="orange"
                />
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">My Leagues</h3>
                    <p className="text-3xl font-bold text-indigo-600">
                        {stats?.leaguesCount || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Pending Applications</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        {stats?.pendingApplications || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Upcoming Matches</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {matches.length}
                    </p>
                </div>
            </div>

            {/* Upcoming Matches */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
                {matches.length === 0 ? (
                    <p className="text-gray-600">No upcoming matches</p>
                ) : (
                    <div className="space-y-4">
                        {matches.slice(0, 5).map(match => (
                            <div 
                                key={match._id} 
                                className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-lg">
                                            {match.tournament?.name || 'Tournament Match'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {match.game?.name || 'Game'} • {' '}
                                            {new Date(match.scheduledTime || match.createdAt).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Status: {match.status}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                        {match.round ? `Round ${match.round}` : 'Match'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Reusable Stats Card Component
function StatsCard({ title, value, subtitle, icon, color = 'indigo' }) {
    const colorClasses = {
        green: 'bg-green-50 border-green-200',
        blue: 'bg-blue-50 border-blue-200',
        purple: 'bg-purple-50 border-purple-200',
        orange: 'bg-orange-50 border-orange-200',
        indigo: 'bg-indigo-50 border-indigo-200',
    };

    return (
        <div className={`${colorClasses[color]} border rounded-lg p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                {icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
        </div>
    );
}