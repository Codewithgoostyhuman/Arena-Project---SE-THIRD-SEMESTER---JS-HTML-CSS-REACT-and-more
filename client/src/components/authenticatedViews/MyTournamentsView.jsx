import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Clock, Trash2, Eye } from 'lucide-react';

export default function MyTournamentsView({ setCurrentView }) {
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
            'planning': 'bg-gray-100 text-gray-800',
            'seeking_sponsors': 'bg-yellow-100 text-yellow-800',
            'open_for_applications': 'bg-blue-100 text-blue-800',
            'upcoming': 'bg-purple-100 text-purple-800',
            'ongoing': 'bg-green-100 text-green-800',
            'finished': 'bg-indigo-100 text-indigo-800',
            'archived': 'bg-gray-100 text-gray-600'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
                    <p className="font-medium">Error loading tournaments</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const groupedTournaments = groupTournamentsByLeague();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">My Tournaments</h1>
                <button
                    onClick={() => setCurrentView('my-leagues')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                    Back to Leagues
                </button>
            </div>

            {tournaments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Tournaments Yet</h2>
                    <p className="text-gray-600 mb-6">Create tournaments from your leagues to get started!</p>
                    <button
                        onClick={() => setCurrentView('my-leagues')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Go to My Leagues
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedTournaments.map((group, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {group.league?.name || 'Unknown League'}
                                </h2>
                                <span className="text-sm text-gray-500">
                                    ({group.tournaments.length} tournament{group.tournaments.length !== 1 ? 's' : ''})
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {group.tournaments.map((tournament) => (
                                    <div key={tournament._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                        {tournament.name}
                                                    </h3>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                                                        {tournament.status.replace(/_/g, ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Users className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    <span>{tournament.players?.length || 0} / {tournament.maxPlayers} Players</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Trophy className="h-4 w-4 text-purple-600 shrink-0" />
                                                    <span>{tournament.style}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="h-4 w-4 text-green-600 shrink-0" />
                                                    <span>Play: {formatDate(tournament.playStartDate)}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Clock className="h-4 w-4 text-orange-600 shrink-0" />
                                                    <span>Apply until: {formatDate(tournament.applicationEndDate)}</span>
                                                </div>

                                                {tournament.matches?.length > 0 && (
                                                    <div className="text-gray-600">
                                                        <span className="font-medium">{tournament.matches.length}</span> matches
                                                    </div>
                                                )}

                                                {tournament.applications?.length > 0 && (
                                                    <div className="text-gray-600">
                                                        <span className="font-medium">{tournament.applications.length}</span> applications
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-4 border-t border-gray-200">
                                                <button
                                                    onClick={() => {
                                                        // Navigate to tournament details view
                                                        console.log('View tournament:', tournament._id);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTournament(tournament._id)}
                                                    className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                                                    title="Delete Tournament"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}