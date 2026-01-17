    import React, { useState } from 'react';
    import { useAuth } from './Auth/AuthContext';
    import LoadingScreen from './components/reuseableComponents/LoadingScreen';
    import Navigation
    from './components/navigation/navigation';
    import PublicViews from './components/publicViews/PublicView';
    import AuthenticatedViews from './components/authenticatedViews/AuthenticatedViews';
    import { AuthProvider } from './Auth/AuthContext';
    export default function ArenaApp() {
        return (
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        );
    }

    function AppContent() {
        const { currentUser, loading } = useAuth();
        const [currentView, setCurrentView] = useState('home');
        const [showMobileMenu, setShowMobileMenu] = useState(false);
        const [selectedLeagueId, setSelectedLeagueId] = useState(null);

        if (loading) {
            return <LoadingScreen />;
        }

        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    showMobileMenu={showMobileMenu}
                    setShowMobileMenu={setShowMobileMenu}
                />

                <main className="pt-16">
                    {!currentUser ? (
                        <PublicViews currentView={currentView} setCurrentView={setCurrentView} />
                    ) : (
                        <AuthenticatedViews currentView={currentView} setCurrentView={setCurrentView} selectedLeagueId={selectedLeagueId} setSelectedLeagueId={setSelectedLeagueId} />
                    )}
                </main>
            </div>
        );
    }