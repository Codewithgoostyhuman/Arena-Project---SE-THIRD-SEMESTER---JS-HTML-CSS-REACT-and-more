import React, { useState, useEffect } from 'react';
import { apiService } from '../../APIs/apiService';
import LoadingScreen from '../reuseableComponents/LoadingScreen';
import LeagueCard from '../reuseableComponents/LeagueCard';
export default function PlayerLeaguesView() {
    const [myLeagues, setMyLeagues] = useState([]);
    const [allLeagues, setAllLeagues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeagues();
    }, []);

    const loadLeagues = async () => {
        try {
            const [my, all] = await Promise.all([
                apiService.players.getMyLeagues(),
                apiService.leagues.getActive(),
            ]);
            setMyLeagues(my);
            setAllLeagues(all);
        } catch (error) {
            console.error('Failed to load leagues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (leagueId) => {
        try {
            await apiService.players.applyToLeague(leagueId);
            alert('Application submitted!');
            loadLeagues();
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">Leagues</h1>

            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">My Leagues</h2>
                {myLeagues.length === 0 ? (
                    <p className="text-gray-600">You haven't joined any leagues yet</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myLeagues.map(l => (
                            <LeagueCard key={l._id} league={l} />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">All Leagues</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allLeagues.map(l => (
                        <LeagueCard
                            key={l._id}
                            league={l}
                            onApply={() => handleApply(l._id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}