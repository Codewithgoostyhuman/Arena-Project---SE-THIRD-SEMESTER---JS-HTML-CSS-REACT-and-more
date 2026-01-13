import React, { useState, useEffect } from 'react';
import { apiService } from '../../APIs/apiService';
import LoadingScreen from '../reuseableComponents/LoadingScreen';
import TournamentCard from '../reuseableComponents/TournamentCard';
export default function PlayerTournamentsView() {
    const [myTournaments, setMyTournaments] = useState([]);
    const [available, setAvailable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        try {
            const [my, avail] = await Promise.all([
                apiService.players.getMyTournaments(),
                apiService.players.getAvailableTournaments(),
            ]);
            setMyTournaments(my);
            setAvailable(avail);
        } catch (error) {
            console.error('Failed to load tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (tournamentId) => {
        try {
            await apiService.players.applyToTournament(tournamentId);
            loadTournaments();
            alert('Applied successfully!');
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8">Tournaments</h1>

            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">My Tournaments</h2>
                {myTournaments.length === 0 ? (
                    <p className="text-gray-600">You haven't joined any tournaments yet</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myTournaments.map(t => (
                            <TournamentCard key={t._id} tournament={t} />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Available Tournaments</h2>
                {available.length === 0 ? (
                    <p className="text-gray-600">No tournaments available at the moment</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {available.map(t => (
                            <TournamentCard
                                key={t._id}
                                tournament={t}
                                onApply={() => handleApply(t._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}