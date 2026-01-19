import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { apiService } from '../../APIs/apiService';
import MatchCard from '../reuseableComponents/MatchCard';
export default function LiveMatchesView({ setCurrentView, setSelectedMatchId }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            const data = await apiService.public.getLiveMatches();
            setMatches(data);
        } catch (error) {
            console.error('Failed to load matches:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Loading live matches...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold mb-8">Live Matches</h1>

            {matches.length === 0 ? (
                <div className="text-center py-16">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">No live matches at the moment</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map(match => (
                        <MatchCard 
                            key={match._id} 
                            match={match} 
                            setCurrentView={setCurrentView}
                            setSelectedMatchId={setSelectedMatchId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}