import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash, ArrowsClockwise, User, Envelope, Shield, Tag } from '@phosphor-icons/react';

// StatusBadge Component
function StatusBadge({ status }) {
    const statusStyles = {
        active: 'bg-green-500/10 text-green-400 border-green-500/30',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/30'
    };

    return (
        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border rounded ${statusStyles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
            {status}
        </span>
    );
}

// LoadingScreen Component
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-bold animate-pulse">Loading User Database...</p>
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
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
             {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            <div className="fixed top-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                     <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                        User <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Database</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage platform users, roles, and access permissions.</p>
                </div>

                {error && (
                    <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center justify-between backdrop-blur-sm">
                        <div className="flex items-center">
                            <XCircle className="w-4 h-4 mr-3" />
                            <div>
                                <p className="font-bold">Error loading users</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        </div>
                        <button 
                            onClick={loadUsers}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-bold transition"
                        >
                            <ArrowsClockwise className="h-4 w-4" weight="bold" />
                            Retry
                        </button>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
                    {['all', 'active', 'pending', 'inactive'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2 rounded-full font-bold uppercase text-xs tracking-wider transition-all border ${
                                filter === status
                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {users.length === 0 ? (
                    <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 p-16 text-center">
                        <Shield className="h-12 w-12 text-slate-600 mx-auto mb-6" weight="duotone" />
                        <p className="text-slate-400 text-lg">No users found</p>
                        <p className="text-slate-500 text-sm mt-2 font-mono">
                            {filter !== 'all' ? `FILTER: ${filter.toUpperCase()} -> RESULT: 0` : 'DATABASE EMPTY'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700/50">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-2"><User weight="duotone" className="h-4 w-4" /> Name</div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                             <div className="flex items-center gap-2"><Envelope weight="duotone" className="h-4 w-4" /> Contact</div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                             <div className="flex items-center gap-2"><Shield weight="duotone" className="h-4 w-4" /> Role</div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                             <div className="flex items-center gap-2"><Tag weight="duotone" className="h-4 w-4" /> Status</div>
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 bg-slate-800/20">
                                    {users.map(user => (
                                        <tr key={user._id} className="hover:bg-indigo-500/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{user.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">ID: {user._id.slice(-6)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-300">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded uppercase tracking-wider">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={user.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {user.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(user._id)}
                                                                className="p-2 text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/30"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="h-4 w-4" weight="fill" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(user._id)}
                                                                className="p-2 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-colors border border-orange-500/30"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-4 w-4" weight="fill" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/30"
                                                        title="Delete"
                                                    >
                                                        <Trash className="h-4 w-4" weight="duotone" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest font-mono">
                            <span>Total Records: {users.length}</span>
                            <span>System Database v1.0</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}