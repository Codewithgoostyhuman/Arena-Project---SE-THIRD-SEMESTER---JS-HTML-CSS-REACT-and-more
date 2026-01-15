

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
                errors: data.errors, // validation errors
                data: data
            });
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}
,

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
  players : {
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
    
    // Tournaments
    getMyTournaments: () => apiService.request('/players/my-tournaments'),
    getActiveTournaments: () => apiService.request('/players/active-tournaments'),
    getAvailableTournaments: () => apiService.request('/players/available-tournaments'),
    applyToTournament: (tournamentId) => 
      apiService.request(`/players/tournament/${tournamentId}/apply`, { method: 'POST' }),
    dropOutOfTournament: (tournamentId) => 
      apiService.request(`/players/tournament/${tournamentId}/drop-out`, { method: 'POST' }),
    forfeitTournament: (tournamentId) => 
      apiService.request(`/players/tournament/${tournamentId}/forfeit`, { method: 'POST' }),
    canDropOut: (tournamentId) => 
      apiService.request(`/players/tournament/${tournamentId}/can-drop-out`),
    
    // Matches
    getMyMatches: () => apiService.request('/players/my-matches'),
    getUpcomingMatches: () => apiService.request('/players/my-matches/upcoming'),
    getLiveMatches: () => apiService.request('/players/my-matches/live'),
    getMatchSchedule: () => apiService.request('/players/match-schedule'),
    getMatchHistory: () => apiService.request('/players/match-history'),
    
    // Match actions
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

    tournaments: {
        create: (data) => apiService.request('/tournaments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },

    public: {
        getLiveTournaments: () => apiService.request('/public/tournaments/live'),
        getUpcomingTournaments: () => apiService.request('/public/tournaments/upcoming'),
        getLiveMatches: () => apiService.request('/public/matches/live'),
        getAllGames: () => apiService.request('/public/games'),
    },

    operator: {
        // User Management
        // User Management - FIXED ENDPOINTS
        getAllUsers: (role, status) => {
            const params = new URLSearchParams();
            if (role) params.append('role', role);
            if (status) params.append('status', status);
            const query = params.toString() ? `?${params.toString()}` : '';
            return apiService.request(`/operator/user${query}`); // Changed from /users to /user
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
        return apiService.request(`/league-owner/league/applications${query}`);
    },
    approveLeagueApplication: (applicationId) =>
        apiService.request(`/league-owner/league/application/${applicationId}/approve`, {
            method: 'PATCH',
        }),
    rejectLeagueApplication: (applicationId) =>
        apiService.request(`/league-owner/league/application/${applicationId}/reject`, {
            method: 'PATCH',
        }),

    // Tournament Applications
    getTournamentApplications: (tournamentId = null, status = null) => {
        const params = new URLSearchParams();
        if (tournamentId) params.append('tournamentId', tournamentId);
        if (status) params.append('status', status);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiService.request(`/league-owner/tournament/applications${query}`);
    },
    approveTournamentApplication: (applicationId) =>
        apiService.request(`/league-owner/tournament/application/${applicationId}/approve`, {
            method: 'PATCH',
        }),
    rejectTournamentApplication: (applicationId) =>
        apiService.request(`/league-owner/tournament/application/${applicationId}/reject`, {
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
    // getPendingApplicationsCount: (id)=>{
    //     apiService.request(`/leagues/${id}/pending-applicatins-count`)
    // }
},
};
