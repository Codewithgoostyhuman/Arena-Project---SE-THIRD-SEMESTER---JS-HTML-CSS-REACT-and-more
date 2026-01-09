import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
export default function MyLeagues({ setSelectedLeague, setActiveTab ,fetchWithAuth}) {
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
