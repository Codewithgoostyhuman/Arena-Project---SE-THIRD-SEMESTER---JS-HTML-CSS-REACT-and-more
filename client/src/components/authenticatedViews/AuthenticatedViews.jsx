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
import LiveMatchesView from '../publicViews/LiveMatchesView';
import MatchView from './MatchView';
import TournamentBracketView from './TournamentBracketView'; // NEW: Import TournamentBracketView
import ManageTournamentView from './ManageTournamentView';
import MailingListManagement from './MailingListManagement';
import MarketingSurvey from './MarketingSurvey';

export default function AuthenticatedViews({ 
    currentView, 
    setCurrentView,
    setSelectedLeagueId,
    selectedLeagueId,
    selectedMatchId, 
    setSelectedMatchId,
    selectedTournamentId, // NEW: Receive tournament ID
    setSelectedTournamentId // NEW: Receive setter
}) {
    const { currentUser } = useAuth();

    switch (currentView) {
        case 'dashboard':
            return <DashboardView setCurrentView={setCurrentView} setSelectedMatchId={setSelectedMatchId} />;
        
        case 'tournaments':
            return currentUser.role === 'player' ? (
                <PlayerTournamentsView 
                    setCurrentView={setCurrentView} 
                    setSelectedMatchId={setSelectedMatchId}
                    setSelectedTournamentId={setSelectedTournamentId} // Pass setter to allow navigation
                />
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
                    setSelectedMatchId={setSelectedMatchId}
                    setSelectedTournamentId={setSelectedTournamentId}
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
                    setSelectedMatchId={setSelectedMatchId}
                    setSelectedTournamentId={setSelectedTournamentId}
                />
            ) : null;
        
        case 'manage-tournament':
            return (currentUser.role === 'leagueOwner' || currentUser.role === 'operator') && selectedTournamentId ? (
                <ManageTournamentView 
                    tournamentId={selectedTournamentId}
                    setCurrentView={setCurrentView}
                />
            ) : (
                <DashboardView setCurrentView={setCurrentView} />
            );
        
        case 'applications':
            return currentUser.role === 'leagueOwner' ? (
                <ApplicationsView setCurrentView={setCurrentView} />
            ) : null;
        
        case 'live':
            return (
                <LiveMatchesView 
                    setCurrentView={setCurrentView} 
                    setSelectedMatchId={setSelectedMatchId} 
                />
            );

        case 'match':
            return selectedMatchId ? (
                <MatchView 
                    matchId={selectedMatchId}
                    setCurrentView={setCurrentView}
                />
            ) : (
                <DashboardView setCurrentView={setCurrentView} />
            );

        // NEW: Tournament bracket view case
        case 'tournament-bracket':
            return selectedTournamentId ? (
                <TournamentBracketView 
                    tournamentId={selectedTournamentId}
                    setCurrentView={setCurrentView}
                    setSelectedMatchId={setSelectedMatchId}
                />
            ) : (
                <DashboardView setCurrentView={setCurrentView} />
            );
        
        case 'mailing-lists':
            return <MailingListManagement />;
        
        case 'survey':
            return <MarketingSurvey />;
        
        default:
            return <DashboardView setCurrentView={setCurrentView} setSelectedMatchId={setSelectedMatchId} />;
    }
}