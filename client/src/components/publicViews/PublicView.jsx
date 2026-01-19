import React from "react";
import LoginView from "./LoginView";
import RegisterView from "./RegisterView";
import HomeView from "./HomeView";
import LiveMatchesView from "./LiveMatchesView";
import MatchView from "../authenticatedViews/MatchView";

export default function PublicViews({ currentView, setCurrentView, selectedMatchId, setSelectedMatchId }) {
    switch (currentView) {
        case 'login':
            return <LoginView setCurrentView={setCurrentView} />;
        case 'register':
            return <RegisterView setCurrentView={setCurrentView} />;
        case 'live':
            return <LiveMatchesView setCurrentView={setCurrentView} setSelectedMatchId={setSelectedMatchId} />;
        case 'match':
            return selectedMatchId ? (
                <MatchView 
                    matchId={selectedMatchId}
                    setCurrentView={setCurrentView}
                />
            ) : (
                <HomeView setCurrentView={setCurrentView} />
            );
        default:
            return <HomeView setCurrentView={setCurrentView} />;
    }
}