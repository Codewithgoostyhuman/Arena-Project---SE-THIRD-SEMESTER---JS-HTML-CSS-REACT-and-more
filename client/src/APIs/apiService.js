export const API_BASE = 'http://localhost:5000/api';

export const apiService = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('API Error:', {
                    endpoint,
                    status: response.status,
                    message: data.message,
                    errors: data.errors,
                    data: data
                });
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    },

    auth: {
        login: (email, password) =>
            apiService.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
        register: (userData) =>
            apiService.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            }),
        logout: () => apiService.request('/auth/logout', { method: 'POST' }),
        getMe: () => apiService.request('/auth/me'),
    },

    // ==================== PLAYER ENDPOINTS ====================
    players: {
        // Stats
        getStats: () => apiService.request('/players/stats'),
        
        // Leagues
        getMyLeagues: () => apiService.request('/players/my-leagues'),
        applyToLeague: (leagueId) => 
            apiService.request(`/players/league/${leagueId}/apply`, { method: 'POST' }),
        leaveLeague: (leagueId) => 
            apiService.request(`/players/league/${leagueId}/leave`, { method: 'POST' }),
        
        // Applications
        getMyApplications: () => apiService.request('/players/my-applications'),
        cancelApplication: (leagueId, applicationId) => 
            apiService.request(`/players/league/${leagueId}/application/${applicationId}`, { 
                method: 'DELETE' 
            }),
        
        // Tournaments - UPDATED
        getMyTournaments: () => apiService.request('/tournaments/my-tournaments'),
        getActiveTournaments: () => apiService.request('/players/active-tournaments'),
        getAvailableTournaments: () => apiService.request('/tournaments/available'),
        
        applyToTournament: (tournamentId) =>
            apiService.request(`/tournaments/${tournamentId}/apply`, { method: 'POST' }),
        
        cancelTournamentApplication: (tournamentId, applicationId) =>
            apiService.request(`/tournaments/${tournamentId}/application/${applicationId}`, { 
                method: 'DELETE' 
            }),
        
        leaveTournament: (tournamentId) =>
            apiService.request(`/tournaments/${tournamentId}/leave`, { 
                method: 'DELETE' 
            }),
        
        getMyTournamentApplications: () => 
            apiService.request('/tournaments/my-applications'),
        
        dropOutOfTournament: (tournamentId) =>
            apiService.request(`/players/tournament/${tournamentId}/drop-out`, { method: 'POST' }),
        
        forfeitTournament: (tournamentId) =>
            apiService.request(`/players/tournament/${tournamentId}/forfeit`, { method: 'POST' }),
        
        // Matches
        getMyMatches: () => apiService.request('/players/my-matches'),
        getUpcomingMatches: () => apiService.request('/players/my-matches/upcoming'),
        getLiveMatches: () => apiService.request('/players/my-matches/live'),
        getMatchSchedule: () => apiService.request('/players/match-schedule'),
        getMatchHistory: () => apiService.request('/players/match-history'),
        joinMatch: (matchId) =>
            apiService.request(`/players/matches/${matchId}/join`, { method: 'POST' }),
        makeMove: (matchId, moveData) =>
            apiService.request(`/players/matches/${matchId}/move`, { 
                method: 'POST', 
                body: JSON.stringify(moveData) 
            }),
        getMatchState: (matchId) => 
            apiService.request(`/players/matches/${matchId}/state`),
        forfeitMatch: (matchId) => 
            apiService.request(`/players/matches/${matchId}/forfeit`, { method: 'POST' }),
    },

    leagues: {
        getActive: () => apiService.request('/leagues/active'),
        getById: (id) => apiService.request(`/leagues/${id}`),
        create: (data) => apiService.request('/leagues', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },

    // ==================== TOURNAMENT ENDPOINTS - UPDATED ====================
    tournaments: {
        // Player routes
        getAvailable: () => apiService.request('/tournaments/available'),
        getPlayerTournaments: () => apiService.request('/tournaments/my-tournaments'),
        
        // Owner/Operator routes
        create: (tournamentData) => 
            apiService.request('/tournaments', { 
                method: 'POST', 
                body: JSON.stringify(tournamentData) 
            }),
        
        getMyTournaments: () => apiService.request('/tournaments/my'),
        
        update: (tournamentId, tournamentData) =>
            apiService.request(`/tournaments/${tournamentId}`, { 
                method: 'PUT', 
                body: JSON.stringify(tournamentData) 
            }),
        
        delete: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}`, { method: 'DELETE' }),
        
        complete: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}/complete`, { method: 'POST' }),
        
        updateApplicationStatus: (tournamentId, applicationId, action) =>
            apiService.request(`/tournaments/${tournamentId}/application/${applicationId}/${action}`, { 
                method: 'POST' 
            }),
        
        recordMatchResult: (tournamentId, matchId, resultData) =>
            apiService.request(`/tournaments/${tournamentId}/match/${matchId}/result`, { 
                method: 'POST', 
                body: JSON.stringify(resultData) 
            }),
        
        addExclusiveSponsor: (tournamentId, sponsorData) =>
            apiService.request(`/tournaments/${tournamentId}/sponsorship/exclusive`, { 
                method: 'POST', 
                body: JSON.stringify(sponsorData) 
            }),
        
        addAdvertisement: (tournamentId, adData) =>
            apiService.request(`/tournaments/${tournamentId}/advertisement`, { 
                method: 'POST', 
                body: JSON.stringify(adData) 
            }),
        
        notifyGroups: (tournamentId) =>
            apiService.request(`/tournaments/${tournamentId}/notify-groups`, { method: 'POST' }),
        
        kickoff: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}/kickoff`, { method: 'POST' }),
        
        // Shared/Public routes - NEW
        getById: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}`),
        
        getWinners: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}/winners`),
        
        getPlayers: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}/players`),
        
        getBrackets: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}/brackets`),
        
        getLeaderboard: (tournamentId) => 
            apiService.request(`/tournaments/${tournamentId}/leaderboard`),
    },

    public: {
        getLiveTournaments: () => apiService.request('/public/tournaments/live'),
        getUpcomingTournaments: () => apiService.request('/public/tournaments/upcoming'),
        getLiveMatches: () => apiService.request('/public/matches/live'),
        getAllGames: () => apiService.request('/public/games'),
    },

    operator: {
        getAllUsers: (role, status) => {
            const params = new URLSearchParams();
            if (role) params.append('role', role);
            if (status) params.append('status', status);
            const query = params.toString() ? `?${params.toString()}` : '';
            return apiService.request(`/operator/user${query}`);
        },
        getUserById: (id) => apiService.request(`/operator/user/${id}`),
        getPendingUsers: () => apiService.request(`/operator/user/pending`),
        getActiveUsers: () => apiService.request(`/operator/user/active`),
        updateUser: (id, data) => apiService.request(`/operator/user/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteUser: (id) => apiService.request(`/operator/user/${id}`, { method: 'DELETE' }),
        activateUserById: (id) => apiService.request(`/operator/user/activate/${id}`, { method: 'PATCH' }),
        deactivateUserById: (id) => apiService.request(`/operator/user/deactivate/${id}`, { method: 'PATCH' }),
        activateUserByName: (name) => apiService.request(`/operator/user/activate/name/${name}`, { method: 'PATCH' }),
        changeUserRole: (id, newRole) => apiService.request(`/operator/user/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ newRole }),
        }),
        approveUser: (id) => apiService.request(`/operator/user/approve/${id}`, { method: 'PATCH' }),
        rejectUser: (id) => apiService.request(`/operator/user/reject/${id}`, { method: 'PATCH' }),
        bulkApproveUsers: (userIds) => apiService.request('/operator/user/bulk-approve', {
            method: 'POST',
            body: JSON.stringify({ userIds }),
        }),

        // Game Management
        createGame: (data) => apiService.request('/operator/game', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateGame: (id, data) => apiService.request(`/operator/game/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteGame: (id) => apiService.request(`/operator/game/${id}`, { method: 'DELETE' }),
        getGameById: (id) => apiService.request(`/operator/game/${id}`),
        getAllGames: () => apiService.request('/operator/games'),

        // Rating Formula Management
        createRatingFormula: (data) => apiService.request('/operator/rating-formula', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateRatingFormula: (id, data) => apiService.request(`/operator/rating-formula/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteRatingFormula: (id) => apiService.request(`/operator/rating-formula/${id}`, { method: 'DELETE' }),
        getRatingFormulaById: (id) => apiService.request(`/operator/rating-formula/${id}`),
        getAllRatingFormulas: () => apiService.request('/operator/rating-formulas'),

        // Advertiser Management
        getPendingAdvertisers: () => apiService.request('/operator/advertiser/pending'),
        approveAdvertiser: (id) => apiService.request(`/operator/advertiser/approve/${id}`, { method: 'PATCH' }),
        rejectAdvertiser: (id) => apiService.request(`/operator/advertiser/reject/${id}`, { method: 'PATCH' }),

        // Statistics
        getSystemStatistics: () => apiService.request('/operator/statistics'),
        getDashboardStats: () => apiService.request('/operator/dashboard-stats'),
    },

    leagueOwner: {
        // League Applications
        getLeagueApplications: (leagueId = null, status = null) => {
            const params = new URLSearchParams();
            if (leagueId) params.append('leagueId', leagueId);
            if (status) params.append('status', status);
            const query = params.toString() ? `?${params.toString()}` : '';
            return apiService.request(`/league-owners/league/applications${query}`);
        },
        approveLeagueApplication: (applicationId) =>
            apiService.request(`/league-owners/league/application/${applicationId}/approve`, {
                method: 'PATCH',
            }),
        rejectLeagueApplication: (applicationId) =>
            apiService.request(`/league-owners/league/application/${applicationId}/reject`, {
                method: 'PATCH',
            }),

        // Tournament Applications
        getTournamentApplications: (tournamentId = null, status = null) => {
            const params = new URLSearchParams();
            if (tournamentId) params.append('tournamentId', tournamentId);
            if (status) params.append('status', status);
            const query = params.toString() ? `?${params.toString()}` : '';
            return apiService.request(`/league-owners/tournament/applications${query}`);
        },
        approveTournamentApplication: (applicationId) =>
            apiService.request(`/league-owners/tournament/application/${applicationId}/approve`, {
                method: 'PATCH',
            }),
        rejectTournamentApplication: (applicationId) =>
            apiService.request(`/league-owners/tournament/application/${applicationId}/reject`, {
                method: 'PATCH',
            }),

        // Leagues
        getMyLeagues: () => apiService.request('/leagues/my'),
        createLeague: (data) =>
            apiService.request('/leagues', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateLeague: (id, data) =>
            apiService.request(`/leagues/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteLeague: (id) =>
            apiService.request(`/leagues/${id}`, { method: 'DELETE' }),

        // Tournaments
        getMyTournaments: () => apiService.request('/tournaments/my'),
        createTournament: (data) =>
            apiService.request('/tournaments', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        updateTournament: (id, data) =>
            apiService.request(`/tournaments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        deleteTournament: (id) =>
            apiService.request(`/tournaments/${id}`, { method: 'DELETE' }),
    },
    matches: {
        // Get matches
        getAll: () => apiService.request('/matches'),
        getById: (matchId) => apiService.request(`/matches/${matchId}`),
        getMyMatches: () => apiService.request('/matches/my-matches'),
        getByLeague: (leagueId) => apiService.request(`/matches/league/${leagueId}`),
        getByTournament: (tournamentId) => apiService.request(`/matches/tournament/${tournamentId}`),
        getByGame: (gameId) => apiService.request(`/matches/game/${gameId}`),
        getState: (matchId) => apiService.request(`/matches/${matchId}/state`),
        
        // Match actions
        create: (matchData) => apiService.request('/matches', {
            method: 'POST',
            body: JSON.stringify(matchData)
        }),
        
        update: (matchId, matchData) => apiService.request(`/matches/${matchId}`, {
            method: 'PUT',
            body: JSON.stringify(matchData)
        }),
        
        delete: (matchId) => apiService.request(`/matches/${matchId}`, {
            method: 'DELETE'
        }),
        
        start: (matchId) => apiService.request(`/matches/${matchId}/start`, {
            method: 'PATCH'
        }),
        
        finish: (matchId) => apiService.request(`/matches/${matchId}/finish`, {
            method: 'PATCH'
        }),
        
        // Gameplay
        makeMove: (matchId, moveData) => apiService.request(`/matches/${matchId}/move`, {
            method: 'POST',
            body: JSON.stringify(moveData)
        }),
        
        spectate: (matchId) => apiService.request(`/matches/${matchId}/spectate`, {
            method: 'POST'
        })
    },
};