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

export default function AuthenticatedViews({ currentView, setCurrentView }) {
    const { currentUser } = useAuth();

    switch (currentView) {
        case 'dashboard':
            return <DashboardView />;
        case 'tournaments':
            return currentUser.role === 'player' ? <PlayerTournamentsView /> : null;
        case 'leagues':
            return currentUser.role === 'player' ? <PlayerLeaguesView /> : null;
        case 'my-leagues':
            return currentUser.role === 'leagueOwner' ? <LeagueOwnerView /> : null;
        case 'create-league':
            return currentUser.role === 'leagueOwner' ? <CreateLeagueView setCurrentView={setCurrentView} /> : null;
        case 'manage-users':
            return currentUser.role === 'operator' ? <ManageUsersView /> : null;
        case 'manage-games':
            return currentUser.role === 'operator' ? <ManageGamesView /> : null;
        case 'manage-rating-formulas':
            return currentUser.role === 'operator' ? <ManageRatingFormulasView /> : null;
        default:
            return <DashboardView />;
    }
}