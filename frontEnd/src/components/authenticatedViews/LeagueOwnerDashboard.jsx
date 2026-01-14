import React, { useState, useEffect } from 'react';
import { Users, Trophy } from 'lucide-react';
import StatsCard from '../reuseableComponents/StatsCard';

export default function LeagueOwnerDashboard() {
    const [stats, setStats] = useState({
        leaguesCount: 0,
        tournamentsCount: 0,
        playersCount: 0,
        loading: true
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Fetch leagues
            const leaguesResponse = await fetch('http://localhost:5000/api/leagues', {
                credentials: 'include'
            });
            const leagues = await leaguesResponse.json();

            // Calculate stats
            const leaguesCount = leagues.length;
            const tournamentsCount = leagues.reduce((sum, league) => 
                sum + (league.tournaments?.length || 0), 0
            );
            const playersCount = leagues.reduce((sum, league) => 
                sum + (league.players?.length || 0), 0
            );

            setStats({
                leaguesCount,
                tournamentsCount,
                playersCount,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (stats.loading) {
        return (
            <>
                <StatsCard
                    title="My Leagues"
                    value="..."
                    icon={<Users className="h-8 w-8 text-indigo-600" />}
                />
                <StatsCard
                    title="Active Tournaments"
                    value="..."
                    icon={<Trophy className="h-8 w-8 text-purple-600" />}
                />
                <StatsCard
                    title="Total Players"
                    value="..."
                    icon={<Users className="h-8 w-8 text-green-600" />}
                />
            </>
        );
    }

    return (
        <>
            <StatsCard
                title="My Leagues"
                value={stats.leaguesCount}
                icon={<Users className="h-8 w-8 text-indigo-600" />}
            />
            <StatsCard
                title="Active Tournaments"
                value={stats.tournamentsCount}
                icon={<Trophy className="h-8 w-8 text-purple-600" />}
            />
            <StatsCard
                title="Total Players"
                value={stats.playersCount}
                icon={<Users className="h-8 w-8 text-green-600" />}
            />
        </>
    );
}