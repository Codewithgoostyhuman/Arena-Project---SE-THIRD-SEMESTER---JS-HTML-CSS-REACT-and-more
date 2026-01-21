import React, { useState, useEffect } from 'react';
import { Plus, PencilSimple, Trash, X, ArrowsClockwise, GameController, UsersThree } from '@phosphor-icons/react';

// Create/Edit Game Form Component
function GameForm({ onSuccess, onCancel, existingGame = null }) {
    const [formData, setFormData] = useState({
        name: existingGame?.name || '',
        description: existingGame?.description || '',
        type: existingGame?.type || 'TicTacToe',
        minPlayers: existingGame?.minPlayers || 2,
        maxPlayers: existingGame?.maxPlayers || 2,
        rules: existingGame?.rules || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!formData.name || !formData.description || !formData.rules) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.minPlayers > formData.maxPlayers) {
            setError('Min players cannot be greater than max players');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const url = existingGame 
                ? `http://localhost:5000/api/operator/game/${existingGame._id}`
                : 'http://localhost:5000/api/operator/game';
            
            const method = existingGame ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save game');
            }

            alert(`Game ${existingGame ? 'updated' : 'created'} successfully!`);
            onSuccess();
        } catch (error) {
            console.error('Failed to save game:', error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-8 mb-8 relative overflow-hidden">
            {/* Decorative Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
                    {existingGame ? <PencilSimple className="mr-3 text-indigo-400" /> : <Plus className="mr-3 text-indigo-400" />}
                    {existingGame ? 'Edit Game Protocol' : 'Initialize New Game'}
                </h2>
                {onCancel && (
                    <button 
                        onClick={onCancel} 
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                    >
                        <X className="h-6 w-6" weight="bold" />
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center">
                    <X className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Game Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                        placeholder="e.g., NEON OVERDRIVE"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        System Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                        rows="3"
                        placeholder="Brief description of the game protocols..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Core Engine (Type) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                             className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                        >
                            <option value="TicTacToe">Tic Tac Toe</option>
                            <option value="RockPaperScissors">Rock Paper Scissors</option>
                            <option value="NumberGuessDuel">Number Guess Duel</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                             <GameController weight="duotone" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Ruleset Configuration <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                         className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600 font-mono text-sm"
                        rows="4"
                        placeholder="> Initialize rule 1..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Min Players <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="2"
                            value={formData.minPlayers}
                            onChange={(e) => setFormData({ ...formData, minPlayers: parseInt(e.target.value) || 2 })}
                            className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 font-mono">FIXED: 2 PLAYERS</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Max Players <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="2"
                            value={formData.maxPlayers}
                            onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 2 })}
                             className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 font-mono">FIXED: 2 PLAYERS</p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Processing...' : (existingGame ? 'Update Protocol' : 'Initialize Game')}
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase tracking-wider transition-all"
                        >
                            Abort
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Main Manage Games View
export default function ManageGamesView() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingGame, setEditingGame] = useState(null);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:5000/api/operator/games', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load games');
            }

            const data = await response.json();
            const gamesData = Array.isArray(data) ? data : (data.games || []);
            setGames(gamesData);
        } catch (error) {
            console.error('Failed to load games:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (gameId) => {
        if (!window.confirm('Are you sure you want to delete this game?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/operator/game/${gameId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete game');
            }

            alert('Game deleted successfully');
            loadGames();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingGame(null);
        loadGames();
    };

    const handleEdit = (game) => {
        setEditingGame(game);
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold animate-pulse">Loading Game Protocols...</p>
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
            <div className="fixed top-20 right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Games</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Configure and manage active game protocols.</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingGame(null);
                        }}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center group"
                    >
                        <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" weight="bold" />
                        {showForm ? 'Close Editor' : 'Initialize New Game'}
                    </button>
                </div>

                {error && (
                    <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl flex items-center justify-between backdrop-blur-sm">
                        <div className="flex items-center">
                             <X className="w-5 h-5 mr-3" />
                            <div>
                                <p className="font-bold">System Error</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        </div>
                        <button 
                            onClick={loadGames}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-bold transition"
                        >
                            <ArrowsClockwise className="h-4 w-4" weight="bold" />
                            Retry
                        </button>
                    </div>
                )}

                {showForm && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <GameForm 
                            existingGame={editingGame}
                            onSuccess={handleFormSuccess} 
                            onCancel={() => {
                                setShowForm(false);
                                setEditingGame(null);
                            }}
                        />
                    </div>
                )}

                {games.length === 0 ? (
                    <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 p-16 text-center">
                        <GameController className="h-20 w-20 text-slate-600 mx-auto mb-6" weight="duotone" />
                        <h2 className="text-3xl font-black text-white mb-4">No Games Active</h2>
                        <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Initialize a new game protocol to begin system operations.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/50 rounded-xl font-bold uppercase tracking-wider transition-all"
                        >
                            <Plus className="h-5 w-5 mr-2" weight="bold" />
                            Create First Game
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {games.map(game => (
                                <div key={game._id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] group relative overflow-hidden">
                                    {/* Decorative Top Line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                                           <GameController className="h-6 w-6 text-indigo-400" weight="duotone" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(game)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                title="Edit Config"
                                            >
                                                <PencilSimple className="h-5 w-5" weight="duotone" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(game._id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Terminate Protocol"
                                            >
                                                <Trash className="h-5 w-5" weight="duotone" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide truncate pr-2">{game.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">{game.description}</p>
                                    
                                    <div className="space-y-3 pt-4 border-t border-slate-700/50">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Protocol Type</span>
                                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-xs font-bold">
                                                {game.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Capacity</span>
                                            <div className="flex items-center text-slate-300 font-mono font-bold">
                                                <UsersThree className="h-4 w-4 mr-1 text-slate-500" weight="duotone" />
                                                {game.minPlayers}-{game.maxPlayers}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Game Count */}
                        <div className="mt-8 text-center">
                             <span className="inline-block px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-xs font-mono text-slate-400">
                                SYSTEM STATUS: {games.length} PROTOCOLS ACTIVE
                             </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}