import React, { useState, useEffect } from 'react';
import { Trophy, UsersThree, CalendarBlank, Clock, Trash, Eye } from '@phosphor-icons/react';

export default function MyTournamentsView({ setCurrentView, setSelectedMatchId, setSelectedTournamentId }) {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyTournaments();
    }, []);

    const fetchMyTournaments = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('http://localhost:5000/api/tournaments/my', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error", errorText);
                throw new Error('Failed to fetch tournaments');
            }

            const data = await response.json();
            setTournaments(data);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTournament = async (tournamentId) => {
        if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete tournament');
            }

            alert('Tournament deleted successfully!');
            fetchMyTournaments();
        } catch (error) {
            console.error('Error deleting tournament:', error);
            alert('Failed to delete tournament: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'planning': 'bg-slate-700 text-slate-300 border-slate-600',
            'seeking_sponsors': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
            'open_for_applications': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            'upcoming': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            'ongoing': 'bg-green-500/10 text-green-400 border-green-500/30',
            'finished': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
            'archived': 'bg-gray-800 text-gray-500 border-gray-700'
        };
        return colors[status] || 'bg-slate-700 text-slate-300';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const groupTournamentsByLeague = () => {
        const grouped = {};
        tournaments.forEach(tournament => {
            const leagueId = tournament.league?._id || 'unknown';
            if (!grouped[leagueId]) {
                grouped[leagueId] = {
                    league: tournament.league,
                    tournaments: []
                };
            }
            grouped[leagueId].tournaments.push(tournament);
        });
        return Object.values(grouped);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold animate-pulse">Loading Your Tournaments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 max-w-lg w-full text-center">
                    <p className="font-bold text-red-400 mb-2">Error loading tournaments</p>
                    <p className="text-sm text-red-300/70">{error}</p>
                    <button onClick={fetchMyTournaments} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg">Retry</button>
                </div>
            </div>
        );
    }

    const groupedTournaments = groupTournamentsByLeague();

    return (
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
             {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Tournaments</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Manage, edit, and track the tournaments under your leagues.</p>
                    </div>
                    <button
                        onClick={() => setCurrentView('my-leagues')}
                        className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-indigo-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center"
                    >
                        <Trophy className="mr-2 w-5 h-5"/>
                        Back to Leagues
                    </button>
                </div>

                {tournaments.length === 0 ? (
                    <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 p-16 text-center">
                        <Trophy className="h-20 w-20 text-slate-600 mx-auto mb-6" weight="duotone" />
                        <h2 className="text-3xl font-black text-white mb-4">No Tournaments Yet</h2>
                        <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Create tournaments directly from your league dashboard to start organizing competitions.</p>
                        <button
                            onClick={() => setCurrentView('my-leagues')}
                             className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
                        >
                            Go to My Leagues
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {groupedTournaments.map((group, idx) => (
                            <div key={idx} className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
                                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-700/50">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <Trophy className="h-6 w-6 text-indigo-400" weight="fill" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                                            {group.league?.name || 'Unknown League'}
                                        </h2>
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                            {group.tournaments.length} tournament{group.tournaments.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {group.tournaments.map((tournament) => (
                                        <div key={tournament._id} className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] group relative overflow-hidden">
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                     <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border mb-2 ${getStatusColor(tournament.status)}`}>
                                                        {tournament.status.replace(/_/g, ' ')}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">
                                                        {tournament.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6 text-sm">
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <UsersThree className="h-4 w-4 text-blue-400 shrink-0" weight="duotone" />
                                                    <span><span className="text-white font-bold">{tournament.players?.length || 0}</span> / {tournament.maxPlayers} Players</span>
                                                </div>

                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <Trophy className="h-4 w-4 text-purple-400 shrink-0" weight="duotone" />
                                                    <span className="capitalize">{tournament.style}</span>
                                                </div>

                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <CalendarBlank className="h-4 w-4 text-green-400 shrink-0" weight="duotone" />
                                                    <span>Starts: <span className="text-slate-200">{formatDate(tournament.playStartDate)}</span></span>
                                                </div>

                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <Clock className="h-4 w-4 text-orange-400 shrink-0" weight="duotone" />
                                                    <span>Ends: <span className="text-slate-200">{formatDate(tournament.applicationEndDate)}</span></span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTournamentId(tournament._id);
                                                        setCurrentView('manage-tournament');
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl transition text-sm font-bold shadow-lg hover:shadow-indigo-500/25"
                                                >
                                                    <Eye className="h-4 w-4" weight="bold" />
                                                    Manage
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTournament(tournament._id)}
                                                    className="p-2.5 border border-red-500/30 text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition"
                                                    title="Delete Tournament"
                                                >
                                                    <Trash className="h-5 w-5" weight="duotone" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}