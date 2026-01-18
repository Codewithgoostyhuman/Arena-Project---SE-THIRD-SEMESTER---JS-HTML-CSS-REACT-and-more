import React from 'react';
import { useAuth } from '../../Auth/AuthContext';
import DashboardView from './DashboardView';
import PlayerTournamentsView from './PlayerTournamentView';
import PlayerLeaguesView from './PlayerLeaguesView';
import LeagueOwnerView from './LeagueOwnerView';
import CreateLeagueView from './CreateLeagueView';
import ManageUsersView from './manageUsersView';
import ManageGamesView from './ManageGamesView';
import ManageRatingFormulasView from './ManangeRatingView';
import CreateTournamentView from './CreateTournamentView';
import MyTournamentsView from './MyTournamentsView';
import ApplicationsView from './LeagueOwnerApplicationView';
import MatchView from './MatchView'; // NEW: Import MatchView

export default function AuthenticatedViews({ 
    currentView, 
    setCurrentView,
    setSelectedLeagueId,
    selectedLeagueId,
    selectedMatchId, // NEW: Receive match ID
    setSelectedMatchId // NEW: Receive setter
}) {
    const { currentUser } = useAuth();

    switch (currentView) {
        case 'dashboard':
            return <DashboardView setCurrentView={setCurrentView} setSelectedMatchId={setSelectedMatchId} />;
        
        case 'tournaments':
            return currentUser.role === 'player' ? (
                <PlayerTournamentsView setCurrentView={setCurrentView} setSelectedMatchId={setSelectedMatchId} />
            ) : null;
        
        case 'leagues':
            return currentUser.role === 'player' ? (
                <PlayerLeaguesView setCurrentView={setCurrentView} setSelectedMatchId={setSelectedMatchId} />
            ) : null;
        
        case 'my-leagues':
            return currentUser.role === 'leagueOwner' ? (
                <LeagueOwnerView 
                    setCurrentView={setCurrentView} 
                    setSelectedLeagueId={setSelectedLeagueId}
                    setSelectedMatchId={setSelectedMatchId} // NEW: Pass to league view
                />
            ) : null;
        
        case 'create-league':
            return currentUser.role === 'leagueOwner' ? (
                <CreateLeagueView setCurrentView={setCurrentView} />
            ) : null;
        
        case 'manage-users':
            return currentUser.role === 'operator' ? <ManageUsersView /> : null;
        
        case 'manage-games':
            return currentUser.role === 'operator' ? <ManageGamesView /> : null;
        
        case 'manage-rating-formulas':
            return currentUser.role === 'operator' ? <ManageRatingFormulasView /> : null;
        
        case 'create-tournament':
            return currentUser.role === 'leagueOwner' ? (
                <CreateTournamentView 
                    setCurrentView={setCurrentView}
                    selectedLeagueId={selectedLeagueId}
                />
            ) : null;
        
        case 'my-tournaments':
            return currentUser.role === 'leagueOwner' ? (
                <MyTournamentsView 
                    setCurrentView={setCurrentView}
                    setSelectedMatchId={setSelectedMatchId} // NEW: Pass to tournaments view
                />
            ) : null;
        
        case 'applications':
            return currentUser.role === 'leagueOwner' ? (
                <ApplicationsView setCurrentView={setCurrentView} />
            ) : null;
        
        // NEW: Match view case
        case 'match':
            return selectedMatchId ? (
                <MatchView 
                    matchId={selectedMatchId}
                    setCurrentView={setCurrentView}
                />
            ) : (
                <DashboardView setCurrentView={setCurrentView} />
            );
        
        default:
            return <DashboardView setCurrentView={setCurrentView} setSelectedMatchId={setSelectedMatchId} />;
    }
}