import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../../APIs/apiService';

export default function PlayerTournamentsView() {
    const [myTournaments, setMyTournaments] = useState([]);
    const [available, setAvailable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [my, avail] = await Promise.all([
                apiService.players.getMyTournaments(),
                apiService.players.getAvailableTournaments(),
            ]);
            
            console.log('My Tournaments:', my);
            console.log('Available Tournaments:', avail);
            
            setMyTournaments(my);
            setAvailable(avail);
        } catch (error) {
            console.error('Failed to load tournaments:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (tournamentId) => {
        setActionLoading(tournamentId);
        try {
            await apiService.players.applyToTournament(tournamentId);
            alert('Successfully joined tournament!');
            await loadTournaments();
        } catch (error) {
            alert(error.message || 'Failed to join tournament');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDropOut = async (tournamentId) => {
        if (!confirm('Are you sure you want to drop out of this tournament?')) return;
        
        setActionLoading(tournamentId);
        try {
            await apiService.players.dropOutOfTournament(tournamentId);
            alert('Successfully dropped out');
            await loadTournaments();
        } catch (error) {
            alert(error.message || 'Failed to drop out');
        } finally {
            setActionLoading(null);
        }
    };

    const handleForfeit = async (tournamentId) => {
        if (!confirm('Are you sure you want to forfeit this tournament? This will forfeit all your remaining matches.')) return;
        
        setActionLoading(tournamentId);
        try {
            const result = await apiService.players.forfeitTournament(tournamentId);
            alert(result.message || 'Tournament forfeited');
            await loadTournaments();
        } catch (error) {
            alert(error.message || 'Failed to forfeit');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">Tournaments</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                    <button 
                        onClick={loadTournaments}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* My Tournaments */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">My Tournaments</h2>
                {myTournaments.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">You haven't joined any tournaments yet</p>
                        <p className="text-sm text-gray-500 mt-2">Browse available tournaments below</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myTournaments.map(tournament => (
                            <TournamentCard 
                                key={tournament._id}
                                tournament={tournament}
                                isParticipant={true}
                                onDropOut={() => handleDropOut(tournament._id)}
                                onForfeit={() => handleForfeit(tournament._id)}
                                loading={actionLoading === tournament._id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Available Tournaments */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Available Tournaments</h2>
                {available.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No tournaments available at the moment</p>
                        <p className="text-sm text-gray-500 mt-2">Check back later or join more leagues</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {available.map(tournament => (
                            <TournamentCard 
                                key={tournament._id}
                                tournament={tournament}
                                onApply={() => handleApply(tournament._id)}
                                loading={actionLoading === tournament._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TournamentCard({ tournament, isParticipant, onApply, onDropOut, onForfeit, loading }) {
    const getStatusColor = (status) => {
        const colors = {
            'open_for_applications': 'bg-green-100 text-green-700',
            'upcoming': 'bg-blue-100 text-blue-700',
            'ongoing': 'bg-yellow-100 text-yellow-700',
            'finished': 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'open_for_applications': <Clock className="h-4 w-4" />,
            'upcoming': <Calendar className="h-4 w-4" />,
            'ongoing': <PlayCircle className="h-4 w-4" />,
            'finished': <CheckCircle className="h-4 w-4" />
        };
        return icons[status] || <Clock className="h-4 w-4" />;
    };

    const canDropOut = isParticipant && 
        (tournament.status === 'open_for_applications' || tournament.status === 'upcoming');
    const canForfeit = isParticipant && tournament.status === 'ongoing';

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {tournament.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(tournament.status)}`}>
                    {getStatusIcon(tournament.status)}
                    {tournament.status.replace(/_/g, ' ')}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>{tournament.league?.name || 'League'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                        {tournament.players?.length || 0} / {tournament.maxPlayers} Players
                    </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                        {tournament.playStartDate 
                            ? new Date(tournament.playStartDate).toLocaleDateString()
                            : 'TBD'}
                    </span>
                </div>
            </div>

            {tournament.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tournament.description}
                </p>
            )}

            {/* Action Buttons */}
            {isParticipant ? (
                <div className="space-y-2">
                    {canDropOut && (
                        <button
                            onClick={onDropOut}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? 'Dropping out...' : 'Drop Out'}
                        </button>
                    )}
                    {canForfeit && (
                        <button
                            onClick={onForfeit}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? 'Forfeiting...' : 'Forfeit Tournament'}
                        </button>
                    )}
                    {!canDropOut && !canForfeit && (
                        <div className="w-full px-4 py-2 bg-green-100 text-green-700 rounded text-center text-sm">
                            Enrolled
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={onApply}
                    disabled={loading || tournament.players?.length >= tournament.maxPlayers}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Joining...' : 
                     tournament.players?.length >= tournament.maxPlayers ? 'Full' : 
                     'Join Tournament'}
                </button>
            )}
        </div>
    );
}