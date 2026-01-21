import React, { useState, useEffect } from 'react';
import { Trophy, UsersThree, Medal, Play, CaretRight, GameController, Lightning, Target, ShieldCheck, Globe } from "@phosphor-icons/react";
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
        <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">
            
            {/* Background Grid Pattern */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            
            {/* Hero Section - Asymmetrical Split */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:pt-32 lg:pb-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                            Next Gen Esports Platform
                        </div>

                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tighter">
                            UNLEASH
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                YOUR POTENTIAL
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                            Join the elite. Compete in automated tournaments, climb the global leaderboards, and carve your legacy in the digital arena.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setCurrentView('register')}
                                className="px-8 py-4 bg-white text-slate-900 rounded-none transform skew-x-[-10deg] hover:bg-indigo-50 transition-all font-black text-lg group"
                            >
                                <span className="block transform skew-x-[10deg] flex items-center">
                                    START COMPETING
                                    <CaretRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
                                </span>
                            </button>
                            <button
                                onClick={() => setCurrentView('live')}
                                className="px-8 py-4 bg-transparent border-2 border-slate-700 text-white rounded-none transform skew-x-[-10deg] hover:border-indigo-500 hover:text-indigo-400 transition-all font-bold text-lg"
                            >
                                <span className="block transform skew-x-[10deg] flex items-center">
                                    WATCH LIVE
                                </span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-8 pt-8 text-slate-500 text-sm font-mono">
                            <div className="flex items-center gap-2">
                                <UsersThree className="w-4 h-4" weight="duotone" />
                                <span>10K+ PLAYERS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" weight="duotone" />
                                <span>$50K+ PRIZES</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" weight="duotone" />
                                <span>GLOBAL SERVERS</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual - Stylized Showcase */}
                    <div className="relative flex items-center justify-center perspective-1000">
                         {/* Abstract Glow Behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                        
                        {/* Cyberpunk Frame Container */}
                        <div className="relative w-full max-w-lg aspect-square bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden group">
                            {/* Animated Border Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Scanning Line Animation */}
                            <div className="absolute inset-x-0 h-[2px] bg-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-scan opacity-50 z-20 pointer-events-none"></div>

                            {/* Corner Accents */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg z-20"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500 rounded-tr-lg z-20"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500 rounded-bl-lg z-20"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-500 rounded-br-lg z-20"></div>

                            {/* The Image - Framed */}
                            <img 
                                src="/trophy.jpg" 
                                alt="Esports Trophy" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            {/* Inner Vignette / Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10"></div>
                        </div>

                        {/* Floating UI Elements (Redesigned positions for frame) */}
                         <div className="absolute -top-6 -right-6 bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 p-4 rounded-xl shadow-xl animate-float-delayed z-30 hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                                    <Lightning className="w-5 h-5 text-green-400" weight="duotone" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono text-green-400 uppercase tracking-wider">Total Prizepool</div>
                                    <div className="font-black text-white text-xl">$50,000+</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 p-4 rounded-xl shadow-xl animate-float z-30 hidden md:block">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                                    <Target className="w-5 h-5 text-purple-400" weight="duotone" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Live Tournaments</div>
                                    <div className="font-black text-white text-xl">12 Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bento Grid Features */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                 <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">
                        Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">ARENA</span>
                    </h2>
                    <div className="h-1 w-24 bg-indigo-500 rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <div className="md:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-indigo-500/50 transition-colors group">
                        <Trophy className="w-12 h-12 text-yellow-500 mb-6 group-hover:scale-110 transition-transform" weight="duotone" />
                        <h3 className="text-2xl font-bold mb-4">Elite Automated Tournaments</h3>
                        <p className="text-slate-400 text-lg">
                            Experience the future of competitive gaming with our fully automated tournament system. 
                            From bracket generation to match verification, focus on playing and let us handle the logistics.
                        </p>
                    </div>

                    {/* Tall Card */}
                    <div className="md:row-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <ShieldCheck className="w-12 h-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform relative z-10" weight="duotone" />
                        <h3 className="text-2xl font-bold mb-4 relative z-10">Anti-Cheat & Security</h3>
                        <p className="text-slate-400 relative z-10">
                            Play with confidence. Our advanced security measures and fair-play policies ensure a level playing field for everyone.
                        </p>
                    </div>

                    {/* Small Card */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-pink-500/50 transition-colors group">
                        <UsersThree className="w-10 h-10 text-pink-400 mb-4 group-hover:scale-110 transition-transform" weight="duotone" />
                        <h3 className="text-xl font-bold mb-2">Community Leagues</h3>
                        <p className="text-slate-400">Create and manage your own leagues with custom rules.</p>
                    </div>

                    {/* Small Card */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                        <Medal className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" weight="duotone" />
                        <h3 className="text-xl font-bold mb-2">Ranked Progression</h3>
                        <p className="text-slate-400">Climb the ladder and earn exclusive digital rewards.</p>
                    </div>
                </div>
            </div>

            {/* Tournaments Section */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="pb-24 relative z-10">
                    {/* Live Tournaments */}
                    {liveTournaments.length > 0 && (
                        <div className="py-16">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center mb-10 border-l-4 border-red-500 pl-4">
                                    <h2 className="text-3xl font-black text-white tracking-wide uppercase">Live Action</h2>
                                    <div className="ml-4 px-2 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded animate-pulse">
                                        Happening Now
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {liveTournaments.map(t => (
                                        <TournamentCard key={t._id} tournament={t} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Tournaments */}
                    {upcomingTournaments.length > 0 && (
                        <div className="py-16">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center mb-10 border-l-4 border-indigo-500 pl-4">
                                    <h2 className="text-3xl font-black text-white tracking-wide uppercase">Upcoming Events</h2>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {upcomingTournaments.map(t => (
                                        <TournamentCard key={t._id} tournament={t} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}