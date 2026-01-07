import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

//Base API - Backend
const API_BASE = 'http://localhost:5000';
//Fetch with authetication
const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    window.location.href = '/login';
    throw new Error('Authentication failed - please log in again');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ============================================
// Player Dashboard
// ============================================
export default function PlayerDashboard() {
  const [activeTab, setActiveTab] = useState('leagues');
  const [stats, setStats] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
//To updatde stats in RT
  useEffect(() => {
    loadStats();
  }, []);
// Update/Load Stats function
  const loadStats = async () => {
    try {
      const data = await fetchWithAuth('/player/stats');
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };
//Handle LogOut
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
//Component - Home
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-10 py-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Player Dashboard</h1>
            {user && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Welcome, {user.name}</p>
                {stats && (
                  <div className="flex gap-4 text-xs">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">🏆 {stats.wins || 0} Wins</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">📉 {stats.losses || 0} Losses</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">🤝 {stats.draws || 0} Draws</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">⭐ {stats.points || 0} Points</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">📊 {stats.winRate}% Win Rate</span>
                  </div>
                )}
              </div>
            )}
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
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            🔍 Browse Leagues
          </button>
          <button
            onClick={() => setActiveTab('myLeagues')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'myLeagues'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            🏆 My Leagues
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'tournaments'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            🎮 My Tournaments
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'available'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            🎯 Available Tournaments
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'applications'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            📨 Applications
          </button>
        </div>
      </nav>

      <main className="p-10">
        {activeTab === 'leagues' && <BrowseLeagues />}
        {activeTab === 'myLeagues' && <MyLeagues />}
        {activeTab === 'tournaments' && <MyTournaments />}
        {activeTab === 'available' && <AvailableTournaments />}
        {activeTab === 'applications' && <MyApplications />}
      </main>
    </div>
  );
}

// ============================================
// BROWSE LEAGUES
// ============================================
function BrowseLeagues() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
// To load updated leagues everytime
  useEffect(() => {
    loadLeagues();
  }, []);
  //Load Leagues function
  const loadLeagues = async () => {
    try {
      const data = await fetchWithAuth('/leagues');
      setLeagues(data.filter(l => l.status === 'active'));
    } catch (err) {
      console.error('Error loading leagues:', err);
    } finally {
      setLoading(false);
    }
  };
//Handle Application
  const handleApply = async (leagueId) => {
    try {
      await fetchWithAuth(`/league/${leagueId}/apply`, {
        method: 'POST'
      });
      alert('Application submitted successfully!');
      loadLeagues();
    } catch (err) {
      alert(err.message);
    }
  };
// Search bar - Filter leagues
  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading leagues...</div>;
