import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, CheckCircle, Clock, XCircle, MapPin, DollarSign } from 'lucide-react';
import { apiService } from '../../APIs/apiService';

export default function PlayerTournamentsView() {
    const [myTournaments, setMyTournaments] = useState([]);
    const [allTournaments, setAllTournaments] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
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
            const [my, all, applications] = await Promise.all([
                apiService.players.getMyTournaments(),
                apiService.tournaments.getAvailable(),
                apiService.players.getMyTournamentApplications(),
            ]);
            
            console.log('My Tournaments:', my);
            console.log('All Tournaments:', all);
            console.log('My Applications:', applications);
            
            setMyTournaments(my);
            setAllTournaments(all);
            setMyApplications(applications);
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
            alert('Application submitted successfully!');
            await loadTournaments();
        } catch (error) {
            alert(error.message || 'Failed to apply');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelApplication = async (tournamentId, applicationId) => {
        setActionLoading(applicationId);
        try {
            await apiService.players.cancelTournamentApplication(tournamentId, applicationId);
            alert('Application cancelled');
            await loadTournaments();
        } catch (error) {
            alert(error.message || 'Failed to cancel');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async (tournamentId) => {
        if (!confirm('Are you sure you want to leave this tournament?')) return;
        
        setActionLoading(tournamentId);
        try {
            await apiService.players.leaveTournament(tournamentId);
            alert('Successfully left the tournament');
            await loadTournaments();
        } catch (error) {
            alert(error.message || 'Failed to leave tournament');
        } finally {
            setActionLoading(null);
        }
    };

    const isAlreadyMember = (tournamentId) => {
        return myTournaments.some(t => t._id === tournamentId);
    };

    const hasApplied = (tournamentId) => {
        return myApplications.some(app => app.tournament._id === tournamentId);
    };

    const getApplication = (tournamentId) => {
        return myApplications.find(app => app.tournament._id === tournamentId);
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

            {/* Pending Applications */}
            {myApplications.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Pending Applications</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myApplications.map(app => (
                            <ApplicationCard 
                                key={app._id}
                                application={app}
                                onCancel={handleCancelApplication}
                                loading={actionLoading === app._id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* My Tournaments */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">My Tournaments</h2>
                {myTournaments.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600">You haven't joined any tournaments yet</p>
                        <p className="text-sm text-gray-500 mt-2">Browse available tournaments below to get started</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myTournaments.map(tournament => (
                            <TournamentCard 
                                key={tournament._id}
                                tournament={tournament}
                                isMember={true}
                                onLeave={() => handleLeave(tournament._id)}
                                loading={actionLoading === tournament._id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* All Available Tournaments */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Available Tournaments</h2>
                {allTournaments.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No active tournaments available</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allTournaments.map(tournament => (
                            <TournamentCard 
                                key={tournament._id}
                                tournament={tournament}
                                isMember={isAlreadyMember(tournament._id)}
                                hasApplied={hasApplied(tournament._id)}
                                application={getApplication(tournament._id)}
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

function TournamentCard({ tournament, isMember, hasApplied, application, onApply, onLeave, loading }) {
    const getStatusColor = (status) => {
        const colors = {
            upcoming: 'bg-blue-100 text-blue-700',
            ongoing: 'bg-green-100 text-green-700',
            completed: 'bg-gray-100 text-gray-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{tournament.name}</h3>
                {isMember && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Registered
                    </span>
                )}
            </div>

            {tournament.status && (
                <span className={`inline-block px-2 py-1 text-xs rounded-full mb-3 ${getStatusColor(tournament.status)}`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </span>
            )}

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>{tournament.game?.name || 'Game'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{tournament.registeredPlayers?.length || 0} / {tournament.maxParticipants || '∞'} Players</span>
                </div>
                {tournament.startDate && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                )}
                {tournament.location && (
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{tournament.location}</span>
                    </div>
                )}
                {tournament.prizePool && (
                    <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>Prize Pool: ${tournament.prizePool}</span>
                    </div>
                )}
            </div>

            {tournament.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tournament.description}
                </p>
            )}

            {isMember ? (
                <button
                    onClick={onLeave}
                    disabled={loading || tournament.status === 'ongoing'}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Leaving...' : tournament.status === 'ongoing' ? 'Cannot Leave (Ongoing)' : 'Leave Tournament'}
                </button>
            ) : hasApplied ? (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded">
                    <Clock className="h-4 w-4" />
                    <span>Application Pending</span>
                </div>
            ) : (
                <button
                    onClick={onApply}
                    disabled={loading || tournament.status === 'completed' || tournament.status === 'cancelled'}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Applying...' : 
                     tournament.status === 'completed' ? 'Tournament Ended' :
                     tournament.status === 'cancelled' ? 'Cancelled' :
                     'Apply to Join'}
                </button>
            )}
        </div>
    );
}

function ApplicationCard({ application, onCancel, loading }) {
    const statusIcons = {
        pending: <Clock className="h-5 w-5 text-yellow-500" />,
        approved: <CheckCircle className="h-5 w-5 text-green-500" />,
        rejected: <XCircle className="h-5 w-5 text-red-500" />
    };

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{application.tournament.name}</h3>
                {statusIcons[application.status]}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
                Applied: {new Date(application.appliedAt).toLocaleDateString()}
            </p>
            
            {application.tournament.startDate && (
                <p className="text-sm text-gray-600 mb-3">
                    Starts: {new Date(application.tournament.startDate).toLocaleDateString()}
                </p>
            )}
            
            {application.status === 'pending' && (
                <button
                    onClick={() => onCancel(application.tournament?._id, application._id)}
                    disabled={loading}
                    className="w-full px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Cancelling...' : 'Cancel Application'}
                </button>
            )}
        </div>
    );
}