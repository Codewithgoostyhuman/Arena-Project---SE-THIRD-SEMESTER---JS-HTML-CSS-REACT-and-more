import React, { useState, useEffect } from 'react';
import { PencilSimple, Trophy, UsersThree, CalendarBlank, CheckCircle, ArrowLeft, WarningCircle, TreeStructure } from '@phosphor-icons/react';

export default function CreateTournamentView({ setCurrentView, leagueId }) {
    const [leagues, setLeagues] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        league: leagueId || '',
        style: 'RoundRobin',
        maxPlayers: 16,
        applicationStartDate: '',
        applicationEndDate: '',
        playStartDate: '',
        playEndDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [loadingLeagues, setLoadingLeagues] = useState(true);

    useEffect(() => {
        loadLeagues();
    }, []);

    const loadLeagues = async () => {
        try {
            setLoadingLeagues(true);
            const response = await fetch('http://localhost:5000/api/leagues/my', {
                credentials: 'include'
            });
            const data = await response.json();
            setLeagues(data);
            
            // If leagueId is provided, set it as default
            if (leagueId && !formData.league) {
                setFormData(prev => ({ ...prev, league: leagueId }));
            }
        } catch (error) {
            console.error('Failed to load leagues:', error);
            alert('Failed to load leagues. Please try again.');
        } finally {
            setLoadingLeagues(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.league) {
            alert('Please select a league');
            return;
        }

        // Validate dates
        const appStart = new Date(formData.applicationStartDate);
        const appEnd = new Date(formData.applicationEndDate);
        const playStart = new Date(formData.playStartDate);
        const playEnd = new Date(formData.playEndDate);

        if (appStart >= appEnd) {
            alert('Application end date must be after application start date');
            return;
        }

        if (playStart >= playEnd) {
            alert('Play end date must be after play start date');
            return;
        }

        if (appEnd >= playStart) {
            alert('Play start date must be after application end date');
            return;
        }
        
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/tournaments', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Server responded with:', data);
                throw new Error(data.message || 'Failed to create tournament');
            }

            alert('Tournament created successfully!');
            setCurrentView('my-leagues');
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingLeagues) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold animate-pulse">Loading Configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex items-center justify-center py-12">
             {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-3xl px-4">
                 <button 
                    onClick={() => setCurrentView('my-leagues')}
                    className="mb-8 flex items-center text-slate-400 hover:text-white transition group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-slate-700/50 bg-slate-900/50">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Tournament</span></h1>
                        <p className="text-slate-400 mt-2">Set up a new competitive event.</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <span className="flex items-center gap-2"><PencilSimple className="text-indigo-400 w-3.5 h-3.5" /> Tournament Name</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                                    placeholder="e.g., Spring Championship 2026"
                                />
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        <span className="flex items-center gap-2"><Trophy className="text-yellow-400 w-3.5 h-3.5" /> League</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.league}
                                        onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                        disabled={leagueId}
                                    >
                                        <option value="" className="bg-slate-900 text-slate-500">Select a league...</option>
                                        {leagues.map(league => (
                                            <option key={league._id} value={league._id} className="bg-slate-900 text-white">
                                                {league.name}
                                            </option>
                                        ))}
                                    </select>
                                    {leagues.length === 0 && (
                                        <p className="text-xs text-red-400 mt-2 flex items-center">
                                            <WarningCircle className="mr-1" /> No leagues available.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        <span className="flex items-center gap-2"><TreeStructure className="text-cyan-400 w-3.5 h-3.5" /> Tournament Style</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.style}
                                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                    >
                                        <option value="RoundRobin" className="bg-slate-900 text-white">Round Robin</option>
                                        <option value="DoubleRoundRobin" className="bg-slate-900 text-white">Double Round Robin</option>
                                        <option value="SingleElimination" className="bg-slate-900 text-white">Single Elimination</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <span className="flex items-center gap-2"><UsersThree className="text-blue-400 w-3.5 h-3.5" /> Max Players</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="2"
                                    max="128"
                                    value={formData.maxPlayers}
                                    onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 16 })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                />
                            </div>
                        </div>

                         {/* Schedule Grid */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Application Period */}
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <CalendarBlank className="text-indigo-400 w-5 h-5" /> Application Period
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.applicationStartDate}
                                            onChange={(e) => setFormData({ ...formData, applicationStartDate: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.applicationEndDate}
                                            onChange={(e) => setFormData({ ...formData, applicationEndDate: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                             {/* Play Period */}
                             <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <CalendarBlank className="text-green-400 w-5 h-5" /> Play Period
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.playStartDate}
                                            onChange={(e) => setFormData({ ...formData, playStartDate: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.playEndDate}
                                            onChange={(e) => setFormData({ ...formData, playEndDate: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="pt-6 border-t border-slate-700/50 flex gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || leagues.length === 0}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 px-6 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle weight="bold" className="w-3.5 h-3.5" />
                                        Create Tournament
                                    </>
                                )}
                            </button>
                        </div>

                         {leagues.length === 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg mt-4 flex items-center gap-2 text-sm">
                                <WarningCircle className="w-3.5 h-3.5 min-w-[14px]" />
                                <p>
                                    You need to create a league first before creating tournaments.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}