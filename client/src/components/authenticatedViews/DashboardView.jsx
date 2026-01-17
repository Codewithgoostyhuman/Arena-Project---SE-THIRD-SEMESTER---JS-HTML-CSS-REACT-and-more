import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth/AuthContext';
import { Gamepad2, Clock, Shield, Users, TrendingUp, Trophy, Calendar } from 'lucide-react';

// StatsCard Component
function StatsCard({ title, value, icon, loading }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    {loading ? (
                        <div className="h-9 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                    ) : (
                        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
                    )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// Main Dashboard View
export default function DashboardView() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        pendingUsers: 0,
        totalGames: 0,
        activeLeagues: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalTournaments: 0,
        activeTournaments: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentUser?.role === 'operator') {
            loadOperatorStats();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const loadOperatorStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:5000/api/operator/dashboard-stats', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch stats: ${response.statusText}`);
            }

            const data = await response.json();
            
            setStats({
                pendingUsers: data.pendingUsers || 0,
                totalGames: data.totalGames || 0,
                activeLeagues: data.activeLeagues || 0,
                totalUsers: data.totalUsers || 0,
                activeUsers: data.activeUsers || 0,
                totalTournaments: data.totalTournaments || 0,
                activeTournaments: data.activeTournaments || 0
            });
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Operator Dashboard
    if (currentUser?.role === 'operator') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Operator Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {currentUser.name}</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Error loading dashboard data</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                            <button 
                                onClick={loadOperatorStats}
                                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Pending Users"
                        value={stats.pendingUsers}
                        icon={<Clock className="h-8 w-8 text-yellow-600" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Games"
                        value={stats.totalGames}
                        icon={<Gamepad2 className="h-8 w-8 text-blue-600" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Active Leagues"
                        value={stats.activeLeagues}
                        icon={<Shield className="h-8 w-8 text-indigo-600" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<Users className="h-8 w-8 text-green-600" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Active Users"
                        value={stats.activeUsers}
                        icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Tournaments"
                        value={stats.totalTournaments}
                        icon={<Trophy className="h-8 w-8 text-orange-600" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Active Tournaments"
                        value={stats.activeTournaments}
                        icon={<Calendar className="h-8 w-8 text-red-600" />}
                        loading={loading}
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                            Manage Users
                        </button>
                        <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                            Manage Games
                        </button>
                        <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                            View Statistics
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Player Dashboard
    if (currentUser?.role === 'player') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Player Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {currentUser.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="My Tournaments"
                        value={0}
                        icon={<Trophy className="h-8 w-8 text-blue-600" />}
                        loading={false}
                    />
                    <StatsCard
                        title="My Leagues"
                        value={0}
                        icon={<Shield className="h-8 w-8 text-indigo-600" />}
                        loading={false}
                    />
                    <StatsCard
                        title="Matches Played"
                        value={0}
                        icon={<Gamepad2 className="h-8 w-8 text-green-600" />}
                        loading={false}
                    />
                </div>
            </div>
        );
    }
const [LeagueOwnerstats, setLeagueOwnerStats] = useState({
        leaguesCount: 0,
        tournamentsCount: 0,
        playersCount: 0,
        loading: true
    });

    useEffect(() => {
        fetchLeagueOwnerDashboardStats();
    }, []);

    const fetchLeagueOwnerDashboardStats = async () => {
        try {
            // Fetch leagues
            const leaguesResponse = await fetch('http://localhost:5000/api/leagues/my', {
                credentials: 'include'
            });
            const leagues = await leaguesResponse.json();

            // Calculate stats
            const leaguesCount = leagues.length;
            const tournamentsCount = leagues.reduce((sum, league) => 
                sum + (league.tournaments?.length || 0), 0
            );
            const playersCount = leagues.reduce((sum, league) => 
                sum + (league.players?.length || 0), 0
            );

            setLeagueOwnerStats({
                leaguesCount,
                tournamentsCount,
                playersCount,
                loading: false  
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };
    // League Owner Dashboard
    if (currentUser?.role === 'leagueOwner') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">League Owner Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {currentUser.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="My Leagues"
                        value={LeagueOwnerstats.leaguesCount}
                        icon={<Shield className="h-8 w-8 text-indigo-600" />}
                        loading={false}
                    />
                    <StatsCard
                    title={"My Tournaments"}
                    value={LeagueOwnerstats.tournamentsCount}
                    icon={<Shield className='h-8 w-8 text-indigo-600'/>}
                    loading={false}/>
                    {/* <StatsCard
                        title="Total Players"
                        value={0}
                        icon={<Users className="h-8 w-8 text-blue-600" />}
                        loading={false}
                    />
                    <StatsCard
                        title="Active Matches"
                        value={0}
                        icon={<Gamepad2 className="h-8 w-8 text-blue-600" />}
                        loading={false}
                    /> */}
                </div>
            </div>
        );
    }

    // Default/Fallback
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome to Arena ESports</p>
            </div>
        </div>
    );
}