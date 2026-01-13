import React, { useState, useEffect } from 'react';
import { Trophy, Users, Award, Play } from 'lucide-react';
import { apiService } from '../../APIs/apiService';
import FeatureCard from '../reuseableComponents/FeatureCard';
import TournamentCard from '../reuseableComponents/TournamentCard';
export default function HomeView({ setCurrentView }) {
    const [liveTournaments, setLiveTournaments] = useState([]);
    const [upcomingTournaments, setUpcomingTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [live, upcoming] = await Promise.all([
                apiService.public.getLiveTournaments(),
                apiService.public.getUpcomingTournaments(),
            ]);
            setLiveTournaments(live);
            setUpcomingTournaments(upcoming);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Welcome to ARENA
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-indigo-200">
                            Compete, Connect, and Conquer in the Ultimate Gaming Platform
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setCurrentView('register')}
                                className="px-8 py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-indigo-50"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => setCurrentView('live')}
                                className="px-8 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 flex items-center justify-center"
                            >
                                <Play className="h-5 w-5 mr-2" />
                                Watch Live
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose ARENA?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Trophy className="h-12 w-12 text-indigo-600" />}
                        title="Competitive Tournaments"
                        description="Join tournaments across multiple games"
                    />
                    <FeatureCard
                        icon={<Users className="h-12 w-12 text-indigo-600" />}
                        title="Build Your League"
                        description="Create and manage your own leagues"
                    />
                    <FeatureCard
                        icon={<Award className="h-12 w-12 text-indigo-600" />}
                        title="Track Progress"
                        description="Monitor stats and rankings"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading tournaments...</div>
            ) : (
                <>
                    {liveTournaments.length > 0 && (
                        <div className="bg-gray-100 py-16">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h2 className="text-3xl font-bold mb-8">Live Now</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {liveTournaments.map(t => (
                                        <TournamentCard key={t._id} tournament={t} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {upcomingTournaments.length > 0 && (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                            <h2 className="text-3xl font-bold mb-8">Upcoming Tournaments</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingTournaments.map(t => (
                                    <TournamentCard key={t._id} tournament={t} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}