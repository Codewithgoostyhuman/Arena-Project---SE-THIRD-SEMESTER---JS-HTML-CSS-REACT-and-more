import { Menu,X ,Trophy,LogOut } from "lucide-react";
import { useAuth } from "../../Auth/AuthContext";
import NavButton from "./navButton";
import MobileNavButton from "./mobileNavButton";
export default function Navigation({ currentView, setCurrentView, showMobileMenu, setShowMobileMenu }) {
    const { currentUser, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
                        <Trophy className="h-8 w-8 text-indigo-600" />
                        <span className="ml-2 text-2xl font-bold text-gray-900">ARENA</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
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
                                            Manage Applications
                                        </NavButton>
                                    </>
                                )}

                               {currentUser.role === 'operator' && (
    <>
        <button onClick={() => setCurrentView('manage-users')}>Manage Users</button>
        <button onClick={() => setCurrentView('manage-games')}>Manage Games</button>
        <button onClick={() => setCurrentView('manage-rating-formulas')}>Rating Formulas</button>
    </>
)}

                                <div className="flex items-center space-x-2 ml-4">
                                    <span className="text-sm text-gray-700">{currentUser.name}</span>
                                    <button
                                        onClick={logout}
                                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                    >
                                        <LogOut className="h-5 w-5" />
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
                                    className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setCurrentView('register')}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900"
                        >
                            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {currentUser ? (
                            <>
                                <MobileNavButton onClick={() => { setCurrentView('dashboard'); setShowMobileMenu(false); }}>
                                    Dashboard
                                </MobileNavButton>
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