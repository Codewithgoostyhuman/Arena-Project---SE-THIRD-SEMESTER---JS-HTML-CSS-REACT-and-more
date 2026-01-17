import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users, Trophy } from 'lucide-react';
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
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.toUpperCase()}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">Manage Applications</h1>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                    <button 
                        onClick={fetchApplications}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('league')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition ${
                                activeTab === 'league'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Users className="h-5 w-5 inline mr-2" />
                            League Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('tournament')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition ${
                                activeTab === 'tournament'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Trophy className="h-5 w-5 inline mr-2" />
                            Tournament Applications
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="p-4 bg-gray-50 border-b">
                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected', 'all'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    filter === f
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Applications List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Applications</h2>
                    <p className="text-gray-600">
                        No {filter !== 'all' ? filter : ''} applications found for your {activeTab}s.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md divide-y">
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
        <div className="p-6 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {playerName}
                        </h3>
                        {getStatusBadge(application.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                        Email: {playerEmail}
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-1">
                        {activeTab === 'league' ? 'League' : 'Tournament'}: {' '}
                        <span className="font-medium">{targetName}</span>
                    </p>
                    
                    {target?.game && (
                        <p className="text-sm text-gray-600 mb-1">
                            Game: <span className="font-medium">{target.game.name || target.game}</span>
                        </p>
                    )}
                    
                    {appliedDate && (
                        <p className="text-xs text-gray-500 mt-2">
                            Applied: {formatDate(appliedDate)}
                        </p>
                    )}
                    
                    {application.updatedAt && application.status !== 'pending' && (
                        <p className="text-xs text-gray-500">
                            Reviewed: {formatDate(application.updatedAt)}
                        </p>
                    )}
                </div>

                {application.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                        <button
                            onClick={() => onApprove(application._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(application._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}