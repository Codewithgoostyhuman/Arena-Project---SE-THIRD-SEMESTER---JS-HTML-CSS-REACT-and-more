import React, { useState, useEffect } from 'react';
import { apiService } from '../../APIs/apiService';
import { ClipboardText, GameController, Trophy, CheckCircle, Warning } from "@phosphor-icons/react";

export default function MarketingSurvey() {
    const [surveyData, setSurveyData] = useState({
        gameInterests: [],
        generalInterests: [],
        demographics: { age: '', gender: '', region: '' }
    });
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [availableGames, existingSurvey] = await Promise.all([
                apiService.public.getAllGames(),
                apiService.surveys.getMe()
            ]);
            setGames(availableGames);
            if (existingSurvey) {
                setSurveyData({
                    gameInterests: existingSurvey.gameInterests || [],
                    generalInterests: existingSurvey.generalInterests || [],
                    demographics: {
                        age: existingSurvey.demographics?.age || '',
                        gender: existingSurvey.demographics?.gender || '',
                        region: existingSurvey.demographics?.region || ''
                    }
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGameToggle = (gameId) => {
        const current = [...surveyData.gameInterests];
        if (current.includes(gameId)) {
            setSurveyData({ ...surveyData, gameInterests: current.filter(id => id !== gameId) });
        } else {
            setSurveyData({ ...surveyData, gameInterests: [...current, gameId] });
        }
    };

    const handleInterestToggle = (interest) => {
        const current = [...surveyData.generalInterests];
        if (current.includes(interest)) {
            setSurveyData({ ...surveyData, generalInterests: current.filter(i => i !== interest) });
        } else {
            setSurveyData({ ...surveyData, generalInterests: [...current, interest] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await apiService.surveys.submit(surveyData);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to submit survey');
        }
    };

    const commonInterests = ['Esports', 'Streaming', 'Hardware', 'Cosplay', 'Gaming Gear', 'Mobile Gaming', 'Retro Gaming'];

    if (loading) return <div className="p-8 text-center text-slate-400">Optimizing Survey Terminal...</div>;

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4 text-center">
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-12 rounded-3xl shadow-2xl">
                    <CheckCircle size={80} className="text-green-400 mx-auto mb-6" weight="fill" />
                    <h2 className="text-3xl font-black text-white mb-4">Transmission Complete!</h2>
                    <p className="text-slate-400 text-lg mb-8">Your interests have been recorded. We'll use this to customize your Arena experience.</p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/40"
                    >
                        Update Survey
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Insights</span></h1>
                <p className="text-slate-400 text-lg">Tell us what you love to help us bring better sponsors to the Arena.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Game Interests */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <GameController size={28} className="text-indigo-400" /> Which games do you follow?
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {games.map(game => (
                            <button
                                type="button"
                                key={game._id}
                                onClick={() => handleGameToggle(game._id)}
                                className={`p-4 rounded-2xl border transition-all duration-300 text-sm font-bold ${
                                    surveyData.gameInterests?.includes(game._id)
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'
                                }`}
                            >
                                {game.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* General Interests */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Trophy size={28} className="text-pink-400" /> General Interests
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {commonInterests.map(interest => (
                            <button
                                type="button"
                                key={interest}
                                onClick={() => handleInterestToggle(interest)}
                                className={`px-6 py-3 rounded-full border transition-all duration-300 text-sm font-bold ${
                                    surveyData.generalInterests?.includes(interest)
                                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'
                                }`}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Demographics */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <ClipboardText size={28} className="text-blue-400" /> Demographics (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Age</label>
                            <input 
                                type="number" 
                                value={surveyData.demographics.age}
                                onChange={(e) => setSurveyData({...surveyData, demographics: {...surveyData.demographics, age: e.target.value}})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. 24"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Gender</label>
                            <select 
                                value={surveyData.demographics.gender}
                                onChange={(e) => setSurveyData({...surveyData, demographics: {...surveyData.demographics, gender: e.target.value}})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Region</label>
                            <input 
                                type="text" 
                                value={surveyData.demographics.region}
                                onChange={(e) => setSurveyData({...surveyData, demographics: {...surveyData.demographics, region: e.target.value}})}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. North America"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <Warning weight="fill" /> {error}
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-1"
                >
                    Submit Profile
                </button>
            </form>
        </div>
    );
}
