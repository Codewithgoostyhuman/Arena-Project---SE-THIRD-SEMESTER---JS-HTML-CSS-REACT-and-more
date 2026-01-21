import React, { useState, useEffect } from 'react';
import { Trophy, UsersThree, CalendarBlank, Plus, PencilSimple, Trash, WarningCircle } from '@phosphor-icons/react';
import { apiService } from '../../APIs/apiService';
import NavButton from '../navigation/navButton';

export default function LeagueOwnerView({ setCurrentView, setSelectedLeagueId }) {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyLeagues = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('http://localhost:5000/api/leagues/my', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error", errorText);
                throw new Error('Failed to fetch leagues');
            }

            const data = await response.json();
            setLeagues(data);
        } catch (error) {
            console.error('Error fetching leagues:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyLeagues();
    }, []);

    const handleDeleteLeague = async (leagueId) => {
        if (!confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/leagues/${leagueId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete league');
            }

            alert('League deleted successfully!');
            fetchMyLeagues(); // Refresh the list
        } catch (error) {
            console.error('Error deleting league:', error);
            alert('Failed to delete league: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold animate-pulse">Loading League Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 max-w-lg w-full text-center">
                    <WarningCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="font-bold text-red-400 mb-2">Error loading leagues</p>
                    <p className="text-sm text-red-300/70">{error}</p>
                    <button onClick={fetchMyLeagues} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-bold">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
             {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Leagues</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Manage your competitive leagues and organizations.</p>
                    </div>
                    <button
                        onClick={() => setCurrentView('create-league')}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center group"
                    >
                        <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" weight="bold" />
                        Create New League
                    </button>
                </div>

                {leagues.length === 0 ? (
                    <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 p-16 text-center">
                        <Trophy className="h-20 w-20 text-slate-600 mx-auto mb-6" weight="duotone" />
                        <h2 className="text-3xl font-black text-white mb-4">No Leagues Found</h2>
                        <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Start your own league to organize tournaments and build a community.</p>
                        <button
                            onClick={() => setCurrentView('create-league')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all"
                        >
                            Create League
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leagues.map((league) => (
                            <div key={league._id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                         <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border mb-2 ${
                                            league.status === 'active' 
                                                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                                : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                        }`}>
                                            {league.status}
                                        </span>
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight line-clamp-1">{league.name}</h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600 group-hover:border-indigo-500/50 transition-colors">
                                        <Trophy className="h-5 w-5 text-indigo-400" weight="fill" />
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                                    {league.description || 'No description provided'}
                                </p>

                                <div className="space-y-3 mb-6 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-slate-400">
                                            <UsersThree className="h-4 w-4 mr-2 text-blue-400" weight="duotone" />
                                            <span>Players</span>
                                        </div>
                                        <span className="font-bold text-white">{league.players?.length || 0} / {league.maxPlayers}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-slate-400">
                                            <Trophy className="h-4 w-4 mr-2 text-purple-400" weight="duotone" />
                                            <span>Tournaments</span>
                                        </div>
                                        <span className="font-bold text-white">{league.tournaments?.length || 0}</span>
                                    </div>
                                    {league.game?.name && (
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center text-slate-400">
                                                <CalendarBlank className="h-4 w-4 mr-2 text-green-400" weight="duotone" />
                                                <span>Game</span>
                                            </div>
                                            <span className="font-bold text-white">{league.game.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {setCurrentView('create-tournament'); setSelectedLeagueId(league._id)}}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl transition font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center"
                                    >
                                        <Plus className="mr-1 h-3 w-3" weight="bold"/>
                                        Event
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteLeague(league._id)}
                                        className="p-2.5 border border-red-500/30 text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition"
                                        title="Delete League"
                                    >
                                        <Trash className="h-5 w-5" weight="duotone" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}