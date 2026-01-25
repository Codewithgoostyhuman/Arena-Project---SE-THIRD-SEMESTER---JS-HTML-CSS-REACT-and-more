import React, { useState, useEffect } from 'react';
import { UsersThree, Trophy, CalendarBlank, CheckCircle, Clock, XCircle, GameController } from '@phosphor-icons/react';
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
        return myApplications.some(app => app.league && app.league._id === leagueId);
    };

    const getApplication = (leagueId) => {
        return myApplications.find(app => app.league && app.league._id === leagueId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold animate-pulse">Loading Leagues...</p>
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
            <div className="fixed top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                        League <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hub</span>
                    </h1>
                     <p className="text-slate-400 mt-2 text-lg">Join leagues, compete in tournaments, and prove your skill.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center justify-between backdrop-blur-sm text-red-400">
                        <p>{error}</p>
                        <button 
                            onClick={loadLeagues}
                            className="text-sm font-bold bg-red-500/20 px-3 py-1 rounded hover:bg-red-500/30 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Pending Applications */}
                {myApplications.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="w-6 h-6 text-yellow-500" weight="duotone" />
                            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Pending Applications</h2>
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

                {/* My Leagues */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Trophy className="w-6 h-6 text-indigo-500" weight="duotone" />
                         <h2 className="text-2xl font-bold text-white uppercase tracking-wide">My Leagues</h2>
                    </div>
                   
                    {myLeagues.length === 0 ? (
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur-md">
                            <p className="text-slate-400 text-lg">You haven't joined any leagues yet</p>
                            <p className="text-sm text-slate-500 mt-2">Browse available leagues below to get started</p>
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
                     <div className="flex items-center gap-3 mb-6">
                        <GameController className="w-6 h-6 text-green-500" weight="duotone" />
                         <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Available Leagues</h2>
                    </div>
                    
                    {allLeagues.length === 0 ? (
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur-md">
                            <p className="text-slate-400 text-lg">No active leagues available</p>
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
        </div>
    );
}

function LeagueCard({ league, isMember, hasApplied, application, onApply, onLeave, loading }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] p-6 group flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                 <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight line-clamp-1">{league.name}</h3>
                {isMember && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest rounded">
                        Member
                    </span>
                )}
            </div>

            <div className="space-y-3 mb-6 flex-grow">
                 {league.game?.name && (
                    <div className="flex items-center text-sm text-slate-400">
                        <GameController className="h-4 w-4 mr-2 text-green-400" weight="duotone" />
                        <span>{league.game?.name}</span>
                    </div>
                )}
                <div className="flex items-center text-sm text-slate-400">
                    <UsersThree className="h-4 w-4 mr-2 text-blue-400" weight="duotone" />
                    <span>{league.players?.length || 0} Players</span>
                </div>
                <div className="flex items-center text-sm text-slate-400">
                    <CalendarBlank className="h-4 w-4 mr-2 text-indigo-400" weight="duotone" />
                    <span>{new Date(league.createdAt).toLocaleDateString()}</span>
                </div>
                 {league.description && (
                <p className="text-sm text-slate-500 mt-4 line-clamp-2 leading-relaxed">
                    {league.description}
                </p>
            )}
            </div>

            <div className="pt-4 border-t border-slate-700/50 mt-auto">
                {isMember ? (
                    <button
                        onClick={onLeave}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Leaving...' : 'Leave League'}
                    </button>
                ) : hasApplied ? (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-xl font-bold uppercase tracking-wider text-sm">
                        <Clock className="h-4 w-4" weight="bold" />
                        <span>Pending</span>
                    </div>
                ) : (
                    <button
                        onClick={onApply}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-indigo-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Applying...' : 'Apply to Join'}
                    </button>
                )}
            </div>
        </div>
    );
}

function ApplicationCard({ application, onCancel, loading }) {
    const statusIcons = {
        pending: <Clock className="h-5 w-5 text-yellow-400" weight="duotone" />,
        approved: <CheckCircle className="h-5 w-5 text-green-400" weight="fill" />,
        rejected: <XCircle className="h-5 w-5 text-red-400" weight="fill" />
    };

    if (!application.league) return null; // Skip invalid applications

    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-yellow-500/30 rounded-xl p-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-bold text-white text-lg">{application.league?.name || 'Unknown League'}</h3>
                {statusIcons[application.status]}
            </div>
            
            <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider">
                Applied: <span className="text-slate-300 ml-1">{new Date(application.appliedAt).toLocaleDateString()}</span>
            </p>
            
            {application.status === 'pending' && (
                <button
                    onClick={() => onCancel(application.league?._id, application._id)}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Cancelling...' : 'Cancel Application'}
                </button>
            )}
        </div>
    );
}