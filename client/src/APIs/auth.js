import axios from "axios";
import axios from "axios";

// Single axios instance with credentials enabled
const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // Send cookies with every request
});

// ============================================
// AUTH ENDPOINTS
// ============================================
export const login = (credentials) => API.post("/login", credentials);
export const logout = () => API.post("/logout");
export const getCurrentUser = () => API.get("/me");

// ============================================
// USER ENDPOINTS (Public)
// ============================================
export const getUsers = () => API.get("/users");
export const getUserById = (id) => API.get(`/user/id/${id}`);
export const getUserByName = (name) => API.get(`/user/name/${name}`);

// ============================================
// USER MANAGEMENT (Auth Required)
// ============================================
export const createUser = (userData) => API.post("/register", userData);
export const updateUser = (id, userData) => API.put(`/user/${id}`, userData);
export const deleteUser = (id) => API.delete(`/user/${id}`);
export const activateUser = (id) => API.patch(`/user/activate/${id}`);
export const deactivateUser = (id) => API.patch(`/user/deactivate/${id}`);
export const activateUserByName = (name) => API.patch(`/user/activate/name/${name}`);

// ============================================
// LEAGUE ENDPOINTS
// ============================================
export const approveLeagueApplication = (leagueId, applicationId) => 
  API.post(`/league/${leagueId}/approve`, { applicationId });

// ============================================
// TOURNAMENT ENDPOINTS
// ============================================
export const approveTournamentApplication = (tournamentId, applicationId) => 
  API.post(`/tournament/${tournamentId}/approve`, { applicationId });
// ============================================
// GAME ENDPOINTS (Operator Only)
// ============================================
export const getGames = () => API.get("/games");
export const getGameById = (id) => API.get(`/game/${id}`);
export const createGame = (gameData) => API.post("/game", gameData);
export const updateGame = (id, gameData) => API.put(`/game/${id}`, gameData);
export const deleteGame = (id) => API.delete(`/game/${id}`);

// ============================================
// TOURNAMENT STYLE ENDPOINTS
// ============================================
export const getTournamentStyles = () => API.get("/tournament-styles");

// ============================================
// RATING FORMULA ENDPOINTS (Operator Only)
// ============================================
export const getRatingFormulas = () => API.get("/rating-formulas");
export const getRatingFormulaById = (id) => API.get(`/rating-formula/${id}`);
export const createRatingFormula = (formulaData) => API.post("/rating-formula", formulaData);
export const updateRatingFormula = (id, formulaData) => API.put(`/rating-formula/${id}`, formulaData);
export const deleteRatingFormula = (id) => API.delete(`/rating-formula/${id}`);
export default API;