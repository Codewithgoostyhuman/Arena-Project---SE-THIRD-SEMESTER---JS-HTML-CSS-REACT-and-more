import React, { useState, useEffect } from 'react';

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
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">Create New League</h1>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        League Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Pro League Season 1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                        placeholder="Describe your league..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Game <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={formData.game}
                        onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select a game</option>
                        {games.map(g => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                    </select>
                    {games.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">No games available. Please ask an operator to create games first.</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating Formula <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={formData.ratingFormula}
                        onChange={(e) => setFormData({ ...formData, ratingFormula: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select a rating formula</option>
                        {ratingFormulas.map(formula => (
                            <option key={formula._id} value={formula._id}>
                                {formula.name || `Formula ${formula._id.substring(0, 8)}`}
                            </option>
                        ))}
                    </select>
                    {ratingFormulas.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">No rating formulas available. Please ask an operator to create rating formulas first.</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Players <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        required
                        min="2"
                        max="256"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 64 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum number of players allowed in this league</p>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || games.length === 0 || ratingFormulas.length === 0}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {loading ? 'Creating...' : 'Create League'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentView('my-leagues')}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>

                {(games.length === 0 || ratingFormulas.length === 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mt-4">
                        <p className="font-medium">Missing Required Data</p>
                        <p className="text-sm mt-1">
                            You need both games and rating formulas to create a league. Please contact an operator.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}