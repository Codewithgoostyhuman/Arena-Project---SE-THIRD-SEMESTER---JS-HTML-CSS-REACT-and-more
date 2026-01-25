import React, { useState, useEffect } from 'react';
import { GameController, Clock, ShieldCheck, UsersThree, TrendUp } from '@phosphor-icons/react';
import StatsCard from '../reuseableComponents/StatsCard';
import { MathOperations, ArrowLeft } from '@phosphor-icons/react';
import RatingFormulasView from './RatingFormulasView';

// Main Operator Dashboard Component
export default function OperatorDashboard() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [stats, setStats] = useState({
        pendingUsers: 0,
        totalGames: 0,
        activeLeagues: 0,
        totalUsers: 0,
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentView === 'dashboard') {
            loadDashboardStats();
        }
    }, [currentView]);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch dashboard stats from your API
            const response = await fetch('http://localhost:5000/api/operator/dashboard-stats', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }

            const data = await response.json();
            
            setStats({
                pendingUsers: data.pendingUsers || 0,
                totalGames: data.totalGames || 0,
                activeLeagues: data.activeLeagues || 0,
                totalUsers: data.totalUsers || 0,
                activeUsers: data.activeUsers || 0
            });
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (currentView === 'rating-formulas') {
        return (
            <div>
                <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 px-8 pt-6 mb-2"
                >
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </button>
                <RatingFormulasView />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Operator Dashboard</h1>
                <p className="text-gray-600 mt-2">Monitor and manage your esports platform</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p className="font-medium">Error loading dashboard data</p>
                    <p className="text-sm">{error}</p>
                    <button 
                        onClick={loadDashboardStats}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Pending Users"
                    value={stats.pendingUsers}
                    icon={<Clock className="h-8 w-8 text-yellow-600" weight="duotone" />}
                    loading={loading}
                />
                <StatsCard
                    title="Total Games"
                    value={stats.totalGames}
                    icon={<GameController className="h-8 w-8 text-blue-600" weight="duotone" />}
                    loading={loading}
                />
                <StatsCard
                    title="Active Leagues"
                    value={stats.activeLeagues}
                    icon={<ShieldCheck className="h-8 w-8 text-indigo-600" weight="duotone" />}
                    loading={loading}
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<UsersThree className="h-8 w-8 text-green-600" weight="duotone" />}
                    loading={loading}
                />
                <StatsCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={<TrendUp className="h-8 w-8 text-purple-600" weight="duotone" />}
                    loading={loading}
                />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        Manage Users
                    </button>
                    <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Manage Games
                    </button>
                    <button 
                        onClick={() => setCurrentView('rating-formulas')}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                        <MathOperations size={20} />
                        Rating Formulas
                    </button>
                    <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        View Statistics
                    </button>
                </div>
            </div>
        </div>
    );
}