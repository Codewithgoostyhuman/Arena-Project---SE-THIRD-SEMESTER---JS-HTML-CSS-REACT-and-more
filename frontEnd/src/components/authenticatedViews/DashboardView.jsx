import React from 'react';
import { useAuth } from '../../Auth/AuthContext';
import PlayerDashboard from './PlayerDashboard';
import LeagueOwnerDashboard from './LeagueOwnerDashboard';
import OperatorDashboard from './OperatorDashboard';
export default function DashboardView() {
    const { currentUser } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">
                Welcome back, {currentUser.name}!
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentUser.role === 'player' && <PlayerDashboard />}
                {currentUser.role === 'leagueOwner' && <LeagueOwnerDashboard />}
                {currentUser.role === 'operator' && <OperatorDashboard />}
            </div>
        </div>
    );
}