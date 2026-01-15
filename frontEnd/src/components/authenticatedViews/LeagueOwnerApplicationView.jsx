import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users, Trophy } from 'lucide-react';

export default function ApplicationsView() {
    const [activeTab, setActiveTab] = useState('league'); // 'league' or 'tournament'
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'

    useEffect(() => {
        fetchApplications();
    }, [activeTab, filter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const statusParam = filter !== 'all' ? `?status=${filter}` : '';
            const endpoint = activeTab === 'league' 
                ? `/league/applications${statusParam}`
                : `/tournament/applications${statusParam}`;

            const response = await fetch(`http://localhost:5000/api/league-owners${endpoint}`, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to fetch applications');
            
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (applicationId) => {
        try {
            const endpoint = activeTab === 'league'
                ? `/league/application/${applicationId}/approve`
                : `/tournament/application/${applicationId}/approve`;

            const response = await fetch(`http://localhost:5000/api/league-owners${endpoint}`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
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
            const endpoint = activeTab === 'league'
                ? `/league/application/${applicationId}/reject`
                : `/tournament/application/${applicationId}/reject`;

            const response = await fetch(`http://localhost:5000/api/league-owners${endpoint}`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
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
                        <div key={app._id} className="p-6 hover:bg-gray-50 transition">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {app.user?.name || 'Unknown Player'}
                                        </h3>
                                        {getStatusBadge(app.status)}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-1">
                                        Email: {app.user?.email || 'N/A'}
                                    </p>
                                    
                                    <p className="text-sm text-gray-600 mb-1">
                                        {activeTab === 'league' ? 'League' : 'Tournament'}: {' '}
                                        <span className="font-medium">{app.target?.name || 'N/A'}</span>
                                    </p>
                                    
                                    <p className="text-xs text-gray-500 mt-2">
                                        Applied: {formatDate(app.createdAt)}
                                    </p>
                                </div>

                                {app.status === 'pending' && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleApprove(app._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(app._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}