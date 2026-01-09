import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
import CreateTournamentWithSponsorship from './CreateTournamentWithSponsorship';
export default function Tournaments({ selectedLeague, setSelectedLeague ,fetchWithAuth }) {
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
    fetchWithAuth={fetchWithAuth}
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