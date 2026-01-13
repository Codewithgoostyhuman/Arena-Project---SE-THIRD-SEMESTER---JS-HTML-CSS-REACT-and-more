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

    players: {
        getMyLeagues: () => apiService.request('/players/my-leagues'),
        getMyTournaments: () => apiService.request('/players/my-tournaments'),
        getAvailableTournaments: () => apiService.request('/players/available-tournaments'),
        applyToLeague: (leagueId) =>
            apiService.request(`/players/league/${leagueId}/apply`, { method: 'POST' }),
        applyToTournament: (tournamentId) =>
            apiService.request(`/players/tournament/${tournamentId}/apply`, { method: 'POST' }),
        getStats: () => apiService.request('/players/stats'),
        getMyMatches: () => apiService.request('/players/my-matches'),
        getMatchSchedule: () => apiService.request('/players/match-schedule'),
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
        getAllUsers: () => apiService.request('/operator/users'),
        approveUser: (userId) => apiService.request(`/operator/users/${userId}/activate`, { method: 'POST' }),
        createGame: (data) => apiService.request('/operator/games', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
};