import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

// Public fetch - no authentication required
const fetchPublic = async (url) => {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};
// ============================================
// LIVE MATCHES
// ============================================
export default function SpectatorDashboard() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="px-10 py-6">
          <h1 className="text-4xl font-bold">🎮 Arena Spectator View</h1>
          <p className="text-blue-100 mt-2">Watch live matches and explore player statistics</p>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-10 py-5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'live'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-red-600'
            }`}
          >
            🔴 Live Matches
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'tournaments'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            🏆 Tournaments
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'past'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            📜 Past Matches
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'players'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-green-600'
            }`}
          >
            👥 Player Stats
          </button>
          <button
            onClick={() => setActiveTab('leagues')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'leagues'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-600'
            }`}
          >
            🎯 Leagues
          </button>
        </div>
      </nav>

      <main className="p-10">
        {activeTab === 'live' && <LiveMatches />}
        {activeTab === 'tournaments' && <TournamentsView />}
        {activeTab === 'past' && <PastMatches />}
        {activeTab === 'players' && <PlayerStats />}
        {activeTab === 'leagues' && <LeaguesView />}
      </main>
    </div>
  );
}

// ============================================
// LIVE MATCHES
// ============================================
function LiveMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
// To show up to date live matches
  useEffect(() => {
    loadLiveMatches();
    const interval = setInterval(loadLiveMatches, 5000); //Refreshes every 5 seconds
    return () => clearInterval(interval);
  }, []);
// Loead live matches
  const loadLiveMatches = async () => {
    try {
      // This endpoint should return ongoing matches
      const data = await fetchPublic('/matches/live');
      setMatches(data);
    } catch (err) {
      console.error('Error loading live matches:', err);
      setMatches([]); // Mock data for demo
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading live matches...</div>;

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold mb-2">No Live Matches</h2>
        <p className="text-gray-600">Check back later or explore past matches and player stats!</p>
      </div>
    );
  }
//Component - Live Matches - HTML CSS
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🔴 Live Matches</h2>
        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium animate-pulse">
          {matches.length} Live Now
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map(match => (
          <div key={match._id} className="bg-white rounded-lg shadow-lg border-2 border-red-200 overflow-hidden">
            <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
              <span className="font-bold">🔴 LIVE</span>
              <span className="text-sm">{match.tournament?.name}</span>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{match.players[0]?.name}</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">{match.score?.player1 || 0}</div>
                </div>
                
                <div className="text-3xl font-bold text-gray-400 px-4">VS</div>
                
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{match.players[1]?.name}</div>
                  <div className="text-4xl font-bold text-red-600 mt-2">{match.score?.player2 || 0}</div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 mb-4">
                {match.game?.name} • {match.status}
              </div>

              <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                Watch Match
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TOURNAMENTS VIEW
// ============================================
function TournamentsView() {
  const [tournaments, setTournaments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, ongoing, upcoming, finished
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await fetchPublic('/tournaments');
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'upcoming')
  return ['upcoming', 'open_for_applications'].includes(t.status);
    return t.status === filter;
  });

  if (loading) return <div className="text-center py-10">Loading tournaments...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🏆 Tournaments</h2>
        <div className="flex gap-2">
          {['all', 'ongoing', 'upcoming', 'finished'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredTournaments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Tournaments</h3>
          <p className="text-gray-600">No {filter} tournaments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <div key={tournament._id} className="bg-white rounded-lg shadow border-2 border-blue-100 p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold">{tournament.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tournament.status === 'ongoing' ? 'bg-orange-100 text-orange-700' :
                  tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {tournament.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">🏆 League:</span>
                  <span className="font-semibold">{tournament.league?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">🎮 Game:</span>
                  <span className="font-semibold">{tournament.league?.game?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">👥 Players:</span>
                  <span className="font-semibold">{tournament.players?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">📋 Style:</span>
                  <span className="font-semibold">{tournament.style}</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                View Bracket
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// PAST MATCHES
// ============================================
function PastMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPastMatches();
  }, []);

  const loadPastMatches = async () => {
    try {
      const data = await fetchPublic('/matches/past');
      setMatches(data);
    } catch (err) {
      console.error('Error loading past matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match =>
    match.players.some(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    match.tournament?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-10">Loading past matches...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📜 Match History</h2>
        <input
          type="text"
          placeholder="Search by player or tournament..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
        />
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
          <p className="text-gray-600">Try a different search term.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player 1</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player 2</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMatches.map(match => (
                <tr key={match._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(match.playedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{match.tournament?.name}</td>
                  <td className="px-6 py-4 text-sm font-medium">{match.players[0]?.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg">
                      {match.score?.player1 || 0} - {match.score?.player2 || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{match.players[1]?.name}</td>
                  <td className="px-6 py-4">
                    {match.winner ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        🏆 {match.winner.name}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        Draw
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================
// PLAYER STATS
// ============================================
function PlayerStats() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('points'); // points, wins, winRate

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const data = await fetchPublic('/users');
      // Filter only players with stats
      const playersWithStats = data.filter(u => u.role === 'player' && u.stats);
      setPlayers(playersWithStats);
    } catch (err) {
      console.error('Error loading players:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'points') return (b.stats.points || 0) - (a.stats.points || 0);
    if (sortBy === 'wins') return (b.stats.wins || 0) - (a.stats.wins || 0);
    if (sortBy === 'winRate') {
      const aRate = a.stats.wins / (a.stats.wins + a.stats.losses) || 0;
      const bRate = b.stats.wins / (b.stats.wins + b.stats.losses) || 0;
      return bRate - aRate;
    }
    return 0;
  });

  if (loading) return <div className="text-center py-10">Loading player stats...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">👥 Player Leaderboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('points')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'points' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            By Points
          </button>
          <button
            onClick={() => setSortBy('wins')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'wins' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            By Wins
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'winRate' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            By Win Rate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Points</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Wins</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Losses</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Draws</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPlayers.map((player, index) => {
              const winRate = player.stats.wins / (player.stats.wins + player.stats.losses) || 0;
              return (
                <tr key={player._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">
                    {index < 3 ? (
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="font-bold text-gray-600">#{index + 1}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-lg">{player.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-green-600">{player.stats.points || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold">{player.stats.wins || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold">{player.stats.losses || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold">{player.stats.draws || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold">{(winRate * 100).toFixed(1)}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// LEAGUES VIEW
// ============================================
function LeaguesView() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const data = await fetchPublic('/leagues');
      setLeagues(data.filter(l => l.status === 'active'));
    } catch (err) {
      console.error('Error loading leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading leagues...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🎯 Active Leagues</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map(league => (
          <div key={league._id} className="bg-white rounded-lg shadow border-2 border-orange-100 p-5">
            <h3 className="text-xl font-bold mb-3">{league.name}</h3>
            
            {league.description && (
              <p className="text-gray-600 text-sm mb-4">{league.description}</p>
            )}

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">🎮 Game:</span>
                <span className="font-semibold">{league.game?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">👤 Owner:</span>
                <span className="font-semibold">{league.owner?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">👥 Players:</span>
                <span className="font-semibold">{league.players?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">🏆 Tournaments:</span>
                <span className="font-semibold">{league.tournaments?.length || 0}</span>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium">
              View Leaderboard
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}