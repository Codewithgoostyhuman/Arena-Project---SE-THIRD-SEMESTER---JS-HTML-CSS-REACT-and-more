import React, { useState, useEffect } from 'react';
import { PencilSimple, GameController, Calculator, UsersThree, CheckCircle, ArrowLeft, WarningCircle } from '@phosphor-icons/react';

export default function CreateLeagueView({ setCurrentView }) {
    const [games, setGames] = useState([]);
    const [ratingFormulas, setRatingFormulas] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        game: '',
        ratingFormula: '',
        maxPlayers: 64,
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            
            // Load games
            const gamesResponse = await fetch('http://localhost:5000/api/public/games', {
                credentials: 'include'
            });
            const gamesData = await gamesResponse.json();
            setGames(gamesData);
            
            // Load rating formulas
            const formulasResponse = await fetch('http://localhost:5000/api/rating-formulas', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const formulasData = await formulasResponse.json();
            setRatingFormulas(formulasData);
            
            // Set default rating formula if available
            if (formulasData.length > 0) {
                setFormData(prev => ({ ...prev, ratingFormula: formulasData[0]._id }));
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load games and rating formulas. Please try again.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.game) {
            alert('Please select a game');
            return;
        }
        
        if (!formData.ratingFormula) {
            alert('Please select a rating formula');
            return;
        }
        
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/leagues', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create league');
            }

            alert('League created successfully!');
            setCurrentView('my-leagues');
        } catch (error) {
            console.error('Error creating league:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
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
            <div className="fixed top-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-2xl px-4">
                 <button 
                    onClick={() => setCurrentView('my-leagues')}
                    className="mb-8 flex items-center text-slate-400 hover:text-white transition group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Leagues
                </button>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-slate-700/50 bg-slate-900/50">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">League</span></h1>
                        <p className="text-slate-400 mt-2">Set up a new competitive organization.</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span className="flex items-center gap-2"><PencilSimple className="text-indigo-400 w-3.5 h-3.5" /> League Name</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                                placeholder="e.g., Pro League Season 1"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Description
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[120px]"
                                placeholder="Describe your league..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <span className="flex items-center gap-2"><GameController className="text-green-400 w-3.5 h-3.5" /> Game</span>
                                </label>
                                <select
                                    required
                                    value={formData.game}
                                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">Select a game...</option>
                                    {games.map(g => (
                                        <option key={g._id} value={g._id} className="bg-slate-900 text-white">{g.name}</option>
                                    ))}
                                </select>
                                {games.length === 0 && (
                                    <p className="text-xs text-red-400 mt-2 flex items-center">
                                        <WarningCircle className="mr-1" /> No games available.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                   <span className="flex items-center gap-2"><Calculator className="text-purple-400 w-3.5 h-3.5" /> Rating Formula</span>
                                </label>
                                <select
                                    required
                                    value={formData.ratingFormula}
                                    onChange={(e) => setFormData({ ...formData, ratingFormula: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">Select formula...</option>
                                    {ratingFormulas.map(formula => (
                                        <option key={formula._id} value={formula._id} className="bg-slate-900 text-white">
                                            {formula.name || `Formula ${formula._id.substring(0, 8)}`}
                                        </option>
                                    ))}
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
                                max="256"
                                value={formData.maxPlayers}
                                onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 64 })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                            />
                            <p className="text-xs text-slate-500 mt-2">Maximum number of players allowed in this league</p>
                        </div>

                        <div className="pt-6 border-t border-slate-700/50 flex gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || games.length === 0 || ratingFormulas.length === 0}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 px-6 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle weight="bold" className="w-3.5 h-3.5" />
                                        Create League
                                    </>
                                )}
                            </button>
                        </div>

                        {(games.length === 0 || ratingFormulas.length === 0) && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg mt-4 flex items-center gap-2 text-sm">
                                <WarningCircle className="w-3.5 h-3.5 min-w-[14px]" />
                                <p>
                                    Missing configuration data. Please contact an operator to create games and rating formulas.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}