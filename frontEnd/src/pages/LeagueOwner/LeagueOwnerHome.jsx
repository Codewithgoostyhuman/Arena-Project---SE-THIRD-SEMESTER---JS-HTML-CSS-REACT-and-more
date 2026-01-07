import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const API_BASE = 'http://localhost:5000';

// Fetch with Auth
const fetchWithAuth = async (url, options = {}) => {
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
        {activeTab === 'leagues' && <MyLeagues setSelectedLeague={setSelectedLeague} setActiveTab={setActiveTab} />}
        {activeTab === 'create' && <CreateLeague setActiveTab={setActiveTab} />}
        {activeTab === 'applications' && <Applications />}
        {activeTab === 'tournaments' && <Tournaments selectedLeague={selectedLeague} setSelectedLeague={setSelectedLeague} />}
      </main>
    </div>
  );
}

// ============================================
// MY LEAGUES
// ============================================
function MyLeagues({ setSelectedLeague, setActiveTab }) {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  //Loas Leagues
  const loadLeagues = async () => {
    try {
      const data = await fetchWithAuth('/leagues/my-leagues');
      setLeagues(data);
    } catch (err) {
      console.error('Error loading leagues:', err);
    } finally {
      setLoading(false);
    }
  };
//Handle Delete League
  const handleDelete = async (leagueId) => {
    if (!confirm('Are you sure you want to delete this league?')) return;
    try {
      await fetchWithAuth(`/league/${leagueId}`, { method: 'DELETE' });
      loadLeagues();
    } catch (err) {
      alert('Error deleting league');
    }
  };
//Handle View Tournament
  const handleViewTournaments = (league) => {
    setSelectedLeague(league);
    setActiveTab('tournaments');
  };

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading your leagues...</div>;

  if (leagues.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Leagues Yet</h2>
        <p className="text-gray-600 mb-6">Create your first league to get started!</p>
        <button 
          onClick={() => setActiveTab('create')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          Create League
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Leagues</h2>
        <div className="flex gap-5 text-sm text-gray-600">
          <span>Total Leagues: {leagues.length}</span>
          <span>Active: {leagues.filter(l => l.status === 'active').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map(league => (
          <div key={league._id} className="bg-white p-5 rounded-lg shadow border-2 border-purple-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold">{league.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                league.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {league.status}
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
                <span className="text-gray-500">📊 Rating:</span>
                <span className="font-semibold">{league.ratingFormula?.name || 'N/A'}</span>
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

            <div className="flex gap-2">
              <button 
                onClick={() => handleViewTournaments(league)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
              >
                View Tournaments
              </button>
              <button 
                onClick={() => handleDelete(league._id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CREATE LEAGUE
// ============================================
function CreateLeague({ setActiveTab }) {
  const [games, setGames] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game: '',
    ratingFormula: '',
    maxPlayers: 64
  });

  useEffect(() => {
    loadGamesAndFormulas();
  }, []);

  const loadGamesAndFormulas = async () => {
  try {
    const [gamesData, formulasData] = await Promise.all([
      fetchWithAuth('/games'),
      fetchWithAuth('/rating-formulas')
    ]);
    
    const activeGames = gamesData.filter(g => g.status === 'active');
    const activeFormulas = formulasData.filter(f => f.status === 'active');
    
    setGames(activeGames);
    setFormulas(activeFormulas);
    
    if (activeGames.length > 0) {
      setFormData(prev => ({ ...prev, game: activeGames[0]._id }));
    }
    if (activeFormulas.length > 0) {
      const defaultFormula = activeFormulas.find(f => f.isDefault) || activeFormulas[0];
      setFormData(prev => ({ ...prev, ratingFormula: defaultFormula._id }));
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.game || !formData.ratingFormula) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await fetchWithAuth('/league', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('League created successfully!');
      setActiveTab('leagues');
    } catch (err) {
      alert('Error creating league: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create New League</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">League Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Premier TicTacToe League"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-24"
            placeholder="Describe your league..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Game *</label>
            <select
              value={formData.game}
              onChange={(e) => setFormData({...formData, game: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a game</option>
              {games.map(game => (
                <option key={game._id} value={game._id}>
                  {game.name} ({game.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating Formula *</label>
            <select
              value={formData.ratingFormula}
              onChange={(e) => setFormData({...formData, ratingFormula: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a formula</option>
              {formulas.map(formula => (
                <option key={formula._id} value={formula._id}>
                  {formula.name} (W:{formula.winnerScore} D:{formula.drawScore} L:{formula.loserScore})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Players</label>
          <input
            type="number"
            value={formData.maxPlayers}
            onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="4"
            max="256"
          />
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => setActiveTab('leagues')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create League'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================
// APPLICATIONS
// ============================================
function Applications() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await fetchWithAuth('/leagues/my-leagues');
      const leaguesWithApps = data.filter(league => 
        league.applications && league.applications.length > 0
      );
      setLeagues(leaguesWithApps);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leagueId, applicationId) => {
    try {
      await fetchWithAuth(`/league/${leagueId}/approve-application`, {
        method: 'POST',
        body: JSON.stringify({ applicationId })
      });
      loadApplications();
    } catch (err) {
      alert('Error approving application');
    }
  };

  const handleReject = async (leagueId, applicationId) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      await fetchWithAuth(`/league/${leagueId}/reject-application`, {
        method: 'POST',
        body: JSON.stringify({ applicationId })
      });
      loadApplications();
    } catch (err) {
      alert('Error rejecting application');
    }
  };

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading applications...</div>;

  const pendingCount = leagues.reduce((total, league) => 
    total + league.applications.filter(app => app.status === 'pending').length, 0
  );

  if (leagues.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Applications</h2>
        <p className="text-gray-600">When players apply to join your leagues, they will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Player Applications</h2>
        <div className="text-sm text-gray-600">
          <span>Pending: {pendingCount}</span>
        </div>
      </div>

      {leagues.map(league => (
        <div key={league._id} className="mb-8">
          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {league.applications.map(app => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 text-sm">{app.player?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(league._id, app._id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(league._id, app._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {app.status !== 'pending' && app.reviewedAt && (
                        <span className="text-xs text-gray-500">
                          Reviewed {new Date(app.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// TOURNAMENTS
// ============================================
function Tournaments({ selectedLeague, setSelectedLeague }) {
  const [leagues, setLeagues] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTournaments(selectedLeague._id);
    }
  }, [selectedLeague]);

  const loadLeagues = async () => {
    try {
      const data = await fetchWithAuth('/leagues/my-leagues');
      setLeagues(data);
      if (data.length > 0 && !selectedLeague) {
        setSelectedLeague(data[0]);
      }
    } catch (err) {
      console.error('Error loading leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTournaments = async (leagueId) => {
    try {
      const data = await fetchWithAuth(`/league/${leagueId}/tournaments`);
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    }
  };


  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading tournaments...</div>;

  if (leagues.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Leagues</h2>
        <p className="text-gray-600">Create a league first before creating tournaments.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-3">Tournaments</h2>
          <select
            value={selectedLeague?._id || ''}
            onChange={(e) => {
              const league = leagues.find(l => l._id === e.target.value);
              setSelectedLeague(league);
            }}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {leagues.map(league => (
              <option key={league._id} value={league._id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          {showCreateForm ? 'Cancel' : '+ Create Tournament'}
        </button>
      </div>

      {showCreateForm && selectedLeague && (
  <CreateTournamentWithSponsorship
    league={selectedLeague}
    onComplete={() => {
      setShowCreateForm(false);
      loadTournaments(selectedLeague._id);
    }}
    onCancel={() => setShowCreateForm(false)}
  />
)}

      {tournaments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Tournaments Yet</h3>
          <p className="text-gray-600">Create your first tournament for {selectedLeague?.name}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(tournament => (
            <div key={tournament._id} className="bg-white p-5 rounded-lg shadow border-2 border-blue-100">
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
                  <span className="text-gray-500">📋 Style:</span>
                  <span className="font-semibold">{tournament.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">👥 Players:</span>
                  <span className="font-semibold">{tournament.players?.length || 0} / {tournament.maxPlayers}</span>
                </div>
                {tournament.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">📅 Start:</span>
                    <span className="font-semibold">{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                )}
                {tournament.winners && tournament.winners.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">🏆 Winner:</span>
                    <span className="font-semibold">{tournament.winners[0]?.name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// Add this function at the end of your LeagueOwnerDashboard.jsx file
// This is the complete multi-step tournament creation component

function CreateTournamentWithSponsorship({ league, onComplete, onCancel }) {
  //League prop validation
  if (!league || !league._id) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h3 className="text-xl font-bold mb-2">No League Selected</h3>
          <p className="text-gray-600 mb-4">Please select a league first.</p>
          <button onClick={onCancel} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }
  const [step, setStep] = useState(1);
  const [tournamentId, setTournamentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    style: 'RoundRobin',
    maxPlayers: 16,
    applicationStartDate: '',
    applicationEndDate: '',
    playStartDate: '',
    playEndDate: ''
  });
  const [seekSponsorship, setSeekSponsorship] = useState(false);
  const [advertisers, setAdvertisers] = useState([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState([]);
  const [sponsorshipResponses, setSponsorshipResponses] = useState([]);
  const [interestGroups, setInterestGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [flatFee, setFlatFee] = useState(500);

  // Step 1: Create tournament
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetchWithAuth(`/league/${league._id}/tournament`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setTournamentId(response._id);
      setStep(2);
    } catch (err) {
      alert('Error creating tournament: ' + err.message);
    }
  };

  // Load advertisers when sponsorship is sought
  useEffect(() => {
    if (step === 2 && seekSponsorship && advertisers.length === 0) {
      loadAdvertisers();
    }
  }, [step, seekSponsorship]);

//Load Advertisers
  const loadAdvertisers = useCallback(async () => {
  try {
    const data = await fetchWithAuth(`/league/${league._id}/interested-advertisers`);
    setAdvertisers(data);
  } catch (err) {
    console.error('Error loading advertisers:', err);
  }
}, [league._id]);

useEffect(() => {
  if (step === 2 && seekSponsorship && advertisers.length === 0) {
    loadAdvertisers();
  }
}, [step, seekSponsorship, advertisers.length, loadAdvertisers]);

//Load Hanlde Request Sponsorships
  const handleRequestSponsorships = async () => {
  try {
    const response = await fetchWithAuth(`/tournament/${tournamentId}/request-sponsorships`, {
      method: 'POST',
      body: JSON.stringify({ advertiserIds: selectedAdvertisers })
    });
    
    setFlatFee(response.flatFee);
    alert('Sponsorship requests sent!');
    
    // Poll for responses
    const pollResponses = async () => {
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const data = await fetchWithAuth(`/tournament/${tournamentId}/sponsorship-responses`);
          if (data && data.length > 0) {
            setSponsorshipResponses(data);
            return;
          }
        } catch (err) {
          console.error('Error polling responses:', err);
        }
      }
      // After 10 seconds, load whatever we have
      loadSponsorshipResponses();
    };
    pollResponses();
  } catch (err) {
    alert('Error requesting sponsorships: ' + err.message);
  }
};

// Load Sponsorship Responses
  const loadSponsorshipResponses = async () => {
    try {
      const data = await fetchWithAuth(`/tournament/${tournamentId}/sponsorship-responses`);
      setSponsorshipResponses(data);
    } catch (err) {
      console.error('Error loading responses:', err);
    }
  };

  //Handle Select Sponsor
  const handleSelectSponsor = async (advertiserId) => {
    try {
      await fetchWithAuth(`/tournament/${tournamentId}/select-sponsor`, {
        method: 'POST',
        body: JSON.stringify({ advertiserId })
      });
      
      alert('Exclusive sponsor selected!');
      setStep(3);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
//Handle Skip Sponsorship
  const handleSkipSponsorship = async () => {
    try {
      await fetchWithAuth(`/tournament/${tournamentId}/skip-sponsorship`, {
        method: 'POST'
      });
      setStep(3);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Load Interest Groups
  const loadInterestGroups = useCallback(async () => {
  try {
    const data = await fetchWithAuth('/interest-groups');
    setInterestGroups(data);
  } catch (err) {
    console.error('Error loading interest groups:', err);
  }
}, []);
  // Load interest groups for step 3
  useEffect(() => {
  if (step === 3 && interestGroups.length === 0) {
    loadInterestGroups();
  }
}, [step, interestGroups.length, loadInterestGroups]);


// Handle Notify Groups
  const handleNotifyGroups = async () => {
    try {
      await fetchWithAuth(`/tournament/${tournamentId}/notify-groups`, {
        method: 'POST',
        body: JSON.stringify({ groupIds: selectedGroups })
      });
      
      alert('Tournament created successfully!');
      onComplete();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`flex-1 text-center ${step >= 1 ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'border-purple-600 bg-purple-100' : 'border-gray-300'
            }`}>1</div>
            <div className="mt-2 text-sm">Basic Info</div>
          </div>
          <div className="flex-1 h-1 bg-gray-300 relative">
            {step >= 2 && <div className="absolute inset-0 bg-purple-600"></div>}
          </div>
          <div className={`flex-1 text-center ${step >= 2 ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
              step >= 2 ? 'border-purple-600 bg-purple-100' : 'border-gray-300'
            }`}>2</div>
            <div className="mt-2 text-sm">Sponsorship</div>
          </div>
          <div className="flex-1 h-1 bg-gray-300 relative">
            {step >= 3 && <div className="absolute inset-0 bg-purple-600"></div>}
          </div>
          <div className={`flex-1 text-center ${step >= 3 ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
              step >= 3 ? 'border-purple-600 bg-purple-100' : 'border-gray-300'
            }`}>3</div>
            <div className="mt-2 text-sm">Notification</div>
          </div>
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit}>
          <h3 className="text-2xl font-bold mb-6">Tournament Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style *</label>
              <select
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="RoundRobin">Round Robin</option>
                <option value="DoubleRoundRobin">Double Round Robin</option>
                <option value="SingleElimination">Single Elimination</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Players *</label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="4"
                max="128"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Start *</label>
              <input
                type="date"
                value={formData.applicationStartDate}
                onChange={(e) => setFormData({...formData, applicationStartDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application End *</label>
              <input
                type="date"
                value={formData.applicationEndDate}
                onChange={(e) => setFormData({...formData, applicationEndDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Play Start *</label>
              <input
                type="date"
                value={formData.playStartDate}
                onChange={(e) => setFormData({...formData, playStartDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Play End *</label>
              <input
                type="date"
                value={formData.playEndDate}
                onChange={(e) => setFormData({...formData, playEndDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Next: Sponsorship
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Sponsorship */}
      {step === 2 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Sponsorship Options</h3>
          
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={seekSponsorship}
                onChange={(e) => setSeekSponsorship(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-lg">Seek exclusive sponsorship?</span>
            </label>
            <p className="text-sm text-gray-600 mt-2">
              Exclusive sponsors pay ${flatFee} flat fee.
            </p>
          </div>

          {!seekSponsorship ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Random ads will be displayed.</p>
              <button
                onClick={handleSkipSponsorship}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Continue Without Sponsorship
              </button>
            </div>
          ) : advertisers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No advertisers interested yet.</p>
              <button
                onClick={handleSkipSponsorship}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Continue Without Sponsorship
              </button>
            </div>
          ) : sponsorshipResponses.length === 0 ? (
            <div>
              <h4 className="font-bold mb-4">Select Advertisers:</h4>
              <div className="space-y-3 mb-6">
                {advertisers.map(adv => (
                  <label key={adv._id} className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedAdvertisers.includes(adv._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAdvertisers([...selectedAdvertisers, adv._id]);
                        } else {
                          setSelectedAdvertisers(selectedAdvertisers.filter(id => id !== adv._id));
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{adv.companyName}</div>
                      <div className="text-sm text-gray-600">Balance: ${adv.account?.balance.toFixed(2)}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSkipSponsorship}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleRequestSponsorships}
                  disabled={selectedAdvertisers.length === 0}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  Request ({selectedAdvertisers.length})
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-bold mb-4">Responses:</h4>
              <div className="space-y-3 mb-6">
                {sponsorshipResponses.map(resp => (
                  <div key={resp._id} className="p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{resp.advertiser?.companyName}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        resp.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        resp.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {resp.status}
                      </span>
                    </div>
                    {resp.status === 'accepted' && (
                      <button
                        onClick={() => handleSelectSponsor(resp.advertiser._id)}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium mt-2"
                      >
                        Select as Sponsor
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleSkipSponsorship}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Continue Without Sponsor
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Notify Groups */}
      {step === 3 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Notify Interest Groups</h3>
          
          <p className="text-gray-600 mb-4">Select groups to notify:</p>

          <div className="space-y-3 mb-6">
            {interestGroups.map(group => (
              <label key={group._id} className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGroups([...selectedGroups, group._id]);
                    } else {
                      setSelectedGroups(selectedGroups.filter(id => id !== group._id));
                    }
                  }}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-gray-600">{group.members?.length || 0} members</div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleNotifyGroups}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Complete Tournament Creation
          </button>
        </div>
      )}
    </div>
  );
}