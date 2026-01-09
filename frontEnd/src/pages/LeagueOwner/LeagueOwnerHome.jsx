import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
import Applications from './Applications';
import MyLeagues from './MyLeagues';
import CreateLeague from './CreateLeague';
import Tournaments from './Tournaments';

const API_BASE = 'http://localhost:5000';

// Fetch with Auth
export const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export default function LeagueOwnerDashboard() {
  const [activeTab, setActiveTab] = useState('leagues');
  const [selectedLeague, setSelectedLeague] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-10 py-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">League Owner Dashboard</h1>
            {user && <p className="text-sm text-gray-600 mt-1">Welcome, {user.name}</p>}
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-10 py-5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('leagues')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'leagues'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            🏆 My Leagues
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            ➕ Create League
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'applications'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            📋 Applications
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'tournaments'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            🎮 Tournaments
          </button>
        </div>
      </nav>

      <main className="p-10">
        {activeTab === 'leagues' && <MyLeagues setSelectedLeague={setSelectedLeague} setActiveTab={setActiveTab} fetchWithAuth={fetchWithAuth} />}
        {activeTab === 'create' && <CreateLeague setActiveTab={setActiveTab} fetchWithAuth={fetchWithAuth}/>}
        {activeTab === 'applications' && <Applications />}
        {activeTab === 'tournaments' && <Tournaments selectedLeague={selectedLeague} setSelectedLeague={setSelectedLeague} fetchWithAuth={fetchWithAuth}/>}
      </main>
    </div>
  );
}

