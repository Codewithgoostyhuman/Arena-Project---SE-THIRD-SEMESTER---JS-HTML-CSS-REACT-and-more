import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../../APIs/apiService';
import NavButton from '../navigation/navButton';

export default function LeagueOwnerView({ setCurrentView,setSelectedLeagueId}) {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
//     const [pendingCount,setPendingCount] = useState(0)
//     useEffect(() => {
//     fetchPendingCount();
// }, []);

// const fetchPendingCount = async (id) => {
//     try {
//         const count = await apiService.leagueOwner.getPendingApplicationsCount(id);
//         setPendingCount(count);
//     } catch (error) {
//         console.error('Error fetching pending count:', error);
//     }
// };  


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
                console.error("Server error",errorText)
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <p className="font-medium">Error loading leagues</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">My Leagues</h1>
                <button
                    onClick={() => setCurrentView('create-league')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="h-5 w-5" />
                    Create New League
                </button>
            </div>
            {/* <div className="flex gap-4">
    {pendingCount > 0 && (
        <button
            onClick={() => setCurrentView('applications')}
            className="relative flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
        >
            <Clock className="h-5 w-5" />
            <span>Pending Applications</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {pendingCount}
            </span>
        </button>
    )}
    
</div> */}
            {leagues.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Leagues Yet</h2>
                    <p className="text-gray-600 mb-6">Create your first league to get started!</p>
                    <button
                        onClick={() => setCurrentView('create-league')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Create League
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leagues.map((league) => (
                        <div key={league._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{league.name}</h3>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                            league.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {league.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {league.description || 'No description provided'}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Users className="h-4 w-4 text-indigo-600" />
                                        <span>{league.players?.length || 0} / {league.maxPlayers} Players</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Trophy className="h-4 w-4 text-purple-600" />
                                        <span>{league.tournaments?.length || 0} Tournaments</span>
                                    </div>
                                    {league.game?.name && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <span>{league.game.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {setCurrentView('create-tournament'); setSelectedLeagueId(league._id)}}
                                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm"
                                    >
                                        Create Tournament
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteLeague(league._id)}
                                        className="p-2 items-center flex  border border-red-300 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                                        title="Delete League"
                                    >
                                        <Trash2 className="h-5 w-5 m-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}