import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, RefreshCw } from 'lucide-react';

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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    {existingGame ? 'Edit Game' : 'Create New Game'}
                </h2>
                {onCancel && (
                    <button 
                        onClick={onCancel} 
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Game Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Counter-Strike 2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                        placeholder="Brief description of the game..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Game Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="TicTacToe">Tic Tac Toe</option>
                        <option value="RockPaperScissors">Rock Paper Scissors</option>
                        <option value="NumberGuessDuel">Number Guess Duel</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rules <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="4"
                        placeholder="Describe the rules of the game..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Players <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="2"
                            value={formData.minPlayers}
                            onChange={(e) => setFormData({ ...formData, minPlayers: parseInt(e.target.value) || 2 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">All games are 2 players</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Players <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="2"
                            value={formData.maxPlayers}
                            onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 2 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">All games are 2 players</p>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                    >
                        {submitting ? 'Saving...' : (existingGame ? 'Update Game' : 'Create Game')}
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                            Cancel
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading games...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Manage Games</h1>
                    <p className="text-gray-600 mt-2">Add and manage games available on the platform</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingGame(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Add Game
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Error loading games</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                        <button 
                            onClick={loadGames}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {showForm && (
                <GameForm 
                    existingGame={editingGame}
                    onSuccess={handleFormSuccess} 
                    onCancel={() => {
                        setShowForm(false);
                        setEditingGame(null);
                    }}
                />
            )}

            {games.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-lg">No games found</p>
                    <p className="text-gray-400 text-sm mt-2">Create your first game to get started</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Your First Game
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.map(game => (
                            <div key={game._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-semibold text-gray-900">{game.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(game)}
                                            className="text-blue-600 hover:text-blue-900 transition"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(game._id)}
                                            className="text-red-600 hover:text-red-900 transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{game.description}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Type:</span>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                            {game.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Players:</span>
                                        <span className="font-medium text-gray-900">{game.minPlayers}-{game.maxPlayers}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Game Count */}
                    <div className="mt-6 text-sm text-gray-600">
                        Showing {games.length} {games.length === 1 ? 'game' : 'games'}
                    </div>
                </>
            )}
        </div>
    );
}