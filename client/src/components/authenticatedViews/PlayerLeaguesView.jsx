import React, { useState, useEffect } from 'react';
import { Users, Trophy, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiService } from '../../APIs/apiService';

export default function PlayerLeaguesView() {
    const [myLeagues, setMyLeagues] = useState([]);
    const [allLeagues, setAllLeagues] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadLeagues();
    }, []);

    const loadLeagues = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [my, all, applications] = await Promise.all([
                apiService.players.getMyLeagues(),
                apiService.leagues.getActive(),
                apiService.players.getMyApplications(),
            ]);
            
            console.log('My Leagues:', my);
            console.log('All Leagues:', all);
            console.log('My Applications:', applications);
            
            setMyLeagues(my);
            setAllLeagues(all);
            setMyApplications(applications);
        } catch (error) {
            console.error('Failed to load leagues:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (leagueId) => {
        setActionLoading(leagueId);
        try {
            await apiService.players.applyToLeague(leagueId);
            alert('Application submitted successfully!');
            await loadLeagues();
        } catch (error) {
            alert(error.message || 'Failed to apply');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelApplication = async (leagueId, applicationId) => {
        setActionLoading(applicationId);
        try {
            await apiService.players.cancelApplication(leagueId, applicationId);
            alert('Application cancelled');
            await loadLeagues();
        } catch (error) {
            alert(error.message || 'Failed to cancel');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async (leagueId) => {
        if (!confirm('Are you sure you want to leave this league?')) return;
        
        setActionLoading(leagueId);
        try {
            await apiService.players.leaveLeague(leagueId);
            alert('Successfully left the league');
            await loadLeagues();
        } catch (error) {
            alert(error.message || 'Failed to leave league');
        } finally {
            setActionLoading(null);
        }
    };

    const isAlreadyMember = (leagueId) => {
        return myLeagues.some(l => l._id === leagueId);
    };

    const hasApplied = (leagueId) => {
        return myApplications.some(app => app.league._id === leagueId);
    };

    const getApplication = (leagueId) => {
        return myApplications.find(app => app.league._id === leagueId);
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
            <h1 className="text-4xl font-bold mb-8">Leagues</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                    <button 
                        onClick={loadLeagues}
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

            {/* My Leagues */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">My Leagues</h2>
                {myLeagues.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600">You haven't joined any leagues yet</p>
                        <p className="text-sm text-gray-500 mt-2">Browse available leagues below to get started</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myLeagues.map(league => (
                            <LeagueCard 
                                key={league._id}
                                league={league}
                                isMember={true}
                                onLeave={() => handleLeave(league._id)}
                                loading={actionLoading === league._id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* All Available Leagues */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Available Leagues</h2>
                {allLeagues.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No active leagues available</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allLeagues.map(league => (
                            <LeagueCard 
                                key={league._id}
                                league={league}
                                isMember={isAlreadyMember(league._id)}
                                hasApplied={hasApplied(league._id)}
                                application={getApplication(league._id)}
                                onApply={() => handleApply(league._id)}
                                loading={actionLoading === league._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function LeagueCard({ league, isMember, hasApplied, application, onApply, onLeave, loading }) {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{league.name}</h3>
                {isMember && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Member
                    </span>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>{league.game?.name || 'Game'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{league.players?.length || 0} Players</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(league.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {league.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {league.description}
                </p>
            )}

            {isMember ? (
                <button
                    onClick={onLeave}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Leaving...' : 'Leave League'}
                </button>
            ) : hasApplied ? (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded">
                    <Clock className="h-4 w-4" />
                    <span>Application Pending</span>
                </div>
            ) : (
                <button
                    onClick={onApply}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Applying...' : 'Apply to Join'}
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
                <h3 className="font-semibold">{application.league.name}</h3>
                {statusIcons[application.status]}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
                Applied: {new Date(application.appliedAt).toLocaleDateString()}
            </p>
            
            {application.status === 'pending' && (
                <button
                    onClick={() => onCancel(application.league._id, application._id)}
                    disabled={loading}
                    className="w-full px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Cancelling...' : 'Cancel Application'}
                </button>
            )}
        </div>
    );
}