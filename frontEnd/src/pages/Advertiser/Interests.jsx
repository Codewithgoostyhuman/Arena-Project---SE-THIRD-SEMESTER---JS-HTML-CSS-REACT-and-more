import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

export default function Interests({ profile, loadProfile,fetchWithAuth }) {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

 

// Sync selected leagues ONLY when profile changes meaningfully
useEffect(() => {
  if (profile?.leaguesOfInterest) {
    const ids = profile.leaguesOfInterest.map(l => l._id || l);
    setSelectedLeagues(ids);
  }
}, [profile?.leaguesOfInterest]);

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
 // Load leagues ONCE
useEffect(() => {
  if (profile?.leaguesOfInterest) {
    const ids = profile.leaguesOfInterest.map(l => l._id || l);
    setSelectedLeagues(ids);
  }
}, [profile?.leaguesOfInterest]); 

useEffect(() => {
  loadLeagues();

}, []); 
  const handleSave = async () => {
    try {
      await fetchWithAuth('/advertiser/profile', {
        method: 'PUT',
        body: JSON.stringify({
          companyName: profile.companyName,
          leaguesOfInterest: selectedLeagues
        })
      });
      alert('Interests updated successfully!');
      loadProfile();
    } catch (err) {
      alert('Error updating interests: ' + err.message);
    }
  };

  const toggleLeague = (leagueId) => {
    if (selectedLeagues.includes(leagueId)) {
      setSelectedLeagues(selectedLeagues.filter(id => id !== leagueId));
    } else {
      setSelectedLeagues([...selectedLeagues, leagueId]);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">League Interests for Exclusive Sponsorships</h2>
      
      <p className="text-gray-600 mb-6">
        Select leagues you're interested in sponsoring exclusively. League owners will see your interest when creating tournaments.
      </p>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {leagues.map(league => (
            <label 
              key={league._id} 
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedLeagues.includes(league._id) 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedLeagues.includes(league._id)}
                onChange={() => toggleLeague(league._id)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div className="font-bold">{league.name}</div>
                <div className="text-sm text-gray-600">
                  {league.game?.name} • {league.players?.length || 0} players
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedLeagues.length} league{selectedLeagues.length !== 1 ? 's' : ''} selected
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Save Interests
          </button>
        </div>
      </div>

      {selectedLeagues.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div className="flex-1">
              <div className="font-medium text-blue-900">How it works:</div>
              <p className="text-sm text-blue-800 mt-1">
                When league owners create tournaments in these leagues, they'll see your company in their list of 
                potential exclusive sponsors. They can then send you sponsorship requests, which you can accept or decline.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}