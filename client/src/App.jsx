import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth/AuthContext';
import LoadingScreen from './components/reuseableComponents/LoadingScreen';
import Navigation from './components/navigation/Navigation';
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
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    // Debug: Log state changes
    useEffect(() => {
        console.log('App State Changed:', {
            currentView,
            selectedMatchId,
            currentUser: currentUser?.name
        });
    }, [currentView, selectedMatchId, currentUser]);

    // Set initial view to dashboard when user logs in
    useEffect(() => {
        if (currentUser && currentView === 'home') {
            console.log('User logged in, setting view to dashboard');
            setCurrentView('dashboard');
        }
    }, [currentUser]);

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
                    <PublicViews 
                        currentView={currentView} 
                        setCurrentView={setCurrentView} 
                        selectedMatchId={selectedMatchId}
                        setSelectedMatchId={setSelectedMatchId}
                    />
                ) : (
                    <AuthenticatedViews 
                        currentView={currentView} 
                        setCurrentView={setCurrentView} 
                        selectedLeagueId={selectedLeagueId} 
                        setSelectedLeagueId={setSelectedLeagueId}
                        selectedMatchId={selectedMatchId}
                        setSelectedMatchId={setSelectedMatchId}
                    />
                )}
            </main>
        </div>
    );
}