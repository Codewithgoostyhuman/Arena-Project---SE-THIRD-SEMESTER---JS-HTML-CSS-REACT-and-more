import React, { useState, useEffect } from 'react';
import { Play, Television, Lightning } from '@phosphor-icons/react';
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

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20 overflow-x-hidden">
             {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center mb-12">
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 mr-6">
                        <Television className="w-8 h-8 text-red-500" weight="duotone" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
                            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Matches</span>
                        </h1>
                        <p className="text-slate-400 mt-2 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                            Watch real-time competitive action
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed backdrop-blur-sm">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Play className="h-10 w-10 text-slate-600 fill-current ml-1" weight="duotone" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Matches Live Right Now</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            The arena is quiet. Check back later for upcoming tournaments or browse the schedule.
                        </p>
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
        </div>
    );
}