import { useState } from "react";
import { List, X, Trophy, SignOut, Bell, Info } from "@phosphor-icons/react";
import { useAuth } from "../../Auth/AuthContext";
import NavButton from "./navButton";
import MobileNavButton from "./mobileNavButton";
import { useNotifications } from '../../../hooks/UseSocket';

export default function Navigation({ currentView, setCurrentView, showMobileMenu, setShowMobileMenu }) {
    const { currentUser, logout } = useAuth();
    const { notifications, clearNotifications, isConnected } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = notifications.length;

    return (
        <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-b border-indigo-500/20 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center cursor-pointer group" onClick={() => setCurrentView('home')}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <Trophy className="h-8 w-8 text-indigo-400 relative z-10" weight="duotone" />
                        </div>
                        <span className="ml-2 text-2xl font-black tracking-wider text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                            ARENA
                        </span>
                        {!isConnected && currentUser && (
                             <span className="ml-4 text-xs bg-red-900/50 text-red-400 ring-1 ring-red-500/50 px-2 py-1 rounded-full flex items-center">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                                Offline
                             </span>
                        )}
                    </div>

                    <div className="hidden md:flex items-center space-x-2">
                        {currentUser ? (
                            <>
                                <NavButton onClick={() => setCurrentView('dashboard')} active={currentView === 'dashboard'}>
                                    Dashboard
                                </NavButton>

                                {currentUser.role === 'player' && (
                                    <>
                                        <NavButton onClick={() => setCurrentView('tournaments')} active={currentView === 'tournaments'}>
                                            Tournaments
                                        </NavButton>
                                        <NavButton onClick={() => setCurrentView('leagues')} active={currentView === 'leagues'}>
                                            Leagues
                                        </NavButton>
                                        <NavButton onClick={() => setCurrentView('mailing-lists')} active={currentView === 'mailing-lists'}>
                                            Preferences
                                        </NavButton>
                                        <NavButton onClick={() => setCurrentView('survey')} active={currentView === 'survey'}>
                                            Interests
                                        </NavButton>
                                    </>
                                )}

                                {currentUser.role === 'leagueOwner' && (
                                    <>
                                        <NavButton onClick={() => setCurrentView('my-leagues')} active={currentView === 'my-leagues'}>
                                            My Leagues
                                        </NavButton>
                                        <NavButton onClick={()=>{setCurrentView('my-tournaments')}} active={currentView==='my-tournaments'}>
                                            My Tournaments
                                        </NavButton>
                                        <NavButton onClick={() => setCurrentView('create-league')} active={currentView === 'create-league'}>
                                            Create League
                                        </NavButton>
                                        <NavButton onClick={()=>setCurrentView('applications')} active={currentView === 'applications'}>
                                            Applications
                                        </NavButton>
                                    </>
                                )}

                               {currentUser.role === 'operator' && (
                                    <>
                                        <NavButton onClick={() => setCurrentView('manage-users')} active={currentView === 'manage-users'}>Manage Users</NavButton>
                                        <NavButton onClick={() => setCurrentView('manage-games')} active={currentView === 'manage-games'}>Manage Games</NavButton>
                                        <NavButton onClick={() => setCurrentView('manage-rating-formulas')} active={currentView === 'manage-rating-formulas'}>Rating</NavButton>
                                    </>
                                )}

                                {/* Notification Bell */}
                                <div className="relative ml-2">
                                    <button 
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg relative transition-colors"
                                    >
                                        <Bell className="h-6 w-6" weight="duotone" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-slate-900">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown */}
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-20 border border-slate-700 ring-1 ring-white/5">
                                            <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                                                <h3 className="font-semibold text-slate-200">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button 
                                                        onClick={clearNotifications}
                                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-500 text-sm">
                                                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" weight="duotone" />
                                                        No new notifications
                                                    </div>
                                                ) : (
                                                    notifications.map((notif, idx) => (
                                                        <div key={idx} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                                                            <div className="flex items-start">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3 mt-0.5">
                                                                    <Info className="h-4 w-4 text-indigo-400" weight="duotone" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-200">
                                                                        {notif.title || 'Notification'}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                                        {notif.message}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 mt-2">
                                                                        {new Date().toLocaleTimeString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center pl-4 border-l border-white/10 ml-4 space-x-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-medium text-slate-300">{currentUser.name}</span>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400 bg-indigo-500/10 px-1.5 rounded leading-tight border border-indigo-500/20">
                                            {currentUser.role === 'leagueOwner' ? 'OWNER' : currentUser.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <SignOut className="h-5 w-5" weight="duotone" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <NavButton onClick={() => setCurrentView('home')} active={currentView === 'home'}>
                                    Home
                                </NavButton>
                                <NavButton onClick={() => setCurrentView('live')} active={currentView === 'live'}>
                                    Live
                                </NavButton>
                                <button
                                    onClick={() => setCurrentView('login')}
                                    className="px-4 py-2 text-slate-200 hover:text-white font-medium transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setCurrentView('register')}
                                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            {showMobileMenu ? <X className="h-6 w-6" weight="duotone" /> : <List className="h-6 w-6" weight="duotone" />}
                        </button>
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {currentUser ? (
                            <>
                                <MobileNavButton onClick={() => { setCurrentView('dashboard'); setShowMobileMenu(false); }}>
                                    Dashboard
                                </MobileNavButton>
                                {currentUser.role === 'player' && (
                                     <MobileNavButton onClick={() => { setCurrentView('tournaments'); setShowMobileMenu(false); }}>
                                        Browse Tournaments
                                    </MobileNavButton>
                                )}
                                <MobileNavButton onClick={() => { logout(); setShowMobileMenu(false); }}>
                                    Logout
                                </MobileNavButton>
                            </>
                        ) : (
                            <>
                                <MobileNavButton onClick={() => { setCurrentView('login'); setShowMobileMenu(false); }}>
                                    Login
                                </MobileNavButton>
                                <MobileNavButton onClick={() => { setCurrentView('register'); setShowMobileMenu(false); }}>
                                    Register
                                </MobileNavButton>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}