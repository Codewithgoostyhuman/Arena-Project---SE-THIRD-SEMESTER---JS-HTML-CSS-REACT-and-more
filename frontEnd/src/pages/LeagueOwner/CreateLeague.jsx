import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
export default function CreateLeague({ setActiveTab,fetchWithAuth }) {
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