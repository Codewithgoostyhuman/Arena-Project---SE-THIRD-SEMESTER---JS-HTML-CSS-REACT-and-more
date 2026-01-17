import React, { useState, useEffect } from 'react';

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
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">Create New Tournament</h1>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tournament Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Spring Championship 2026"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        League <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={formData.league}
                        onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        disabled={leagueId} // Disable if leagueId is pre-selected
                    >
                        <option value="">Select a league</option>
                        {leagues.map(league => (
                            <option key={league._id} value={league._id}>
                                {league.name}
                            </option>
                        ))}
                    </select>
                    {leagues.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">No leagues available. Please create a league first.</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tournament Style <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="RoundRobin">Round Robin</option>
                        <option value="DoubleRoundRobin">Double Round Robin</option>
                        <option value="SingleElimination">Single Elimination</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Players <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        required
                        min="2"
                        max="128"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 16 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Application Period</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.applicationStartDate}
                                onChange={(e) => setFormData({ ...formData, applicationStartDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.applicationEndDate}
                                onChange={(e) => setFormData({ ...formData, applicationEndDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">Tournament Play Period</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.playStartDate}
                                onChange={(e) => setFormData({ ...formData, playStartDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.playEndDate}
                                onChange={(e) => setFormData({ ...formData, playEndDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || leagues.length === 0}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {loading ? 'Creating...' : 'Create Tournament'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentView('my-leagues')}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>

                {leagues.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mt-4">
                        <p className="font-medium">No Leagues Available</p>
                        <p className="text-sm mt-1">
                            You need to create a league first before creating tournaments.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}