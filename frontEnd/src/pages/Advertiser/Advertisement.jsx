import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
export default function Advertisements({fetchWithAuth}) {
  const [ads, setAds] = useState([]);
  const [games, setGames] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    game: ''
  });
const loadData = async () => {
    try {
      const [adsData, gamesData] = await Promise.all([
        fetchWithAuth('/advertiser/advertisements'),
        fetchWithAuth('/games')
      ]);
      setAds(adsData);
      setGames(gamesData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetchWithAuth('/advertiser/advertisement', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Advertisement created! Awaiting operator approval.');
      setShowForm(false);
      setFormData({ title: '', imageUrl: '', targetUrl: '', game: '' });
      loadData();
    } catch (err) {
      alert('Error creating advertisement: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this advertisement?')) return;
    
    try {
      await fetchWithAuth(`/advertiser/advertisement/${id}`, {
        method: 'DELETE'
      });
      loadData();
    } catch (err) {
      alert('Error deleting advertisement');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Advertisements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          {showForm ? 'Cancel' : '+ Create Advertisement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-bold mb-4">Create Advertisement</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target URL *</label>
            <input
              type="url"
              value={formData.targetUrl}
              onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://yourwebsite.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Game (Optional)</label>
            <select
              value={formData.game}
              onChange={(e) => setFormData({...formData, game: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Games</option>
              {games.map(game => (
                <option key={game._id} value={game._id}>{game.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
          >
            Create Advertisement
          </button>
        </form>
      )}

      {ads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Advertisements</h3>
          <p className="text-gray-600">Create your first advertisement to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad._id} className="bg-white p-5 rounded-lg shadow border-2 border-purple-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold">{ad.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ad.status === 'active' ? 'bg-green-100 text-green-700' :
                  ad.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ad.status}
                </span>
              </div>

              <img 
                src={ad.imageUrl} 
                alt={ad.title}
                className="w-full h-32 object-cover rounded mb-3"
                onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Ad+Image'}
              />

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">👁️ Impressions:</span>
                  <span className="font-semibold">{ad.impressions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">👆 Clicks:</span>
                  <span className="font-semibold">{ad.clicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">📊 CTR:</span>
                  <span className="font-semibold">{ad.ctr}%</span>
                </div>
                {ad.game && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">🎮 Game:</span>
                    <span className="font-semibold">{ad.game.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(ad._id)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
