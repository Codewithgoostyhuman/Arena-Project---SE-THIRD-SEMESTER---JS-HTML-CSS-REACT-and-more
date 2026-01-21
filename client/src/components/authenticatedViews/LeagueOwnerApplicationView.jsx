import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, UsersThree, Trophy, WarningCircle, User, Envelope, GameController } from '@phosphor-icons/react';
import { apiService } from '../../APIs/apiService';

export default function ApplicationsView() {
    const [activeTab, setActiveTab] = useState('league'); // 'league' or 'tournament'
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [activeTab, filter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const statusParam = filter !== 'all' ? filter : null;
            
            let data;
            if (activeTab === 'league') {
                data = await apiService.leagueOwner.getLeagueApplications(null, statusParam);
            } else {
                data = await apiService.leagueOwner.getTournamentApplications(null, statusParam);
            }
            
            console.log(`${activeTab} applications:`, data);
            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError(error.message);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (applicationId) => {
        try {
            if (activeTab === 'league') {
                await apiService.leagueOwner.approveLeagueApplication(applicationId);
            } else {
                await apiService.leagueOwner.approveTournamentApplication(applicationId);
            }
            
            alert('Application approved successfully!');
            fetchApplications();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleReject = async (applicationId) => {
        if (!confirm('Are you sure you want to reject this application?')) return;

        try {
            if (activeTab === 'league') {
                await apiService.leagueOwner.rejectLeagueApplication(applicationId);
            } else {
                await apiService.leagueOwner.rejectTournamentApplication(applicationId);
            }
            
            alert('Application rejected');
            fetchApplications();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
            approved: 'bg-green-500/10 text-green-400 border-green-500/30',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/30'
        };
        return (
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                {status}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
             {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-2">
                    Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Applications</span>
                </h1>
                <p className="text-slate-400 mb-12 text-lg">Review and process incoming player requests.</p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center justify-between backdrop-blur-sm text-red-400">
                        <div className="flex items-center">
                            <WarningCircle className="w-5 h-5 mr-3" />
                            <div>
                                <p className="font-bold">Error loading applications</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchApplications}
                            className="text-sm font-bold bg-red-500/20 px-3 py-1 rounded hover:bg-red-500/30 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl mb-8 overflow-hidden">
                    <div className="border-b border-slate-700/50 flex">
                        <button
                            onClick={() => setActiveTab('league')}
                            className={`flex-1 px-6 py-4 text-center font-bold uppercase tracking-wider text-sm transition-all relative ${
                                activeTab === 'league'
                                    ? 'text-indigo-400 bg-indigo-500/5'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UsersThree className="h-5 w-5" weight={activeTab === 'league' ? 'fill' : 'duotone'} />
                                League Applications
                            </div>
                             {activeTab === 'league' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}

                        </button>
                        <button
                            onClick={() => setActiveTab('tournament')}
                            className={`flex-1 px-6 py-4 text-center font-bold uppercase tracking-wider text-sm transition-all relative ${
                                activeTab === 'tournament'
                                    ? 'text-purple-400 bg-purple-500/5'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                             <div className="flex items-center justify-center gap-2">
                                <Trophy className="h-5 w-5" weight={activeTab === 'tournament' ? 'fill' : 'duotone'} />
                                Tournament Applications
                            </div>
                            {activeTab === 'tournament' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>}
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="p-4 bg-slate-900/30 border-b border-slate-700/50 flex flex-wrap gap-2">
                        {['pending', 'approved', 'rejected', 'all'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                                    filter === f
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
               

                    {/* Applications List */}
                    {loading ? (
                       <div className="p-12 flex justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="p-16 text-center">
                            <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" weight="duotone" />
                            <h2 className="text-xl font-bold text-white mb-2">No Applications Found</h2>
                            <p className="text-slate-400">
                                No {filter !== 'all' ? filter : ''} applications found for your {activeTab}s.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {applications.map((app) => (
                                <ApplicationCard
                                    key={app._id}
                                    application={app}
                                    activeTab={activeTab}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    formatDate={formatDate}
                                    getStatusBadge={getStatusBadge}
                                />
                            ))}
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
}

function ApplicationCard({ application, activeTab, onApprove, onReject, formatDate, getStatusBadge }) {
    // Handle Application schema structure (separate document with references)
    const player = application.user; // Application schema uses 'user' field
    const target = application.target; // Reference to League or Tournament
    
    const playerName = player?.name || player?.username || 'Unknown Player';
    const playerEmail = player?.email || 'N/A';
    const targetName = target?.name || 'N/A';
    const appliedDate = application.createdAt; // Application schema uses createdAt

    return (
        <div className="p-6 hover:bg-indigo-500/5 transition duration-300 group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-white font-bold text-lg">
                            {playerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                {playerName}
                            </h3>
                             <p className="text-xs text-slate-500 flex items-center">
                                <Envelope className="w-3 h-3 mr-1" /> {playerEmail}
                            </p>
                        </div>
                        <div className="ml-auto md:ml-4">
                             {getStatusBadge(application.status)}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-800/50 rounded-lg p-4 mb-2 border border-slate-700/50">
                        <div className="flex items-center text-slate-300">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest w-24">
                                {activeTab === 'league' ? 'League' : 'Tournament'}
                            </span>
                            <span className="font-bold flex items-center">
                                {activeTab === 'league' ? <UsersThree className="w-4 h-4 mr-1 text-indigo-400" /> : <Trophy className="w-4 h-4 mr-1 text-purple-400" />}
                                {targetName}
                            </span>
                        </div>

                         {target?.game && (
                            <div className="flex items-center text-slate-300">
                                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest w-24">Game</span>
                                <span className="font-medium flex items-center">
                                    <GameController className="w-4 h-4 mr-1 text-green-400" />
                                    {target.game.name || target.game}
                                </span>
                            </div>
                        )}

                        {appliedDate && (
                            <div className="flex items-center text-slate-300">
                                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest w-24">Applied</span>
                                <span className="text-slate-400 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {formatDate(appliedDate)}
                                </span>
                            </div>
                        )}
                    </div>
                    
                </div>

                {application.status === 'pending' && (
                    <div className="flex md:flex-col gap-2 min-w-[120px]">
                        <button
                            onClick={() => onApprove(application._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-bold text-sm transition uppercase tracking-wider hover:shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                        >
                            <CheckCircle className="h-4 w-4" weight="bold" />
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(application._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-bold text-sm transition uppercase tracking-wider hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                        >
                            <XCircle className="h-4 w-4" weight="bold" />
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}