import React, { useState, useEffect } from 'react';
import { apiService } from '../../APIs/apiService';
import { Envelope, Bell, CalendarBlank, GameController, CheckCircle, XCircle } from "@phosphor-icons/react";

export default function MailingListManagement() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchMyLists();
    }, []);

    const fetchMyLists = async () => {
        try {
            setLoading(true);
            const lists = await apiService.mailingLists.getMyLists();
            setSubscriptions(lists || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubscription = async (listName, isSubscribed) => {
        try {
            if (isSubscribed) {
                await apiService.mailingLists.unsubscribe(listName);
            } else {
                await apiService.mailingLists.subscribe(listName);
            }
            fetchMyLists();
            setMessage(`Successfully ${isSubscribed ? 'unsubscribed from' : 'subscribed to'} ${listName}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const listTypes = [
        { name: 'global_marketing', label: 'Global Marketing', desc: 'News, updates and promotions from Arena.', icon: <Envelope size={24} className="text-indigo-400" /> },
        { name: 'tournament_reminders', label: 'Tournament Alerts', desc: 'Reminders about upcoming matches and registration deadlines.', icon: <Bell size={24} className="text-yellow-400" /> },
        { name: 'league_updates', label: 'League News', desc: 'Stay updated on standings and changes in your leagues.', icon: <CalendarBlank size={24} className="text-green-400" /> }
    ];

    if (loading) return <div className="p-8 text-center text-slate-400">Loading subscriptions...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Notification <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Center</span></h1>
                <p className="text-slate-400 text-lg">Manage how you stay connected with the Arena.</p>
            </div>

            {message && (
                <div className="mb-6 animate-fade-in bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-6 py-4 rounded-2xl flex items-center justify-center gap-3">
                    <CheckCircle weight="fill" />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {listTypes.map(list => {
                    const isSubscribed = subscriptions.includes(list.name);
                    return (
                        <div key={list.name} className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/50 transition-all duration-300 group">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 group-hover:scale-110 transition-transform duration-300">
                                    {list.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{list.label}</h3>
                                    <p className="text-slate-400 text-sm max-w-md">{list.desc}</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => toggleSubscription(list.name, isSubscribed)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                                    isSubscribed 
                                    ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                                }`}
                            >
                                {isSubscribed ? <><XCircle weight="bold" /> Unsubscribe</> : <><CheckCircle weight="bold" /> Subscribe</>}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
