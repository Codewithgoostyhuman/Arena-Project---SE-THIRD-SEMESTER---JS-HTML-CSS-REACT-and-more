import React, { useState, useEffect } from 'react';
import { Trophy, UsersThree, CalendarBlank, CheckCircle, Clock, XCircle, MapPin, CurrencyDollar } from '@phosphor-icons/react';
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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold animate-pulse">Loading Arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden pb-12">
             {/* Background Grid Pattern */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            <div className="fixed top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">
                        Tournament <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Center</span>
                    </h1>
                    <p className="text-slate-400 text-lg">Browse available tournaments, manage your applications, and track your active competitions.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8 flex items-center justify-between">
                        <div className="flex items-center text-red-400">
                             <XCircle className="w-6 h-6 mr-3" />
                             <p>{error}</p>
                        </div>
                        <button 
                            onClick={loadTournaments}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-bold transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Pending Applications */}
                {myApplications.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center mb-6">
                            <span className="w-1 h-8 bg-yellow-500 mr-3 rounded-full"></span>
                            <h2 className="text-2xl font-bold text-white">Pending Applications</h2>
                        </div>
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
                <div className="mb-16">
                    <div className="flex items-center mb-6">
                        <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
                         <h2 className="text-2xl font-bold text-white">My Active Tournaments</h2>
                    </div>
                   
                    {myTournaments.length === 0 ? (
                         <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
                            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" weight="duotone" />
                            <p className="text-slate-400 text-lg mb-2">You haven't joined any tournaments yet</p>
                            <p className="text-slate-500 text-sm">Browse available tournaments below to get started</p>
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
                    <div className="flex items-center mb-6">
                        <span className="w-1 h-8 bg-indigo-500 mr-3 rounded-full"></span>
                        <h2 className="text-2xl font-bold text-white">Available Tournaments</h2>
                    </div>
                    {allTournaments.length === 0 ? (
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
                             <CalendarBlank className="w-16 h-16 text-slate-600 mx-auto mb-4" weight="duotone" />
                            <p className="text-slate-400 text-lg">No active tournaments available at the moment.</p>
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
        </div>
    );
}

function TournamentCard({ tournament, isMember, hasApplied, application, onApply, onLeave, loading }) {
    const getStatusColor = (status) => {
        const colors = {
            upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
            completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div>
                     <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded mb-2 border ${getStatusColor(tournament.status)}`}>
                        {tournament.status}
                    </span>
                    <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{tournament.name}</h3>
                </div>
                {isMember && (
                    <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                        <CheckCircle className="w-5 h-5" weight="fill" />
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-300">
                    <Trophy className="h-4 w-4 mr-3 text-yellow-500" weight="duotone" />
                    <span className="font-bold">{tournament.game?.name || 'Game'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-300">
                    <UsersThree className="h-4 w-4 mr-3 text-blue-400" weight="duotone" />
                    <span>{tournament.registeredPlayers?.length || 0} / {tournament.maxParticipants || '∞'} Players</span>
                </div>
                {tournament.startDate && (
                    <div className="flex items-center text-sm text-slate-300">
                        <CalendarBlank className="h-4 w-4 mr-3 text-purple-400" weight="duotone" />
                        <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                )}
                {tournament.location && (
                    <div className="flex items-center text-sm text-slate-300">
                        <MapPin className="h-4 w-4 mr-3 text-red-400" weight="duotone" />
                        <span>{tournament.location}</span>
                    </div>
                )}
                {tournament.prizePool && (
                    <div className="flex items-center text-sm text-slate-300 pt-2 border-t border-slate-700/50 mt-2">
                        <CurrencyDollar className="h-4 w-4 mr-2 text-green-400" weight="duotone" />
                        <span className="text-green-400 font-bold">Prize Pool: ${tournament.prizePool}</span>
                    </div>
                )}
            </div>

            {tournament.description && (
                <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                    {tournament.description}
                </p>
            )}

            {isMember ? (
                <button
                    onClick={onLeave}
                    disabled={loading || tournament.status === 'ongoing'}
                    className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-500/10"
                >
                    {loading ? 'Processing...' : tournament.status === 'ongoing' ? 'Ongoing' : 'Leave Tournament'}
                </button>
            ) : hasApplied ? (
                <div className="w-full px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm">
                    <Clock className="h-4 w-4" weight="bold" />
                    <span>Pending</span>
                </div>
            ) : (
                <button
                    onClick={onApply}
                    disabled={loading || tournament.status === 'completed' || tournament.status === 'cancelled'}
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 group-hover:translate-y-[-2px]"
                >
                    {loading ? 'Processing...' : 
                     tournament.status === 'completed' ? 'Ended' :
                     tournament.status === 'cancelled' ? 'Cancelled' :
                     'Join Tournament'}
                </button>
            )}
        </div>
    );
}

function ApplicationCard({ application, onCancel, loading }) {
    const statusIcons = {
        pending: <Clock className="h-5 w-5 text-yellow-500" weight="bold" />,
        approved: <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />,
        rejected: <XCircle className="h-5 w-5 text-red-500" weight="fill" />
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl -mr-10 -mt-10"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-bold text-white text-lg">{application.tournament.name}</h3>
                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700">
                    {statusIcons[application.status]}
                </div>
            </div>
            
            <div className="space-y-2 mb-6 relative z-10">
                <p className="text-sm text-slate-400 flex justify-between">
                    <span>Applied:</span>
                    <span className="text-slate-200">{new Date(application.appliedAt).toLocaleDateString()}</span>
                </p>
                
                {application.tournament.startDate && (
                    <p className="text-sm text-slate-400 flex justify-between">
                        <span>Starts:</span>
                        <span className="text-slate-200">{new Date(application.tournament.startDate).toLocaleDateString()}</span>
                    </p>
                )}
            </div>
            
            {application.status === 'pending' && (
                <button
                    onClick={() => onCancel(application.tournament?._id, application._id)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50 relative z-10"
                >
                    {loading ? 'Cancelling...' : 'Cancel Application'}
                </button>
            )}
        </div>
    );
}