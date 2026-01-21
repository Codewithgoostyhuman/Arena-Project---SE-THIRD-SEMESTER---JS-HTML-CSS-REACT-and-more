import React, { useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { User, Envelope, LockKey, Buildings, Briefcase, CaretRight, CheckCircle } from '@phosphor-icons/react';

export default function RegisterView({ setCurrentView }) {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'player',
        companyName: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await register(formData);

            if (response.user?.status === 'pending') {
                setSuccess('Registration successful! Awaiting operator approval.');
                setTimeout(() => setCurrentView('login'), 3000);
            } else {
                setSuccess('Registration successful! Redirecting...');
                setTimeout(() => setCurrentView('dashboard'), 1000);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
             {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
            />
            
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 relative z-10 transition-all duration-300 hover:border-indigo-500/30">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tight">Join <span className="text-indigo-500">ARENA</span></h2>
                    <p className="text-slate-400 mt-2">Create your account to start your journey</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl text-sm flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-xl text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" weight="duotone" />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Full Name
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" weight="duotone" />
                            </div>
                            <input
                                title="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 transition-all outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Envelope className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" weight="duotone" />
                            </div>
                            <input
                                title="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 transition-all outline-none"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Password
                        </label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockKey className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" weight="duotone" />
                            </div>
                            <input
                                title="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            I am a...
                        </label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" weight="duotone" />
                            </div>
                            <select
                                title="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-all outline-none"
                            >
                                <option value="player">Player</option>
                                <option value="leagueOwner">League Owner</option>
                                <option value="advertiser">Advertiser</option>
                                <option value= "operator">Operator</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <div className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-500"></div>
                            </div>
                        </div>
                    </div>

                    {formData.role === 'advertiser' && (
                        <div className="animate-fade-in-up">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Company Name
                            </label>
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Buildings className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" weight="duotone" />
                                </div>
                                <input
                                    title="companyName"
                                    type="text"
                                    required={formData.role === 'advertiser'}
                                    value={formData.companyName || ''}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 transition-all outline-none"
                                    placeholder="Company Ltd."
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group mt-6"
                    >
                         {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                Register Account
                                <CaretRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" weight="bold" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <button
                            onClick={() => setCurrentView('login')}
                            className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-all"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}