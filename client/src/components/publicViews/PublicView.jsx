import React from "react";
import LoginView from "./LoginView";
import RegisterView from "./RegisterView";
import HomeView from "./HomeView";
import LiveMatchesView from "./LiveMatchesView";

export default function PublicViews({ currentView, setCurrentView }) {
    switch (currentView) {
        case 'login':
            return <LoginView setCurrentView={setCurrentView} />;
        case 'register':
            return <RegisterView setCurrentView={setCurrentView} />;
        case 'live':
            return <LiveMatchesView />;
        default:
            return <HomeView setCurrentView={setCurrentView} />;
    }
}