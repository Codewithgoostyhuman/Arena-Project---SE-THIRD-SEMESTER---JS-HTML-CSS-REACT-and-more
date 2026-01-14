import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';

// StatusBadge Component
function StatusBadge({ status }) {
    const statusStyles = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
        rejected: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
}

// LoadingScreen Component
function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
        </div>
    );
}

export default function ManageUsersView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadUsers();
    }, [filter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            let endpoint = 'http://localhost:5000/api/operator/user';
            
            if (filter !== 'all') {
                endpoint += `?status=${filter}`;
            }

            const response = await fetch(endpoint, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load users: ${response.statusText}`);
            }

            const data = await response.json();
            const usersData = Array.isArray(data) ? data : (data.users || []);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to load users:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        if (!window.confirm('Are you sure you want to approve this user?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/operator/user/approve/${userId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to approve user');
            }

            alert('User approved successfully');
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm('Are you sure you want to reject this user?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/operator/user/reject/${userId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to reject user');
            }

            alert('User rejected successfully');
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/operator/user/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete user');
            }

            alert('User deleted successfully');
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Manage Users</h1>
                <p className="text-gray-600 mt-2">View and manage all users on the platform</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Error loading users</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                        <button 
                            onClick={loadUsers}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
                {['all', 'active', 'pending', 'inactive'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 font-medium border-b-2 transition ${
                            filter === status
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {users.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-lg">No users found</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {filter !== 'all' ? `No ${filter} users at the moment` : 'No users in the system'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-3">
                                                {user.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(user._id)}
                                                            className="text-green-600 hover:text-green-900 flex items-center gap-1 transition"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span className="hidden sm:inline">Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user._id)}
                                                            className="text-orange-600 hover:text-orange-900 flex items-center gap-1 transition"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                            <span className="hidden sm:inline">Reject</span>
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="text-red-600 hover:text-red-900 flex items-center gap-1 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Count */}
            <div className="mt-4 text-sm text-gray-600">
                Showing {users.length} {users.length === 1 ? 'user' : 'users'}
            </div>
        </div>
    );
}