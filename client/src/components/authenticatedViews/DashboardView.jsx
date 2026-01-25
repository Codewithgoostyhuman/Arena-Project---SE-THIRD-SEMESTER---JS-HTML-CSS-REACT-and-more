import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Auth/AuthContext';
import { GameController, Clock, ShieldCheck, UsersThree, TrendUp, Trophy, CalendarBlank, ChartBar, Envelope, ClipboardText, Star } from "@phosphor-icons/react";
import MatchCard from '../reuseableComponents/MatchCard';
import { apiService } from '../../APIs/apiService';

// StatsCard Component
// StatsCard Component with Glassmorphism
function StatsCard({ title, value, icon, loading }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 group relative overflow-hidden">
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
                    {loading ? (
                        <div className="h-9 w-24 bg-slate-700/50 animate-pulse rounded-lg mt-2"></div>
                    ) : (
                        <p className="text-3xl font-black text-white mt-1 tracking-tight">{value}</p>
                    )}
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// Main Dashboard View
export default function DashboardView({ setCurrentView, setSelectedMatchId }) {
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
    const [matches, setMatches] = useState([]); // NEW: Store matches
    const [matchesLoading, setMatchesLoading] = useState(false); // NEW: Matches loading state

    useEffect(() => {
        if (currentUser?.role === 'operator') {
            loadOperatorStats();
        } else if (currentUser?.role === 'player') {
            loadPlayerMatches(); // NEW: Load player matches
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

    // NEW: Load player matches
    const loadPlayerMatches = async () => {
        try {
            setMatchesLoading(true);
            const response = await fetch('http://localhost:5000/api/matches/my-matches', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMatches(data.matches || []);
            }
        } catch (error) {
            console.error('Failed to load matches:', error);
        } finally {
            setMatchesLoading(false);
            setLoading(false);
        }
    };

    // Operator Dashboard
    if (currentUser?.role === 'operator') {
        return (
            <div className="min-h-screen bg-slate-900 text-white pb-12 relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }}
                />
                
                {/* Ambient Glow */}
                <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                            System Command
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                            Operator <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Dashboard</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Welcome back, Commander {currentUser.name}</p>
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
                        icon={<Clock className="h-8 w-8 text-yellow-600" weight="duotone" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Games"
                        value={stats.totalGames}
                        icon={<GameController className="h-8 w-8 text-blue-600" weight="duotone" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Active Leagues"
                        value={stats.activeLeagues}
                        icon={<ShieldCheck className="h-8 w-8 text-indigo-600" weight="duotone" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<UsersThree className="h-8 w-8 text-green-600" weight="duotone" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Active Users"
                        value={stats.activeUsers}
                        icon={<TrendUp className="h-8 w-8 text-purple-600" weight="duotone" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Total Tournaments"
                        value={stats.totalTournaments}
                        icon={<Trophy className="h-8 w-8 text-orange-600" weight="duotone" />}
                        loading={loading}
                    />
                    <StatsCard
                        title="Active Tournaments"
                        value={stats.activeTournaments}
                        icon={<CalendarBlank className="h-8 w-8 text-red-600" weight="duotone" />}
                        loading={loading}
                    />
                </div>

                {/* Quick Actions */}
                {/* Quick Actions */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                        <span className="w-1 h-6 bg-indigo-500 mr-3 rounded-full"></span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => setCurrentView('manage-users')}
                            className="group relative px-4 py-4 bg-slate-900/50 hover:bg-indigo-600/20 border border-slate-600 hover:border-indigo-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <UsersThree className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" weight="duotone" />
                                Manage Users
                            </span>
                        </button>
                        <button 
                            onClick={() => setCurrentView('manage-games')}
                            className="group relative px-4 py-4 bg-slate-900/50 hover:bg-blue-600/20 border border-slate-600 hover:border-blue-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                        >
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <GameController className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" weight="duotone" />
                                Manage Games
                            </span>
                        </button>
                        <button 
                            onClick={() => setCurrentView('manage-rating-formulas')}
                            className="group relative px-4 py-4 bg-slate-900/50 hover:bg-green-600/20 border border-slate-600 hover:border-green-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                        >
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5 text-green-400 group-hover:text-white transition-colors" weight="duotone" />
                                Manage Ratings
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    }

    // Player Dashboard
    const [playerStats, setPlayerStats] = useState(null);
    const [playerStatsLoading, setPlayerStatsLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.role === 'player') {
            fetchPlayerDashboardData();
        }
    }, [currentUser]);

    const fetchPlayerDashboardData = async () => {
        try {
            setPlayerStatsLoading(true);
            const [statsRes, matchesRes] = await Promise.all([
                fetch('http://localhost:5000/api/players/stats', { credentials: 'include' }),
                fetch('http://localhost:5000/api/matches/my-matches', { credentials: 'include' })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setPlayerStats(statsData);
            }

            if (matchesRes.ok) {
                const matchesData = await matchesRes.json();
                setMatches(matchesData.matches || []);
            }
        } catch (error) {
            console.error('Failed to load player data:', error);
        } finally {
            setPlayerStatsLoading(false);
            setMatchesLoading(false);
        }
    };

    if (currentUser?.role === 'player') {
        return (
            <div className="min-h-screen bg-slate-900 text-white pb-12 relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }}
                />
                <div className="fixed top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     <div className="mb-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold tracking-widest uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                            Player Terminal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                            Player <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Dashboard</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Welcome back, {currentUser.name}</p>
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatsCard
                        title="Total Points"
                        value={playerStats?.points || 0}
                        icon={<Star className="h-8 w-8 text-yellow-400" weight="duotone" />}
                        loading={playerStatsLoading}
                    />
                    <StatsCard
                        title="Matches Played"
                        value={playerStats?.finishedMatches || 0}
                        icon={<GameController className="h-8 w-8 text-blue-600" weight="duotone" />}
                        loading={playerStatsLoading}
                    />
                    <StatsCard
                        title="To Be Played"
                        value={playerStats?.upcomingMatchesCount || 0}
                        icon={<CalendarBlank className="h-8 w-8 text-purple-600" weight="duotone" />}
                        loading={playerStatsLoading}
                    />
                    <StatsCard
                        title="Active Leagues"
                        value={playerStats?.leaguesCount || 0}
                        icon={<ShieldCheck className="h-8 w-8 text-indigo-600" weight="duotone" />}
                        loading={playerStatsLoading}
                    />
                    <StatsCard
                        title="Tournaments"
                        value={playerStats?.tournamentsCount || 0}
                        icon={<Trophy className="h-8 w-8 text-orange-600" weight="duotone" />}
                        loading={playerStatsLoading}
                    />
                </div>

                {/* Win/Loss/Draw Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm flex flex-col items-center hover:bg-green-500/20 transition-colors">
                        <span className="text-green-400 font-bold uppercase tracking-wider text-sm mb-1">Wins</span>
                        {playerStatsLoading ? (
                            <div className="h-8 w-16 bg-slate-700 animate-pulse rounded"></div>
                        ) : (
                            <span className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">{playerStats?.wins || 0}</span>
                        )}
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm flex flex-col items-center hover:bg-red-500/20 transition-colors">
                        <span className="text-red-400 font-bold uppercase tracking-wider text-sm mb-1">Losses</span>
                        {playerStatsLoading ? (
                            <div className="h-8 w-16 bg-slate-700 animate-pulse rounded"></div>
                        ) : (
                            <span className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">{playerStats?.losses || 0}</span>
                        )}
                    </div>
                    <div className="bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm flex flex-col items-center hover:bg-slate-700/50 transition-colors">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-1">Draws</span>
                        {playerStatsLoading ? (
                            <div className="h-8 w-16 bg-slate-700 animate-pulse rounded"></div>
                        ) : (
                            <span className="text-5xl font-black text-white">{playerStats?.draws || 0}</span>
                        )}
                    </div>
                </div>

                {/* My Matches Section */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                        <span className="w-1 h-6 bg-purple-500 mr-3 rounded-full"></span>
                        My Matches
                    </h2>
                    {matchesLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                             <GameController className="w-12 h-12 mx-auto mb-3 opacity-20" weight="duotone" />
                            No matches yet. Join a tournament to start playing!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matches.slice(0, 6).map((match) => (
                                <MatchCard
                                    key={match._id}
                                    match={match}
                                    setCurrentView={setCurrentView}
                                    setSelectedMatchId={setSelectedMatchId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    }

    // League Owner Dashboard
    const [LeagueOwnerstats, setLeagueOwnerStats] = useState({
        leaguesCount: 0,
        tournamentsCount: 0,
        playersCount: 0,
        loading: true
    });

    useEffect(() => {
        if (currentUser?.role === 'leagueOwner') {
            fetchLeagueOwnerDashboardStats();
        }
    }, [currentUser]);

    const fetchLeagueOwnerDashboardStats = async () => {
        try {
            const leaguesResponse = await fetch('http://localhost:5000/api/leagues/my', {
                credentials: 'include'
            });
            const leagues = await leaguesResponse.json();

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
            setLeagueOwnerStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (currentUser?.role === 'leagueOwner') {
        return (
             <div className="min-h-screen bg-slate-900 text-white pb-12 relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }}
                />
                
                <div className="fixed top-0 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-10">
                         <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-bold tracking-widest uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            League Management
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                            League <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Owner</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Welcome back, {currentUser.name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            title="My Leagues"
                            value={LeagueOwnerstats.leaguesCount}
                            icon={<ShieldCheck className="h-8 w-8 text-indigo-400" weight="duotone" />}
                            loading={LeagueOwnerstats.loading}
                        />
                        <StatsCard
                            title="My Tournaments"
                            value={LeagueOwnerstats.tournamentsCount}
                            icon={<Trophy className="h-8 w-8 text-blue-400" weight="duotone" />}
                            loading={LeagueOwnerstats.loading}
                        />
                        <StatsCard
                            title="Total Players"
                            value={LeagueOwnerstats.playersCount}
                            icon={<UsersThree className="h-8 w-8 text-green-400" weight="duotone" />}
                            loading={LeagueOwnerstats.loading}
                        />
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl mt-8">
                        <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                            <span className="w-1 h-6 bg-green-500 mr-3 rounded-full"></span>
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setCurrentView('my-leagues')}
                                className="group relative px-4 py-4 bg-slate-900/50 hover:bg-green-600/20 border border-slate-600 hover:border-green-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <ShieldCheck size={20} className="text-green-400" /> My Leagues
                                </span>
                            </button>
                            <button 
                                onClick={() => setCurrentView('my-tournaments')}
                                className="group relative px-4 py-4 bg-slate-900/50 hover:bg-blue-600/20 border border-slate-600 hover:border-blue-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Trophy size={20} className="text-blue-400" /> My Tournaments
                                </span>
                            </button>
                            <button 
                                onClick={() => setCurrentView('create-league')}
                                className="group relative px-4 py-4 bg-slate-900/50 hover:bg-indigo-600/20 border border-slate-600 hover:border-indigo-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <ShieldCheck size={20} className="text-indigo-400" /> Create League
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Advertiser Dashboard Logic
    const [advertiserStats, setAdvertiserStats] = useState({
        totalSponsored: 0,
        pendingRequests: 0,
        balance: 0
    });
    const [advertiserLoading, setAdvertiserLoading] = useState(true);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [showManageAds, setShowManageAds] = useState(false);
    const [showSponsorModal, setShowSponsorModal] = useState(false); // NEW
    const [fundsAmount, setFundsAmount] = useState('');
    const [adsList, setAdsList] = useState([]);
    const [newAd, setNewAd] = useState({ title: '', content: '', fee: 100, image: null }); // Added image
    const [tournaments, setTournaments] = useState([]); // For Sponsor Modal
    const [sponsorshipAmount, setSponsorshipAmount] = useState('');
    const [selectedTournamentId, setSelectedTournamentId] = useState(null);
    const [sponsorshipType, setSponsorshipType] = useState('perUnit');
    const [marketInsights, setMarketInsights] = useState(null);
    const [sponsorshipRequests, setSponsorshipRequests] = useState([]);

    const [myAdvertiserId, setMyAdvertiserId] = useState(null);
    const [adPreview, setAdPreview] = useState(null); // Added for image preview

    useEffect(() => {
        if (currentUser?.role === 'advertiser') {
            fetchAdvertiserDashboardData();
        }
    }, [currentUser]);

    const fetchAdvertiserDashboardData = async () => {
        try {
            setAdvertiserLoading(true);
            const [meData, dashboardData, balanceData, reportData] = await Promise.all([
                apiService.advertisers.getMe(),
                apiService.advertisers.getDashboard(),
                apiService.advertisers.getBalance(),
                apiService.surveys.getReport()
            ]);

            // Robustly find advertiser ID
            const profileId = meData?.advertiserProfile?._id || meData?._id;
            if (profileId) {
                setMyAdvertiserId(profileId);
                setSponsorshipRequests(dashboardData.advertiser?.sponsorshipRequests || []);
            } else if (currentUser?.role === 'advertiser' && currentUser?.id) {
                // Fallback to current user ID if profile ID isn't found (they might be the same in some contexts)
                setMyAdvertiserId(currentUser.id);
            }
            
            setAdvertiserStats({
                totalSponsored: dashboardData.totalSponsored || 0,
                pendingRequests: dashboardData.pendingRequests || 0,
                balance: balanceData.balance || 0
            });
            setMarketInsights(reportData);
        } catch (error) {
            console.error('Failed to load advertiser data:', error);
        } finally {
            setAdvertiserLoading(false);
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/advertisers/me/funds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(fundsAmount) }),
                credentials: 'include'
            });
            if (res.ok) {
                fetchAdvertiserDashboardData();
                setShowAddFunds(false);
                setFundsAmount('');
                alert("Funds added successfully!");
            } else {
                alert("Failed to add funds. Ensure amount is valid.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadAds = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/advertisers/me/ads', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setAdsList(data);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (showManageAds) {
            loadAds();
        }
    }, [showManageAds]);

    const handleUploadAd = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newAd.title);
            formData.append('content', newAd.content);
            formData.append('fee', newAd.fee);
            if (newAd.image) {
                formData.append('image', newAd.image);
            }

            const res = await fetch('http://localhost:5000/api/advertisers/me/ads', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (res.ok) {
                loadAds();
                setNewAd({ title: '', content: '', fee: 100, image: null });
                setAdPreview(null);
                alert("Advertisement Uploaded!");
            } else {
                const errData = await res.json();
                alert(`Failed to upload ad: ${errData.error || 'Unknown error'}`);
            }
        } catch (err) { console.error(err); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAd({ ...newAd, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const loadTournaments = async () => {
        try {
            const data = await apiService.tournaments.getSponsorable();
            setTournaments(data || []);
        } catch (err) { 
            console.error(err);
            setTournaments([]);
        }
    };

    useEffect(() => {
        if (showSponsorModal) {
            loadTournaments();
        }
    }, [showSponsorModal]);

    const submitSponsorship = async (e) => {
        e.preventDefault();
        if (!selectedTournamentId || !myAdvertiserId) {
            alert("Identification error. Please refresh.");
            return;
        }

        try {
            await apiService.advertisers.addSponsorshipRequest(myAdvertiserId, {
                tournamentId: selectedTournamentId,
                proposedAmount: Number(sponsorshipAmount),
                type: sponsorshipType
            });

            alert("Sponsorship Request Submitted!");
            setShowSponsorModal(false);
            setSponsorshipAmount('');
            setSponsorshipType('perUnit');
            setSelectedTournamentId(null);
            fetchAdvertiserDashboardData();
        } catch (err) { 
            console.error(err);
            alert(`Failed: ${err.message}`);
        }
    };



    if (currentUser?.role === 'advertiser') {
        return (
            <div className="min-h-screen bg-slate-900 text-white pb-12 relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }}
                />
                 <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     <div className="mb-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold tracking-widest uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                            Ad Manager
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                            Advertiser <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Hub</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Welcome back, {currentUser.name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatsCard
                            title="Current Balance"
                            value={`$${advertiserStats.balance.toFixed(2)}`}
                            icon={<Trophy className="h-8 w-8 text-green-400" weight="duotone" />}
                            loading={advertiserLoading}
                        />
                        <StatsCard
                            title="Sponsored Tournaments"
                            value={advertiserStats.totalSponsored}
                            icon={<Trophy className="h-8 w-8 text-blue-400" weight="duotone" />}
                            loading={advertiserLoading}
                        />
                        <StatsCard
                            title="Pending Requests"
                            value={advertiserStats.pendingRequests}
                            icon={<Clock className="h-8 w-8 text-yellow-400" weight="duotone" />}
                            loading={advertiserLoading}
                        />
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl mb-8">
                        <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                            <span className="w-1 h-6 bg-cyan-500 mr-3 rounded-full"></span>
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setShowSponsorModal(true)}
                                className="group relative px-4 py-4 bg-slate-900/50 hover:bg-indigo-600/20 border border-slate-600 hover:border-indigo-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Trophy size={20} /> Sponsor New Tournament
                                </span>
                            </button>
                            <button 
                                onClick={() => setShowManageAds(true)}
                                className="group relative px-4 py-4 bg-slate-900/50 hover:bg-blue-600/20 border border-slate-600 hover:border-blue-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <ChartBar size={20} /> Manage Advertisements
                                </span>
                            </button>
                            <button 
                                onClick={() => setShowAddFunds(true)}
                                className="group relative px-4 py-4 bg-slate-900/50 hover:bg-green-600/20 border border-slate-600 hover:border-green-500/50 text-white rounded-xl transition-all duration-300 font-bold overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Trophy size={20} /> Add Funds
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Sponsorship Requests Table */}
                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl mb-8">
                        <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                            <span className="w-1 h-6 bg-indigo-500 mr-3 rounded-full"></span>
                            Recent Sponsorship Requests
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3">Tournament</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {sponsorshipRequests.map((req, idx) => (
                                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-4 font-medium">{req.tournament?.name || 'Unknown Tournament'}</td>
                                            <td className="px-4 py-4 uppercase text-xs">
                                                <span className={`px-2 py-1 rounded ${req.type === 'exclusive' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                                    {req.type || 'perUnit'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-mono">${req.proposedAmount?.toFixed(2)}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    req.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                                    req.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                    {req.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {sponsorshipRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-slate-500 italic">No sponsorship requests yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Market Insights / Survey Data */}
                    {marketInsights && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl">
                                <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                                    <span className="w-1 h-6 bg-purple-500 mr-3 rounded-full"></span>
                                    Popular Games (Market Data)
                                </h2>
                                <div className="space-y-4">
                                    {marketInsights.gameInterests?.slice(0, 5).map((interest, idx) => (
                                        <div key={idx} className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between text-xs uppercase font-bold text-slate-400">
                                                <span>Game ID: {interest._id}</span>
                                                <span>{interest.count} Users</span>
                                            </div>
                                            <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-900 border border-slate-700">
                                                <div 
                                                    style={{ width: `${(interest.count / advertiserStats.totalSponsored || 1) * 10}%` }} 
                                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl">
                                <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                                    <span className="w-1 h-6 bg-pink-500 mr-3 rounded-full"></span>
                                    General Interests
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {marketInsights.generalInterests?.map((interest, idx) => (
                                        <div key={idx} className="px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-300 text-sm font-bold">
                                            {interest._id}: <span className="text-white ml-1">{interest.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                {/* Add Funds Modal */}
                {showAddFunds && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center">
                                <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
                                Add Funds
                            </h3>
                            <form onSubmit={handleAddFunds}>
                                <div className="mb-6">
                                    <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Amount ($)</label>
                                    <input 
                                        type="number" 
                                        value={fundsAmount} 
                                        onChange={(e) => setFundsAmount(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-mono text-lg"
                                        min="1"
                                        required
                                        placeholder="100.00"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddFunds(false)}
                                        className="px-6 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                                    >
                                        Confirm Deposit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Manage Ads Modal */}
                {showManageAds && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                       <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                            <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-800 z-10 pb-4 border-b border-slate-700/50">
                                <h3 className="text-2xl font-black text-white flex items-center">
                                    <span className="w-1 h-8 bg-blue-500 mr-3 rounded-full"></span>
                                    Manage Advertisements
                                </h3>
                                <button 
                                    onClick={() => setShowManageAds(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Create Ad Form */}
                            <div className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                                <h4 className="font-bold text-lg text-white mb-4">Create New Ad</h4>
                                <form onSubmit={handleUploadAd} className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Title</label>
                                        <input 
                                            type="text" 
                                            value={newAd.title}
                                            onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
                                            placeholder="Ad Campaign Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Text/Description</label>
                                        <input 
                                            type="text" 
                                            value={newAd.content}
                                            onChange={(e) => setNewAd({...newAd, content: e.target.value})}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
                                            placeholder="Promotional text shown to users"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Image Banner</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="flex-1 text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-all cursor-pointer"
                                                required
                                            />
                                            {adPreview && (
                                                <div className="w-16 h-16 rounded-xl border border-slate-600 overflow-hidden shrink-0">
                                                    <img src={adPreview} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all mt-2"
                                    >
                                        Upload Campaign
                                    </button>
                                </form>
                            </div>

                            {/* Current Ads List */}
                            <div>
                                <h4 className="font-semibold mb-3">Your Advertisements</h4>
                                {adsList.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No advertisements yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {adsList.map((ad, idx) => (
                                            <div key={idx} className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 group transition-all hover:border-blue-500/30">
                                                {(ad.imageUrl || (ad.content && ad.content.startsWith('/uploads'))) && (
                                                    <img 
                                                        src={`http://localhost:5000${ad.imageUrl || ad.content}`} 
                                                        alt={ad.title} 
                                                        className="w-16 h-16 object-cover rounded-xl border border-slate-700"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white truncate text-lg uppercase tracking-tight">{ad.title}</p>
                                                    <p className="text-sm text-slate-400 line-clamp-1">{ad.content}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-tighter border border-blue-500/20 rounded">
                                                            {ad.type}
                                                        </span>
                                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            {ad.impressions || 0}
                                                        </span>
                                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                                                            {ad.clicks || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sponsor Tournament Modal */}
                {showSponsorModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Sponsor a Tournament</h3>
                                <button 
                                    onClick={() => setShowSponsorModal(false)}
                                    className="text-slate-400 hover:text-white transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Tournaments List */}
                            <div className="space-y-4">
                                {tournaments.map(t => (
                                    <div 
                                        key={t._id} 
                                        className={`border p-4 rounded-xl cursor-pointer transition-all ${
                                            selectedTournamentId === t._id 
                                            ? 'border-blue-500 bg-blue-500/10' 
                                            : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
                                        }`} 
                                        onClick={() => setSelectedTournamentId(t._id)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-white">{t.name}</h4>
                                                <p className="text-sm text-slate-400">Game: {t.league?.game?.name || 'Standard'}</p>
                                                <p className="text-sm text-slate-400">League: {t.league?.name}</p>
                                                <p className="text-sm text-slate-400">Status: {t.status}</p>
                                            </div>
                                            {selectedTournamentId === t._id && <div className="text-blue-400 font-bold">Selected</div>}
                                        </div>
                                    </div>
                                ))}
                                {tournaments.length === 0 && <p className="text-center text-slate-500">No tournaments available for sponsorship.</p>}
                            </div>

                            {/* Sponsorship Amount Form */}
                            {selectedTournamentId && (
                                <form onSubmit={submitSponsorship} className="mt-6 border-t border-slate-700 pt-4">
                                    <div className="mb-4">
                                        <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Sponsorship Type</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setSponsorshipType('perUnit')}
                                                className={`py-3 rounded-xl border font-bold transition-all ${sponsorshipType === 'perUnit' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-600 text-slate-400'}`}
                                            >
                                                Per-Unit
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setSponsorshipType('exclusive')}
                                                className={`py-3 rounded-xl border font-bold transition-all ${sponsorshipType === 'exclusive' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900/50 border-slate-600 text-slate-400'}`}
                                            >
                                                Exclusive
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 italic">
                                            {sponsorshipType === 'exclusive' 
                                                ? "Exclusive sponsors get 100% ad share for this tournament." 
                                                : "Per-unit sponsors share ad space based on contribution."}
                                        </p>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Proposed Amount ($)</label>
                                        <input 
                                            type="number" 
                                            value={sponsorshipAmount} 
                                            onChange={(e) => setSponsorshipAmount(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-lg"
                                            min="100"
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                                    >
                                        Confirm Sponsorship
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
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