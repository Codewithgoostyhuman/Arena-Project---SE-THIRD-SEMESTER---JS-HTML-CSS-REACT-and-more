import React, { useState, useEffect } from 'react';
import { apiService } from '../../APIs/apiService';
import { 
    Trophy, UsersThree, CalendarBlank, Clock, 
    ArrowRight, CheckCircle, XCircle, Handshake,
    TrendUp, ChartBar, Info, WarningCircle, CaretRight
} from '@phosphor-icons/react';

export default function ManageTournamentView({ tournamentId, setCurrentView }) {
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'sponsors', 'players', 'matches'
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchTournamentDetails();
    }, [tournamentId]);

    const fetchTournamentDetails = async () => {
        try {
            setLoading(true);
            const data = await apiService.tournaments.getById(tournamentId);
            setTournament(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdating(true);
            await apiService.request(`/tournaments/${tournamentId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            alert(`Tournament status updated to ${newStatus}`);
            fetchTournamentDetails();
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleSponsorshipResponse = async (requestId, approved) => {
        try {
            setUpdating(true);
            const status = approved ? 'accepted' : 'declined';
            await apiService.request(`/tournaments/${tournamentId}/sponsorship/${requestId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            alert(`Sponsorship request ${status}`);
            fetchTournamentDetails();
        } catch (err) {
            alert('Action failed: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusStep = (status) => {
        const statuses = ['planning', 'seeking_sponsors', 'open_for_applications', 'upcoming', 'ongoing', 'finished'];
        return statuses.indexOf(status);
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-400 font-bold">Initializing Command Center...</div>;
    if (!tournament) return <div className="p-20 text-center text-red-400 font-bold">Tournament not found.</div>;

    const currentStep = getStatusStep(tournament.status);

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Trophy size={40} weight="fill" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight mb-1">{tournament.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">
                                    {tournament.league?.name}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                    tournament.status === 'ongoing' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
                                    tournament.status === 'seeking_sponsors' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                }`}>
                                    {tournament.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => setCurrentView('my-tournaments')}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold transition-all text-sm"
                        >
                            Back
                        </button>
                        {tournament.status === 'planning' && (
                            <button 
                                onClick={() => handleStatusUpdate('seeking_sponsors')}
                                disabled={updating}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
                            >
                                <Handshake size={18} /> Seek Sponsors
                            </button>
                        )}
                        {tournament.status === 'seeking_sponsors' && (
                            <button 
                                onClick={() => handleStatusUpdate('open_for_applications')}
                                disabled={updating}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
                            >
                                <UsersThree size={18} /> Open Registration
                            </button>
                        )}
                        {(tournament.status === 'open_for_applications' || tournament.status === 'upcoming') && (
                            <button 
                                onClick={async () => {
                                    if(confirm('Kickoff will generate matches. Proceed?')) {
                                        try {
                                            setUpdating(true);
                                            await apiService.tournaments.kickoff(tournamentId);
                                            alert('Tournament Kicked Off!');
                                            fetchTournamentDetails();
                                        } catch(e) { alert(e.message); } finally { setUpdating(false); }
                                    }
                                }}
                                disabled={updating}
                                className="px-6 py-3 bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/40 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
                            >
                                <ArrowRight size={18} weight="bold" /> Kickoff Start
                            </button>
                        )}
                        {(tournament.status === 'ongoing') && (
                            <button 
                                onClick={async () => {
                                    if(confirm('Are you sure you want to announce the winner? This will end the tournament and notify all players.')) {
                                        try {
                                            setUpdating(true);
                                            await apiService.tournaments.complete(tournamentId);
                                            alert('Tournament Completed! Winner Announced.');
                                            fetchTournamentDetails();
                                        } catch(e) { alert(e.message); } finally { setUpdating(false); }
                                    }
                                }}
                                disabled={updating}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-lg shadow-orange-900/40 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
                            >
                                <Trophy size={18} weight="bold" /> Announce Results
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-12 px-4">
                    <div className="flex justify-between mb-4">
                        {['Planning', 'Sponsors', 'Registration', 'Upcoming', 'Live', 'Finished'].map((label, i) => (
                            <div key={label} className={`flex flex-col items-center gap-2 transition-all duration-500 ${i <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                    i < currentStep ? 'bg-indigo-600 border-indigo-500' : 
                                    i === currentStep ? 'bg-indigo-500/20 border-indigo-500 animate-pulse' : 
                                    'bg-slate-800 border-slate-700'
                                }`}>
                                    {i < currentStep ? <CheckCircle size={20} weight="bold" /> : <span className="text-xs font-black">{i + 1}</span>}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full w-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-700"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: 'overview', name: 'Overview', icon: ChartBar },
                            { id: 'sponsors', name: 'Sponsorships', icon: Handshake },
                            { id: 'players', name: 'Participants', icon: UsersThree },
                            { id: 'matches', name: 'Match Schedule', icon: Trophy },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 translate-x-1' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon size={20} weight={activeTab === tab.id ? 'fill' : 'bold'} />
                                    {tab.name}
                                </div>
                                <CaretRight size={16} />
                            </button>
                        ))}
                    </div>

                    {/* Tab Views */}
                    <div className="lg:col-span-3">
                        <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 min-h-[500px]">
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/30">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Players</p>
                                            <p className="text-3xl font-black text-white">{tournament.players?.length || 0} <span className="text-slate-600 text-lg">/ {tournament.maxPlayers}</span></p>
                                        </div>
                                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/30">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Style</p>
                                            <p className="text-2xl font-black text-indigo-400 uppercase tracking-tight">{tournament.style}</p>
                                        </div>
                                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/30">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Exclusive Sponsor</p>
                                            <p className="text-xl font-bold text-white truncate">{tournament.exclusiveSponsor?.companyName || 'None Selected'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-3xl flex gap-6 items-start">
                                        <Info size={32} className="text-indigo-400 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-lg mb-2 text-indigo-300">Next Action Required</h4>
                                            <p className="text-slate-400 leading-relaxed">
                                                {tournament.status === 'planning' ? "Review your tournament settings and data before seeking sponsors. Once you move to sponsorship phase, some settings will be locked." : 
                                                 tournament.status === 'seeking_sponsors' ? "Monitor sponsorship requests in the Sponsorships tab. You can approve multiple per-unit sponsors or one exclusive sponsor." :
                                                 "Registration is active. Players from your league can now apply to join this tournament."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'sponsors' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-6">Sponsorship Requests</h3>
                                    {!tournament.sponsorshipRequests || tournament.sponsorshipRequests.length === 0 ? (
                                        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                                            <Handshake size={60} className="text-slate-700 mx-auto mb-4" weight="duotone" />
                                            <p className="text-slate-500 font-medium">No sponsorship requests received yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {tournament.sponsorshipRequests.map((req) => (
                                                <div key={req._id} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 flex justify-between items-center group transition-all hover:border-indigo-500/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 font-black border border-slate-700 group-hover:border-indigo-500/30">
                                                            {req.advertiser?.companyName?.charAt(0) || 'A'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-white uppercase">{req.advertiser?.companyName || 'Unknown Advertiser'}</h4>
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${req.type === 'exclusive' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                                                    {req.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-bold text-indigo-400">${req.proposedAmount.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {req.status === 'pending' ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleSponsorshipResponse(req._id, true)}
                                                                    disabled={updating}
                                                                    className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-all"
                                                                >
                                                                    <CheckCircle size={20} weight="fill" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleSponsorshipResponse(req._id, false)}
                                                                    disabled={updating}
                                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
                                                                >
                                                                    <XCircle size={20} weight="fill" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'accepted' || req.status === 'selected' ? 'text-green-400' : 'text-red-400'}`}>
                                                                {req.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'players' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                     <h3 className="text-xl font-black uppercase tracking-tight mb-6">Tournament Roster</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tournament.players?.map((player) => (
                                            <div key={player._id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 uppercase">
                                                    {player.name?.charAt(0) || 'P'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white truncate">{player.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{player.email}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <TrendUp size={14} />
                                                    <span className="text-xs font-black">{player.stats?.winRate || 0}%</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!tournament.players || tournament.players.length === 0) && (
                                            <div className="col-span-full py-20 text-center opacity-50">
                                                <UsersThree size={48} className="mx-auto mb-4" />
                                                <p className="font-bold">No players in roster yet.</p>
                                            </div>
                                        )}
                                     </div>
                                </div>
                            )}

                            {activeTab === 'matches' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                     <h3 className="text-xl font-black uppercase tracking-tight mb-6">Match Brackets</h3>
                                     {(!tournament.matches || tournament.matches.length === 0) ? (
                                         <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                                             <ChartBar size={60} className="text-slate-700 mx-auto mb-4" weight="duotone" />
                                             <p className="text-slate-500 font-medium max-w-xs mx-auto">Matches will be generated once the tournament is kicked off.</p>
                                         </div>
                                     ) : (
                                         <div className="space-y-4">
                                             {tournament.matches.map((match) => (
                                                 <div key={match._id} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 flex items-center justify-between">
                                                     <div className="flex items-center gap-8">
                                                         <div className="text-center min-w-[60px]">
                                                             <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Round</p>
                                                             <p className="text-xl font-black text-indigo-400">{match.round}</p>
                                                         </div>
                                                         <div className="flex items-center gap-4">
                                                             <div className="font-bold text-slate-300 min-w-[100px] text-right">{match.players?.[0]?.name || 'TBD'}</div>
                                                             <div className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase">VS</div>
                                                             <div className="font-bold text-slate-300 min-w-[100px]">{match.players?.[1]?.name || 'TBD'}</div>
                                                         </div>
                                                     </div>
                                                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                                         match.status === 'finished' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 
                                                         match.status === 'ongoing' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                         'bg-slate-800 text-slate-500 border-slate-700'
                                                     }`}>
                                                         {match.status}
                                                     </span>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