//Component - Browse Leagues
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Browse Leagues</h2>
        <input
          type="text"
          placeholder="Search leagues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {filteredLeagues.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Leagues Available</h3>
          <p className="text-gray-600">Check back later for new leagues!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeagues.map(league => (
            <div key={league._id} className="bg-white p-5 rounded-lg shadow border-2 border-blue-100 hover:border-blue-300 transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{league.name}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>

              {league.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{league.description}</p>
              )}

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">🎮 Game:</span>
                  <span className="font-semibold">{league.game?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">👤 Owner:</span>
                  <span className="font-semibold">{league.owner?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">👥 Players:</span>
                  <span className="font-semibold">{league.players?.length || 0} / {league.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">🏆 Tournaments:</span>
                  <span className="font-semibold">{league.tournaments?.length || 0}</span>
                </div>
              </div>

              <button 
                onClick={() => handleApply(league._id)}
                disabled={league.players?.length >= league.maxPlayers}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {league.players?.length >= league.maxPlayers ? 'League Full' : 'Apply to Join'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MY LEAGUES
// ============================================
function MyLeagues() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
//To load up to date leagues user is in
  useEffect(() => {
    loadLeagues();
  }, []);
//LoAD League
  const loadLeagues = async () => {
    try {
      const data = await fetchWithAuth('/player/my-leagues');
      setLeagues(data);
    } catch (err) {
      console.error('Error loading leagues:', err);
    } finally {
      setLoading(false);
    }
  };
// Leave a league
  const handleLeave = async (leagueId) => {
    if (!confirm('Are you sure you want to leave this league?')) return;
    
    try {
      await fetchWithAuth(`/league/${leagueId}/leave`, {
        method: 'POST'
      });
      alert('Successfully left the league');
      loadLeagues();
    } catch (err) {
      alert('Error leaving league: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading your leagues...</div>;

  if (leagues.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Leagues Yet</h2>
        <p className="text-gray-600">Browse and join leagues to get started!</p>
      </div>
    );
  }
//Component - My Leagues - HTML CSS
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Leagues</h2>
        <span className="text-sm text-gray-600">Total: {leagues.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map(league => (
          <div key={league._id} className="bg-white p-5 rounded-lg shadow border-2 border-green-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold">{league.name}</h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Member
              </span>
            </div>

            {league.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{league.description}</p>
            )}

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">🎮 Game:</span>
                <span className="font-semibold">{league.game?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">👤 Owner:</span>
                <span className="font-semibold">{league.owner?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">👥 Players:</span>
                <span className="font-semibold">{league.players?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">📊 Rating:</span>
                <span className="font-semibold">{league.ratingFormula?.name || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => handleLeave(league._id)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
            >
              Leave League
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MY TOURNAMENTS
// ============================================
function MyTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
//To load upto date my tournaments
  useEffect(() => {
    loadTournaments();
  }, []);
//Load My Tournaments
  const loadTournaments = async () => {
    try {
      const data = await fetchWithAuth('/player/my-tournaments');
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading tournaments...</div>;

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Tournaments Yet</h2>
        <p className="text-gray-600">Join leagues and participate in tournaments!</p>
      </div>
    );
  }
//Component - My Tournaments - HTML CSS
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Tournaments</h2>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Upcoming: {tournaments.filter(t => t.status === 'upcoming').length}</span>
          <span>Ongoing: {tournaments.filter(t => t.status === 'ongoing').length}</span>
          <span>Finished: {tournaments.filter(t => t.status === 'finished').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <div key={tournament._id} className="bg-white p-5 rounded-lg shadow border-2 border-purple-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold">{tournament.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                tournament.status === 'ongoing' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {tournament.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">🏆 League:</span>
                <span className="font-semibold">{tournament.league?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">🎮 Game:</span>
                <span className="font-semibold">{tournament.league?.game?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">📋 Style:</span>
                <span className="font-semibold">{tournament.style}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">👥 Players:</span>
                <span className="font-semibold">{tournament.players?.length || 0} / {tournament.maxPlayers}</span>
              </div>
              {tournament.winners && tournament.winners.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">🥇 Winner:</span>
                  <span className="font-semibold">{tournament.winners[0]?.name}</span>
                </div>
              )}
            </div>

            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm font-medium">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// AVAILABLE TOURNAMENTS
// ============================================
function AvailableTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
//To load up to date tournaments - that player is not a part of already
  useEffect(() => {
    loadTournaments();
  }, []);
// Load Tournaments that player is not a part of
  const loadTournaments = async () => {
    try {
      const data = await fetchWithAuth('/player/available-tournaments');
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };
//Handle Application in the tournament
  const handleJoin = async (tournamentId) => {
    try {
      await fetchWithAuth(`/tournament/${tournamentId}/apply`, {
        method: 'POST'
      });
      alert('Successfully joined tournament!');
      loadTournaments();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading tournaments...</div>;

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Available Tournaments</h2>
        <p className="text-gray-600">Join more leagues to see available tournaments!</p>
      </div>
    );
  }
//Component - Available Tournaments - HTML CSS
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Available Tournaments</h2>
        <span className="text-sm text-gray-600">Found: {tournaments.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <div key={tournament._id} className="bg-white p-5 rounded-lg shadow border-2 border-yellow-100 hover:border-yellow-300 transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold">{tournament.name}</h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Open
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">🏆 League:</span>
                <span className="font-semibold">{tournament.league?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">🎮 Game:</span>
                <span className="font-semibold">{tournament.league?.game?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">📋 Style:</span>
                <span className="font-semibold">{tournament.style}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">👥 Spots:</span>
                <span className="font-semibold">{tournament.maxPlayers - (tournament.players?.length || 0)} left</span>
              </div>
              {tournament.startDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">📅 Starts:</span>
                  <span className="font-semibold">{new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleJoin(tournament._id)}
              disabled={tournament.players?.length >= tournament.maxPlayers}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {tournament.players?.length >= tournament.maxPlayers ? 'Tournament Full' : 'Join Tournament'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MY APPLICATIONS
// ============================================
function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
//To load up to date applications of the player/user
  useEffect(() => {
    loadApplications();
  }, []);
//Load Applications
  const loadApplications = async () => {
    try {
      const data = await fetchWithAuth('/player/my-applications');
      setApplications(data);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };
//Handle cancel application
  const handleCancel = async (leagueId, applicationId) => {
    if (!confirm('Cancel this application?')) return;
    
    try {
      await fetchWithAuth(`/league/${leagueId}/application/${applicationId}`, {
        method: 'DELETE'
      });
      alert('Application cancelled');
      loadApplications();
    } catch (err) {
      alert('Error cancelling application: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading applications...</div>;

  const pendingApps = applications.filter(app => app.status === 'pending');
  const reviewedApps = applications.filter(app => app.status !== 'pending');

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Applications</h2>
        <p className="text-gray-600">Apply to leagues to see your applications here.</p>
      </div>
    );
  }
//Component - Applications - HTML CSS
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Applications</h2>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Pending: {pendingApps.length}</span>
          <span>Reviewed: {reviewedApps.length}</span>
        </div>
      </div>

      {pendingApps.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-3">Pending Applications</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">League</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingApps.map(app => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 text-sm font-medium">{app.league.name}</td>
                    <td className="px-6 py-4 text-sm">{app.league.game?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCancel(app.league._id, app._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reviewedApps.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-3">Reviewed Applications</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">League</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewedApps.map(app => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 text-sm font-medium">{app.league.name}</td>
                    <td className="px-6 py-4 text-sm">{app.league.game?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}