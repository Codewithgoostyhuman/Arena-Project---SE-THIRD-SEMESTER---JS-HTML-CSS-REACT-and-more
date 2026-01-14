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

export default function AuthenticatedViews({ currentView, setCurrentView ,setSelectedLeagueId ,selectedLeagueId}) {
    const { currentUser } = useAuth();

    switch (currentView) {
        case 'dashboard':
            return <DashboardView />;
        case 'tournaments':
            return currentUser.role === 'player' ? <PlayerTournamentsView /> : null;
        case 'leagues':
            return currentUser.role === 'player' ? <PlayerLeaguesView /> : null;
        case 'my-leagues':
            return currentUser.role === 'leagueOwner' ? <LeagueOwnerView 
            setCurrentView={setCurrentView} 
            setSelectedLeagueId={setSelectedLeagueId}
        />: null;
        case 'create-league':
            return currentUser.role === 'leagueOwner' ? <CreateLeagueView setCurrentView={setCurrentView} /> : null;
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
        default:
            return <DashboardView />;
    }
}